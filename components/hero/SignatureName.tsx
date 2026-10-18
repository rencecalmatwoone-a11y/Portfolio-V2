"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/sections/Hero.module.css";

type SignatureState = "idle" | "writing" | "complete";

export function SignatureName({ name }: { name: string }) {
  const [state, setState] = useState<SignatureState>("idle");
  const hovered = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function finishForReducedMotion() {
      if (!motion.matches) return;
      setState((current) => current === "writing" ? "complete" : current);
    }
    motion.addEventListener("change", finishForReducedMotion);
    return () => {
      motion.removeEventListener("change", finishForReducedMotion);
    };
  }, []);

  function startWriting() {
    if (state === "writing") return;
    setState(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "complete" : "writing");
  }

  function restoreName() {
    hovered.current = false;
    setState("idle");
  }

  return (
    <span className={styles.nameGroup}>
      <button
        className={styles.nameTrigger}
        type="button"
        aria-label={name}
        data-signature-state={state}
        onPointerEnter={(event) => {
          if (event.pointerType === "touch") return;
          hovered.current = true;
          startWriting();
        }}
        onPointerLeave={restoreName}
        onPointerCancel={restoreName}
      >
        <span className={styles.nameText} aria-hidden="true">{name}</span>
        <svg
          className={styles.signature}
          viewBox="231 9 233 177"
          aria-hidden="true"
          focusable="false"
        >
          {/* Draw the ink itself so crossing strokes cannot appear ahead of the pen. */}
          <path
            className={styles.signatureWritingStroke}
            d="M245 154
              C273 149 308 125 335 103
              C335 80 357 45 375 26
              C382 19 386 20 387 25
              C391 43 368 75 335 103
              C333 121 355 133 370 148
              C377 154 380 158 373 163
              C365 169 331 177 320 172
              C311 168 313 157 322 147
              C337 130 378 103 405 89
              C399 98 392 113 387 124
              C384 129 384 133 390 132
              C403 130 416 120 426 114
              C431 111 433 118 437 123
              C441 131 445 123 449 115"
            pathLength="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            onAnimationEnd={() => {
              if (hovered.current) setState("complete");
            }}
          />
        </svg>
      </button>
      <span className={styles.period}>.</span>
    </span>
  );
}
