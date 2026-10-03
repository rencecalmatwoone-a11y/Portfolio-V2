"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "@/components/sections/Hero.module.css";

type SignatureState = "idle" | "writing" | "complete" | "exiting";

const signatureHold = 220;

export function SignatureName({ name }: { name: string }) {
  const maskId = useId();
  const [state, setState] = useState<SignatureState>("idle");
  const hovered = useRef(false);
  const focused = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function finishForReducedMotion() {
      if (!motion.matches) return;
      setState((current) => current === "exiting" ? "idle" : current === "writing" ? "complete" : current);
      if (!hovered.current && !focused.current) {
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setState("idle"), signatureHold);
      }
    }
    motion.addEventListener("change", finishForReducedMotion);
    return () => {
      motion.removeEventListener("change", finishForReducedMotion);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function startWriting() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (state === "writing") return;
    setState(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "complete" : "writing");
  }

  function restoreName() {
    if (hovered.current || focused.current) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    // Keep the finished ink visible briefly after a short hover or tap.
    resetTimer.current = setTimeout(() => {
      setState(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "idle" : "exiting");
    }, signatureHold);
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
        onPointerLeave={() => {
          hovered.current = false;
          if (state === "complete") restoreName();
        }}
        onFocus={() => {
          focused.current = true;
          startWriting();
        }}
        onBlur={() => {
          focused.current = false;
          if (state === "complete") restoreName();
        }}
        onClick={startWriting}
      >
        <span className={styles.nameText} aria-hidden="true">{name}</span>
        <svg
          className={styles.signature}
          viewBox="231 9 233 177"
          aria-hidden="true"
          focusable="false"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setState("idle");
          }}
        >
          <defs>
            <mask
              id={maskId}
              x="231"
              y="9"
              width="233"
              height="177"
              maskUnits="userSpaceOnUse"
            >
              <polyline
                className={styles.signatureWritingStroke}
                points="245,154 255,151 270,145 285,136 302,124 319,111 335,101 336,91 341,78 348,63 357,47 368,32 378,22 383,20 387,24 387,31 382,42 375,54 365,67 350,84 336,101 335,110 340,120 348,129 360,139 372,149 377,156 376,161 368,167 354,171 338,174 326,173 318,169 315,162 318,154 325,144 335,134 349,122 365,111 385,99 406,88 402,96 395,108 389,120 385,130 388,133 396,132 407,127 419,119 429,113 433,114 438,121 442,126 446,124 450,115"
                pathLength="1"
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                onAnimationEnd={() => {
                  setState("complete");
                  restoreName();
                }}
              />
            </mask>
          </defs>
          <image
            href="/images/hero/rence-signature.png"
            width="818"
            height="198"
            mask={`url(#${maskId})`}
          />
        </svg>
      </button>
      <span className={styles.period}>.</span>
    </span>
  );
}
