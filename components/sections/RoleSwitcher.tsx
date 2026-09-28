"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

type RoleSwitcherProps = {
  roles: readonly string[];
};

export function RoleSwitcher({ roles }: RoleSwitcherProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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

  const activeRole = `${roles[roleIndex]}.`;

  return (
    <span className={`${styles.role} ${styles.roleSwitcher}`} data-visible={isVisible}>
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
  );
}