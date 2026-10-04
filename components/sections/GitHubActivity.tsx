"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight } from "lucide-react";
import { github, parseContributions, type ContributionDay } from "@/lib/github";
import savedActivity from "@/data/github-contributions.json";
import styles from "./GitHubActivity.module.css";

const refreshInterval = 60_000;
const dayFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dateOf = (day: ContributionDay) => new Date(`${day.date}T00:00:00Z`);
const describe = (day: ContributionDay) => `${day.count.toLocaleString("en")} contribution${day.count === 1 ? "" : "s"} on ${dayFormat.format(dateOf(day))}`;
const scrambleSymbols = "!<>-_\/[]{}=+*?#";
const scramble = (text: string, revealed = 0) => Array.from(text, (character, index) =>
  character === " " || index < revealed ? character : scrambleSymbols[Math.floor(Math.random() * scrambleSymbols.length)]
).join("");

function ContributionTooltip({ day, anchor }: { day: ContributionDay; anchor: HTMLButtonElement }) {
  const label = describe(day);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? label : scramble(label));

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / 520);
      setText(scramble(label, Math.floor(Math.max(0, (progress - 0.2) / 0.8) * label.length)));
      if (progress === 1) window.clearInterval(timer);
    }, 35);
    const stop = () => {
      if (preference.matches) { window.clearInterval(timer); setText(label); }
    };
    preference.addEventListener("change", stop);
    return () => { window.clearInterval(timer); preference.removeEventListener("change", stop); };
  }, [label]);

  useLayoutEffect(() => {
    const position = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      const cell = anchor.getBoundingClientRect();
      const bounds = tooltip.getBoundingClientRect();
      const viewport = anchor.parentElement?.parentElement?.getBoundingClientRect();
      tooltip.style.visibility = viewport && (cell.right < viewport.left || cell.left > viewport.right) ? "hidden" : "visible";
      tooltip.style.left = `${Math.max(8, Math.min(window.innerWidth - bounds.width - 8, cell.left + cell.width / 2 - bounds.width / 2))}px`;
      tooltip.style.top = `${cell.top >= bounds.height + 12 ? cell.top - bounds.height - 8 : cell.bottom + 8}px`;
    };
    position();
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    return () => { window.removeEventListener("scroll", position, true); window.removeEventListener("resize", position); };
  }, [anchor, label]);

  return createPortal(
    <div ref={tooltipRef} className={styles.tooltip} aria-hidden="true">
      <span className={styles.tooltipSizer}>{label}</span>
      <span className={styles.tooltipText}>{text}</span>
    </div>, document.body
  );
}

function Calendar({ days }: { days: ContributionDay[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [focused, setFocused] = useState(days.length - 1);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<HTMLButtonElement | null>(null);
  const offset = dateOf(days[0]).getUTCDay();
  const weeks = Math.ceil((offset + days.length) / 7);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollLeft = element.scrollWidth;
    const observer = new ResizeObserver(() => { element.scrollLeft = element.scrollWidth; });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const steps: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    const next = event.key === "Home" ? 0 : event.key === "End" ? days.length - 1 :
      event.key in steps ? Math.max(0, Math.min(days.length - 1, index + steps[event.key])) : null;
    if (event.key === "Escape") { setSelected(null); return; }
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus({ preventScroll: true });
    buttons.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }

  return (
    <>
      <div className={styles.activity} style={{ "--weeks": weeks } as CSSProperties}>
        <div className={styles.scroll} ref={scrollRef}>
          <div className={styles.calendar}
            role="group" aria-label="Daily GitHub contributions. Use arrow keys to explore, Home for the first day, and End for the latest day.">
            {days.map((day, index) => (
              <button key={day.date} ref={(element) => { buttons.current[index] = element; }}
                type="button" className={styles.day} data-level={day.level}
                style={{ gridColumn: Math.floor((index + offset) / 7) + 1, gridRow: (index + offset) % 7 + 1, "--cell-index": index } as CSSProperties}
                tabIndex={focused === index ? 0 : -1} aria-label={describe(day)}
                onPointerEnter={(event) => { if (event.pointerType !== "touch") { setSelected(index); setSelectedAnchor(event.currentTarget); } }}
                onPointerLeave={() => setSelected(null)}
                onFocus={(event) => { setFocused(index); setSelected(index); setSelectedAnchor(event.currentTarget); }} onBlur={() => setSelected(null)}
                onClick={(event) => { setSelected(index); setSelectedAnchor(event.currentTarget); }} onKeyDown={(event) => navigate(event, index)} />
            ))}
          </div>
        </div>
        <div className={styles.footer}>
          <p><strong>{days.reduce((total, day) => total + day.count, 0).toLocaleString("en")}</strong> contributions in the last year</p>
        </div>
      </div>
      {selected !== null && selectedAnchor && <ContributionTooltip key={`${days[selected].date}-${days[selected].count}`} day={days[selected]} anchor={selectedAnchor} />}
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {selected === null ? "" : describe(days[selected])}
      </span>
    </>
  );
}

export function GitHubActivity() {
  const [days, setDays] = useState<ContributionDay[]>(() => parseContributions(savedActivity));
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let lastStarted = 0;
    let controller: AbortController | undefined;
    async function load(force = false) {
      if (inFlight || document.visibilityState === "hidden" || (!force && Date.now() - lastStarted < refreshInterval)) return;
      inFlight = true;
      lastStarted = Date.now();
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 15_000);
      try {
        const response = await fetch("/api/github", { cache: "no-store", signal: controller.signal });
        if (!response.ok || response.headers.get("X-Activity-Fallback") === "true") throw new Error("Activity unavailable");
        const contributions = parseContributions(await response.json());
        if (active) { setDays(contributions); setStatus("ready"); }
      } catch {
        if (active) setStatus("error");
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    }
    void load(true);
    const refresh = () => { void load(true); };
    const interval = window.setInterval(() => { void load(); }, refreshInterval);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [attempt]);

  return (
    <section id="github" className={`page-section ${styles.section}`} aria-labelledby="github-heading">
      <header className={`section-heading ${styles.header}`} data-hover-area>
        <h2 id="github-heading">GitHub activity</h2>
        <a href={github.href} target="_blank" rel="noopener noreferrer" className={styles.profile}>
          <span className={styles.githubIcon} aria-hidden="true" /><span>{github.handle}</span><ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </header>
      <Calendar key={days[0].date} days={days} />
      {status === "error" && <div className={styles.error}>
        <p role="status">Could not refresh. Showing the last available activity through {dayFormat.format(dateOf(days[days.length - 1]))}.</p>
        <button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>Try again</button>
      </div>}
      <noscript><p className={styles.noScript}>Showing saved activity. View the latest activity using the GitHub profile link.</p></noscript>
    </section>
  );
}
