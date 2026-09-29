"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import styles from "./ClosingQuote.module.css";
import { DotGridPattern } from "@/components/background-pattern/dot-grid-pattern";
import { TextReveal } from "@/components/ui/TextReveal";
import { CinematicBanner } from "./CinematicBanner";

const quote = "Negative things are just a part of positive outcomes";

export function ClosingQuote() {
	const [revealed, setRevealed] = useState(false);
	const quoteRef = useRef<HTMLQuoteElement>(null);

	useEffect(() => {
		if (revealed) quoteRef.current?.focus({ preventScroll: true });
	}, [revealed]);

	return (
		<section className={`page-section ${styles.section}`} aria-label="A personal quote">
			<div className={styles.quoteBand}>
				{!revealed && (
					<button className={`${styles.revealButton} keycap`} type="button" onClick={() => setRevealed(true)}>
						Reveal quote
					</button>
				)}
				<blockquote ref={quoteRef} className={styles.quote} hidden={!revealed} tabIndex={-1}>
					<div className={styles.quoteLine}>
						<div className={styles.quoteMarks} aria-hidden="true">
							<Quote className={styles.quoteIconEnd} aria-hidden="true" size={20} strokeWidth={1.5} />
							<Quote className={styles.quoteIcon} aria-hidden="true" size={20} strokeWidth={1.5} />
						</div>
						<p>{revealed && <TextReveal text={quote} startOnView={false} />}</p>
					</div>
					<cite className={styles.attribution}>A quote of mine</cite>
				</blockquote>
			</div>
			<CinematicBanner />
			<DotGridPattern className={styles.pattern} aria-hidden="true" />
			<span className={styles.guidelines} aria-hidden="true" />
		</section>
	);
}
