import styles from "./ClosingQuote.module.css";
import { DotGridPattern } from "@/components/background-pattern/dot-grid-pattern";
import { CinematicBanner } from "./CinematicBanner";

export function ClosingQuote() {
	return (
		<section className={`page-section ${styles.section}`} aria-label="A personal quote">
			<div className={styles.quoteBand}>
				<blockquote className={styles.quote}>
					<p>“Negative things are just a part of positive outcomes”</p>
					<cite className={styles.attribution}>A quote of mine</cite>
				</blockquote>
			</div>
			<CinematicBanner />
			<DotGridPattern className={styles.pattern} aria-hidden="true" />
			<span className={styles.guidelines} aria-hidden="true" />
		</section>
	);
}
