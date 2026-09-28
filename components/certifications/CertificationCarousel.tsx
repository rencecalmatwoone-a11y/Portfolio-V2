"use client";

import { Children, useRef, useState, useSyncExternalStore, type ReactNode, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./Certifications.module.css";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function CertificationCarousel({ children, titles }: { children: ReactNode; titles: string[] }) {
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [active, setActive] = useState(0);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClick = useRef(false);
  const carousel = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const total = slides.length;

  function move(index: number) {
    // Keep focus out of a slide that is about to become inert.
    if (carousel.current?.querySelector('[data-position="active"]')?.contains(document.activeElement)) {
      carousel.current.focus({ preventScroll: true });
    }
    setActive((index + total) % total);
  }

  function endGesture(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClick.current = true;
      move(active + (dx < 0 ? 1 : -1));
    }
  }

  return (
    <div ref={carousel} className={styles.carousel} data-enhanced={enhanced} tabIndex={enhanced && total > 1 ? 0 : undefined}
      role="group" aria-roledescription={enhanced ? "carousel" : undefined} aria-label="Certification collection"
      aria-describedby={enhanced && total > 1 ? "certification-instructions" : undefined}
      onKeyDown={(event) => {
        if (!enhanced || total < 2 || event.altKey || event.ctrlKey || event.metaKey) return;
        const destination = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: total - 1 }[event.key];
        if (destination !== undefined) { event.preventDefault(); move(destination); }
      }}>
      <div id="certification-slides" className={styles.stage}
        onPointerDown={(event) => {
          suppressClick.current = false;
          if (!enhanced || total < 2 || !event.isPrimary || event.button !== 0) return;
          gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
          if (!(event.target as HTMLElement).closest("a, button")) event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={endGesture}
        onPointerCancel={() => { gesture.current = null; }}
        onLostPointerCapture={() => { gesture.current = null; }}
        onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
        onDragStart={(event) => event.preventDefault()}>
        {slides.map((slide, index) => {
          const position = index === active ? "active" : index === (active + 1) % total ? "next" : index === (active - 1 + total) % total ? "previous" : "hidden";
          return (
            <div key={index} className={styles.slide} data-position={position}
              role="group" aria-roledescription={enhanced ? "slide" : undefined} aria-label={`${index + 1} of ${total}`}
              inert={enhanced && index !== active} aria-hidden={enhanced && index !== active ? true : undefined}>
              {slide}
            </div>
          );
        })}
      </div>
      {enhanced && total > 1 && (
        <>
          <div className={styles.controls}>
            <button type="button" aria-label="Previous certification" aria-controls="certification-slides" onClick={() => move(active - 1)}>
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div className={styles.current} aria-live="polite" aria-atomic="true">
              <span className={styles.count}>{active + 1} / {total}</span>
              <span>{titles[active]}</span>
            </div>
            <button type="button" aria-label="Next certification" aria-controls="certification-slides" onClick={() => move(active + 1)}>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <p id="certification-instructions" className={styles.hint}>Swipe or drag to explore. <span>Use the arrows or arrow keys.</span></p>
        </>
      )}
    </div>
  );
}
