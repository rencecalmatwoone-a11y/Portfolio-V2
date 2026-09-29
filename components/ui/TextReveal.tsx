"use client";

import { Fragment, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;
const DURATION = 0.6;
const HIDDEN = { opacity: 0, y: 10, filter: "blur(8px)" } as const;
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" } as const;

export type TextRevealSplit = "word" | "character";

export type UseTextRevealOptions = {
  text: string;
  by?: TextRevealSplit;
  stagger?: number;
  maxDuration?: number;
  startOnView?: boolean;
  play?: boolean;
  once?: boolean;
  amount?: number;
};

export function useTextReveal<T extends HTMLElement = HTMLSpanElement>({
  text,
  by = "word",
  stagger = 0.055,
  maxDuration = 1.6,
  startOnView = true,
  play = true,
  once = true,
  amount = 0.35,
}: UseTextRevealOptions) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once, amount });
  const reduced = useReducedMotion();

  const { groups, step } = useMemo(() => {
    const words = text.trim().length ? text.trim().split(/\s+/) : [];
    let index = 0;
    const groups = words.map((word, wordIndex) => ({
      key: `w${wordIndex}`,
      units: (by === "character" ? Array.from(word) : [word]).map((part, partIndex) => ({
        key: `w${wordIndex}p${partIndex}`,
        text: part,
        index: index++,
      })),
    }));
    const span = Math.max(0, maxDuration - DURATION);

    return {
      groups,
      step: index > 1 ? Math.min(stagger, span / (index - 1)) : 0,
    };
  }, [text, by, stagger, maxDuration]);

  return { ref, groups, step, started: play && (!startOnView || inView), reduced: Boolean(reduced) };
}

export type TextRevealProps = UseTextRevealOptions & { className?: string };

export function TextReveal({
  text,
  by,
  stagger,
  maxDuration,
  startOnView,
  play,
  once,
  amount,
  className,
}: TextRevealProps) {
  const { ref, groups, step, started, reduced } = useTextReveal<HTMLSpanElement>({
    text, by, stagger, maxDuration, startOnView, play, once, amount,
  });

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {groups.map((group, groupIndex) => (
          <Fragment key={group.key}>
            {groupIndex > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap align-baseline">
              {group.units.map((unit) => (
                <motion.span
                  key={unit.key}
                  className="inline-block align-baseline"
                  initial={reduced ? false : HIDDEN}
                  animate={reduced || started ? SHOWN : HIDDEN}
                  transition={reduced ? { duration: 0 } : {
                    duration: DURATION,
                    ease: EASE,
                    delay: started ? unit.index * step : 0,
                  }}
                >
                  {unit.text}
                </motion.span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}

export default TextReveal;
