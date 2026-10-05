"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./WalkingFigure.module.css";

export function WalkingFigure({ variant = "walker" }: { variant?: "walker" | "gif" }) {
  const isWalker = variant === "walker";
  const trackRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
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
      const duration = track.clientWidth / (figureSize * 0.65);
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
      data-walking-figure={isWalker ? "" : undefined}
      data-quote-gif={!isWalker ? "" : undefined}
      data-variant={variant}
      aria-hidden={isWalker ? undefined : true}
      data-running={running}
    >
      <div className={styles.runway}>
        <div className={styles.traveler}>
          {(isWalker ? [false, true] : [false]).map((copy) => (
            <button
              key={String(copy)}
              type="button"
              className={`${styles.figure}${copy ? ` ${styles.wrapCopy}` : ""}`}
              data-wrap-copy={copy ? "" : undefined}
              aria-hidden={copy ? true : undefined}
              aria-label={label}
              aria-describedby={isWalker && !copy ? bubbleId : undefined}
              tabIndex={isWalker && !copy ? undefined : -1}
              onPointerEnter={(event) => showBubble(event.currentTarget)}
              onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) setActiveFigure(null); }}
              onFocus={(event) => showBubble(event.currentTarget)}
              onBlur={(event) => { if (!event.currentTarget.matches(":hover")) setActiveFigure(null); }}
              onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}
              onClick={() => setPaused((value) => !value)}
            >
              <span className={styles.sprite} aria-hidden="true" />
              {isWalker && bubble(copy ? `${bubbleId}-copy` : bubbleId)}
            </button>
          ))}
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
