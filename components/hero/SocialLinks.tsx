"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { socials } from "@/data/socials";
import { SocialProfilePreview } from "./SocialProfilePreview";
import styles from "./SocialLinks.module.css";

type Preview = { index: number; left: number; top: number; width: number; below: boolean };
const spring = { stiffness: 260, damping: 23, mass: 0.65 };

export function SocialLinks({ className }: { className?: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const reducedMotion = useReducedMotion();
  const id = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchInput = useRef(false);
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const cardX = useTransform(x, (value) => value * 1.4);
  const cardY = useTransform(y, (value) => value * 0.65);
  const rotate = useTransform(x, (value) => value * 0.22);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function closeSoon() {
    cancelClose();
    x.set(0);
    y.set(0);
    closeTimer.current = setTimeout(() => setPreview(null), 140);
  }

  function open(index: number, element: HTMLElement) {
    cancelClose();
    const bounds = element.getBoundingClientRect();
    const width = Math.min(380, window.innerWidth - 48);
    const below = bounds.top < (socials[index].label === "X" ? 355 : 290);
    x.jump(0);
    y.jump(0);
    setPreview({
      index,
      width,
      left: Math.max(24, Math.min(bounds.left + bounds.width / 2 - width / 2, window.innerWidth - width - 24)),
      top: below ? bounds.bottom - 2 : bounds.top + 2,
      below,
    });
  }

  function follow(event: PointerEvent<HTMLElement>, amount: number) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)) * amount);
    y.set(Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)) * amount);
  }

  useEffect(() => {
    if (!preview) return;
    const dismiss = () => { setPreview(null); x.set(0); y.set(0); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [preview, x, y]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const social = preview ? socials[preview.index] : null;

  return (
    <>
      <ul className={className} aria-label="Social and email links">
        {socials.map((item, index) => (
          <li
            key={item.label}
            className={styles.item}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") open(index, event.currentTarget);
            }}
            onPointerMove={(event) => { if (preview?.index === index) follow(event, 7); }}
            onPointerLeave={closeSoon}
          >
            <motion.a
              className={styles.link}
              href={item.href}
              aria-label={item.label}
              aria-describedby={preview?.index === index ? id : undefined}
              style={{ x: preview?.index === index && !reducedMotion ? x : 0, y: preview?.index === index && !reducedMotion ? y : 0 }}
              onPointerDown={(event) => { touchInput.current = event.pointerType === "touch"; }}
              onKeyDown={() => { touchInput.current = false; }}
              onFocus={(event) => {
                if (!touchInput.current) open(index, event.currentTarget.parentElement!);
              }}
              onBlur={() => { touchInput.current = false; closeSoon(); }}
              onClick={() => setPreview(null)}
            >
              <Image className={item.monochrome ? styles.monochrome : undefined} src={item.logo} alt="" width={24} height={24} />
            </motion.a>
          </li>
        ))}
      </ul>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence mode="wait">
          {preview && social && (
            <motion.div
              key={social.label}
              className={styles.positioner}
              style={{ left: preview.left, top: preview.top, width: preview.width }}
              data-below={preview.below}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: reducedMotion ? 0 : 0.13 }}
              onPointerEnter={cancelClose}
              onPointerLeave={closeSoon}
              onPointerMove={(event) => follow(event, 5)}
            >
              <motion.div
                id={id}
                role="tooltip"
                className={styles.card}
                style={{ x: reducedMotion ? 0 : cardX, y: reducedMotion ? 0 : cardY, rotate: reducedMotion ? 0 : rotate }}
                initial={{ scale: reducedMotion ? 1 : 0.94 }}
                animate={{ scale: 1 }}
                transition={spring}
              >
                <SocialProfilePreview social={social} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
