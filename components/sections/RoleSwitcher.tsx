"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

type RoleSwitcherProps = {
  roles: readonly string[];
};

export function RoleSwitcher({ roles }: RoleSwitcherProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [selectionSize, setSelectionSize] = useState("0 × 0");
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const roleTextRef = useRef<HTMLSpanElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (roles.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let transitionTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setIsVisible(false);
      transitionTimeout = window.setTimeout(() => {
        setRoleIndex((index) => (index + 1) % roles.length);
        setIsVisible(true);
      }, 320);
    }, 3200);

    return () => {
      window.clearInterval(interval);
      if (transitionTimeout !== undefined) {
        window.clearTimeout(transitionTimeout);
      }
    };
  }, [roles]);

  useEffect(() => {
    const element = roleTextRef.current;
    if (!element) {
      return;
    }

    const updateSelectionSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setSelectionSize(`${Math.round(width)} × ${Math.round(height)}`);
    };

    updateSelectionSize();

    const resizeObserver = new ResizeObserver(updateSelectionSize);
    resizeObserver.observe(element);

    window.addEventListener("resize", updateSelectionSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSelectionSize);
    };
  }, [roleIndex]);

  const activeRole = `${roles[roleIndex]}.`;

  const handlePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging) {
      return;
    }

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;

    setDragOffset({
      x: Math.max(-18, Math.min(18, dx * 0.15)),
      y: Math.max(-12, Math.min(12, dy * 0.15)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <span
      className={`${styles.role} ${styles.roleSwitcher}`}
      data-visible={isVisible}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <span ref={roleTextRef} className={styles.roleText} aria-live="polite">
        {activeRole.split("").map((letter, index) => (
          <span
            key={`${roleIndex}-${index}`}
            className={letter === " " ? undefined : styles.roleLetter}
            style={letter === " " ? undefined : { animationDelay: `${index * 24}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>

      <span
        className={`${styles.selectionFrame} ${isDragging ? styles.selectionFrameDragging : ""}`}
        aria-hidden="true"
        style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
      >
        <span className={styles.selectionHandle} data-position="top-left" />
        <span className={styles.selectionHandle} data-position="top-right" />
        <span className={styles.selectionHandle} data-position="bottom-left" />
        <span className={styles.selectionHandle} data-position="bottom-right" />
        <span className={styles.selectionDimensions}>{selectionSize}</span>
      </span>
    </span>
  );
}