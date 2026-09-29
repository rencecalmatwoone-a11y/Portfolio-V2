"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { pixelWipeFrames } from "@/lib/theme-transition";
import styles from "./ThemeToggle.module.css";

const THEME_STORAGE_KEY = "portfolio-theme";
let activeTransition: ViewTransition | undefined;

function subscribe(onChange: () => void) {
	window.addEventListener("themechange", onChange);
	return () => window.removeEventListener("themechange", onChange);
}

function getSnapshot() {
	return document.documentElement.dataset.theme === "dark";
}

function getServerSnapshot() {
	return false;
}

export function ThemeToggle() {
	const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	useEffect(() => {
		try {
			const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
			if (storedTheme === "dark" || storedTheme === "light") {
				document.documentElement.dataset.theme = storedTheme;
			}
		} catch { /* Keep the current theme when storage is unavailable. */ }
		window.dispatchEvent(new Event("themechange"));
	}, []);

	async function toggleTheme() {
		if (activeTransition) return;
		const nextTheme = isDark ? "light" : "dark";
		const applyTheme = () => {
			document.documentElement.dataset.theme = nextTheme;
			try {
				window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
			} catch { /* Theme switching also works without persistent storage. */ }
			window.dispatchEvent(new Event("themechange"));
		};

		if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			applyTheme();
			return;
		}

		const root = document.documentElement;
		root.dataset.themeTransition = "pixels";
		const transition = document.startViewTransition(applyTheme);
		activeTransition = transition;
		try {
			await transition.ready;
			root.animate(pixelWipeFrames(window.innerWidth, window.innerHeight, nextTheme === "dark"), {
				duration: 850,
				fill: "both",
				pseudoElement: "::view-transition-new(root)",
			});
		} catch {
			transition.skipTransition();
		} finally {
			await transition.finished.catch(() => {});
			delete root.dataset.themeTransition;
			activeTransition = undefined;
		}
	}

	return (
		<button
			className={styles.toggle}
			type="button"
			role="switch"
			aria-checked={isDark}
			aria-label="Dark mode"
			onClick={toggleTheme}
		>
			<span className={styles.icon} aria-hidden="true">
				{isDark ? <Moon size={14} /> : <Sun size={14} />}
			</span>
			<span className={styles.label}>Dark mode</span>
			<span className={styles.track} aria-hidden="true">
				<span className={styles.thumb} />
			</span>
		</button>
	);
}
