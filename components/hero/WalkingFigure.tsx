"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./WalkingFigure.module.css";

const phases = ["walk-right", "stand-right", "walk-left", "stand-left"] as const;

export function WalkingFigure() {
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
    const gap = 4;
    const side = "top";
    const left = Math.max(track.left - bounds.left, Math.min((bounds.width - width) / 2, track.right - bounds.left - width));
    tooltip.dataset.side = side;
    tooltip.style.left = `${left}px`;
    tooltip.style.width = `${width}px`;
    tooltip.style.setProperty("--bubble-tip", `${bounds.width / 2 - left}px`);
  };

  const showBubble = (figure: HTMLElement) => {
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
    const resize = new ResizeObserver(() => {
      const figureSize = parseFloat(getComputedStyle(track).height);
      const distance = Math.max(0, track.clientWidth - figureSize);
      track.style.setProperty("--walk-duration", `${distance / (figureSize * 0.65)}s`);
    });

    intersection.observe(track);
    resize.observe(track);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const running = visible && !paused;
  const label = paused ? "Resume walking animation" : "Pause walking animation";

  return (
    <div
      ref={trackRef}
      className={styles.track}
      data-walking-figure
      data-running={running}
      data-phase={phases[phase]}
    >
      <div className={styles.runway}>
        <div
          className={styles.traveler}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) {
              setPhase((value) => (value + 1) % phases.length);
            }
          }}
        >
          <button
            type="button"
            className={styles.figure}
            aria-label={label}
            aria-describedby={bubbleId}
            onPointerEnter={(event) => showBubble(event.currentTarget)}
            onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) setActiveFigure(null); }}
            onFocus={(event) => showBubble(event.currentTarget)}
            onBlur={(event) => { if (!event.currentTarget.matches(":hover")) setActiveFigure(null); }}
            onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}
            onClick={() => setPaused((value) => !value)}
          >
            <span className={styles.sprite} aria-hidden="true" />
            {bubble(bubbleId)}
          </button>
        </div>
      </div>
      <span
        className={styles.still}
        role="img"
        aria-label="Walking figure"
        aria-describedby={`${bubbleId}-still`}
        tabIndex={0}
        onPointerEnter={(event) => showBubble(event.currentTarget)}
        onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) setActiveFigure(null); }}
        onFocus={(event) => showBubble(event.currentTarget)}
        onBlur={(event) => { if (!event.currentTarget.matches(":hover")) setActiveFigure(null); }}
        onKeyDown={(event) => { if (event.key === "Escape") setDismissed(true); }}
      >
        {bubble(`${bubbleId}-still`)}
      </span>
    </div>
  );
}
