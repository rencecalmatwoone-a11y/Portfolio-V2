// Quantized row edges keep the wipe square-edged throughout the animation.
export function pixelWipeFrames(
  width: number,
  height: number,
  toDark: boolean,
  origin = { left: 0, top: 0 },
): Keyframe[] {
  const cell = Math.max(16, Math.round(width / 48));
  const rows = Math.ceil(height / cell);
  const travel = width + height * 0.35 + cell * 8;

  return Array.from({ length: 49 }, (_, frame) => {
    const progress = frame / 48;
    const points = [`${width}px 0px`, `${width}px ${height}px`];

    for (let row = rows - 1; row >= 0; row--) {
      const stagger = ((row * 17 + row * row * 3) % 11) / 10;
      const edge = width + row * cell * 0.35 + stagger * cell * 4 - progress * travel;
      const x = frame === 0 ? width : frame === 48 ? 0 : Math.max(0, Math.min(width, Math.ceil(edge / cell) * cell));
      points.push(`${x}px ${Math.min(height, (row + 1) * cell)}px`, `${x}px ${row * cell}px`);
    }

    // Mirror the reveal when returning to light mode.
    const polygon = toDark ? points : points.map(point => {
      const [x, y] = point.split(" ");
      return `${width - parseFloat(x)}px ${y}`;
    });
    const localPolygon = polygon.map(point => {
      const [x, y] = point.split(" ");
      return `${parseFloat(x) - origin.left}px ${parseFloat(y) - origin.top}px`;
    });
    return { clipPath: `polygon(${localPolygon.join(",")})`, easing: "steps(1, end)" };
  });
}
