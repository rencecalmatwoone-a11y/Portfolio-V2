"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type SwitchProps = {
  value: boolean;
  onToggle: () => void;
  iconOn: ReactNode;
  iconOff: ReactNode;
  className?: string;
  "aria-label"?: string;
  title?: string;
  "data-theme-toggle"?: boolean;
};

export function Switch({
  value,
  onToggle,
  iconOn,
  iconOff,
  className = "",
  "aria-label": label = "Dark mode",
  title,
  "data-theme-toggle": themeToggle,
}: SwitchProps) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      title={title}
      data-theme-toggle={themeToggle || undefined}
      className={`bg-card-foreground/15 flex w-10 shrink-0 cursor-pointer rounded-full p-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 ${
        value ? "justify-end" : "justify-start"
      } ${className}`}
      onClick={onToggle}
    >
      <motion.div
        className="flex justify-center items-center size-5 rounded-full bg-background"
        aria-hidden="true"
        layout={!reduceMotion}
        transition={{ type: "spring", duration: reduceMotion ? 0 : 0.6, bounce: 0.2 }}
      >
        <motion.div
          key={value ? "on" : "off"}
          initial={reduceMotion ? false : { opacity: 0, rotate: value ? -60 : 60 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
          className="flex justify-center items-center size-4"
        >
          {value ? iconOn : iconOff}
        </motion.div>
      </motion.div>
    </button>
  );
}
