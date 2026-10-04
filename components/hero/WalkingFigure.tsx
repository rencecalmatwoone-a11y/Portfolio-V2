"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import styles from "./WalkingFigure.module.css";

const phases = ["walk-right", "stand-right", "walk-left", "stand-left"] as const;
const strideDuration = 720;
const strideFrames = ["50% 0", "100% 0", "0 100%", "50% 100%", "100% 100%", "0 0"];

export function WalkingFigure({ variant = "walker" }: { variant?: "walker" | "gif" }) {
  const isWalker = variant === "walker";
  const trackRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState(0);
  const bubbleId = useId();
  const [activeFigure, setActiveFigure] = useState<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const positionBubble = (figure: HTMLElement) => {
    const bounds = figure.getBoundingClientRect();
    const track = trackRef.current?.getBoundingClientRect();
    const tooltip = figure.querySelector<HTMLElement>('[role="tooltip"]');
    if (!track || !tooltip) return;
    const width = Math.min(240, track.width);
    const side = "top";
    const left = Math.max(track.left - bounds.left, Math.min((bounds.width - width) / 2, track.right - bounds.left - width));
    tooltip.dataset.side = side;
    tooltip.style.left = `${left}px`;
    tooltip.style.width = `${width}px`;
    tooltip.style.setProperty("--bubble-tip", `${bounds.width / 2 - left}px`);
  };

  const showBubble = (figure: HTMLElement) => {
    if (!isWalker) return;
    positionBubble(figure);
    setActiveFigure(figure);
    setDismissed(false);
  };

  useEffect(() => {
    if (!activeFigure || dismissed) return;
    let frame: number;
    const update = () => {
      positionBubble(activeFigure);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [activeFigure, dismissed]);

  const bubble = (id: string) => (
    <span id={id} role="tooltip" className={styles.bubble} data-dismissed={dismissed}>
      I&apos;m just casually walking while listening to Frank Ocean.
    </span>
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let inView = false;
    const updateVisibility = () => setVisible(inView && !document.hidden);
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateVisibility();
    });
    // Keep the same walking speed across desktop and mobile track widths.
    const resize = isWalker ? new ResizeObserver(() => {
      const figureSize = parseFloat(getComputedStyle(track).height);
      const figureWidth = track.querySelector("button")?.offsetWidth ?? figureSize;
      const distance = Math.max(0, track.clientWidth - figureWidth);
      const strideSeconds = strideDuration / 1000;
      const strides = Math.max(1, Math.round(distance / (figureSize * 0.65 * strideSeconds)));
      const duration = strides * strideSeconds;
      track.style.setProperty("--walk-duration", `${duration}s`);
    }) : undefined;

    intersection.observe(track);
    resize?.observe(track);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      intersection.disconnect();
      resize?.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [isWalker]);

  const running = visible && !paused;
  const label = `${paused ? "Resume" : "Pause"} ${isWalker ? "walking" : "GIF"} animation`;

  return (
    <div
      ref={trackRef}
      className={styles.track}
      style={{ "--stride-duration": `${strideDuration}ms` } as CSSProperties}
      data-walking-figure={isWalker ? "" : undefined}
      data-quote-gif={!isWalker ? "" : undefined}
      data-variant={variant}
      aria-hidden={isWalker ? undefined : true}
      data-running={running}
      data-phase={isWalker ? phases[phase] : undefined}
    >
      <div className={styles.runway}>
        <div
          className={styles.traveler}
          onAnimationEnd={(event) => {
            if (isWalker && event.target === event.currentTarget) {
              setPhase((value) => (value + 1) % phases.length);
            }
          }}
        >
          <button
            type="button"
            className={styles.figure}
            aria-label={label}
            aria-describedby={isWalker ? bubbleId : undefined}
            tabIndex={isWalker ? undefined : -1}
            onPointerEnter={(event) => showBubble(event.currentTarget)}
            onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) setActiveFigure(null); }}
            onFocus={(event) => showBubble(event.currentTarget)}
            onBlur={(event) => { if (!event.currentTarget.matches(":hover")) setActiveFigure(null); }}
            onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}
            onClick={() => setPaused((value) => !value)}
          >
            <span className={styles.sprite} aria-hidden="true">
              {isWalker && strideFrames.map((position, index) => (
                <span
                  key={position}
                  className={styles.pose}
                  style={{
                    backgroundPosition: position,
                    animationDelay: `${((index - strideFrames.length) % strideFrames.length) * strideDuration / strideFrames.length}ms`,
                  }}
                />
              ))}
            </span>
            {isWalker && bubble(bubbleId)}
          </button>
        </div>
      </div>
      <span
        className={styles.still}
        role="img"
        aria-label={isWalker ? "Walking figure" : "Fighting game characters"}
        aria-describedby={isWalker ? `${bubbleId}-still` : undefined}
        tabIndex={isWalker ? 0 : undefined}
        onPointerEnter={(event) => showBubble(event.currentTarget)}
        onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) setActiveFigure(null); }}
        onFocus={(event) => showBubble(event.currentTarget)}
        onBlur={(event) => { if (!event.currentTarget.matches(":hover")) setActiveFigure(null); }}
        onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}
      >
        {isWalker && bubble(`${bubbleId}-still`)}
      </span>
    </div>
  );
}
