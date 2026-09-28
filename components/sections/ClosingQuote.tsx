import styles from "./ClosingQuote.module.css";

export function ClosingQuote() {
	return (
		<section className={`page-section ${styles.section}`} aria-label="A personal quote">
			<blockquote className={styles.quote}>
				<p>“Negative things are just a part of positive outcomes”</p>
				<cite className={styles.attribution}>A quote of mine</cite>
			</blockquote>
		</section>
	);
}