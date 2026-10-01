"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { github, parseContributions, type ContributionDay } from "@/lib/github";
import savedActivity from "@/data/github-contributions.json";
import styles from "./GitHubActivity.module.css";

const dayFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const dateOf = (day: ContributionDay) => new Date(`${day.date}T00:00:00Z`);
const describe = (day: ContributionDay) => `${day.count.toLocaleString("en")} contribution${day.count === 1 ? "" : "s"} on ${dayFormat.format(dateOf(day))}`;

function Calendar({ days }: { days: ContributionDay[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [focused, setFocused] = useState(days.length - 1);
  const [selected, setSelected] = useState<number | null>(null);
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
                tabIndex={focused === index ? 0 : -1} aria-label={describe(day)} title={describe(day)}
                onFocus={() => { setFocused(index); setSelected(index); }} onBlur={() => setSelected(null)}
                onClick={() => setSelected(index)} onKeyDown={(event) => navigate(event, index)} />
            ))}
          </div>
        </div>
        <div className={styles.footer}>
          <p><strong>{days.reduce((total, day) => total + day.count, 0).toLocaleString("en")}</strong> contributions in the last year</p>
        </div>
      </div>
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
    async function load() {
      if (inFlight || document.visibilityState === "hidden" || Date.now() - lastStarted < 60_000) return;
      inFlight = true;
      lastStarted = Date.now();
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 15_000);
      try {
        const response = await fetch("/api/github", { signal: controller.signal });
        if (!response.ok) throw new Error("Activity unavailable");
        const contributions = parseContributions(await response.json());
        if (active) { setDays(contributions); setStatus(response.headers.get("X-Activity-Fallback") === "true" ? "error" : "ready"); }
      } catch {
        if (active) setStatus("error");
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    }
    void load();
    const refresh = () => { void load(); };
    const interval = window.setInterval(refresh, 300_000);
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
      <header className={`section-heading ${styles.header}`}>
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
