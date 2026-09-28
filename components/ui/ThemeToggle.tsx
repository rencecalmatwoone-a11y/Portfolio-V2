"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./ThemeToggle.module.css";

const THEME_STORAGE_KEY = "portfolio-theme";

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
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
		if (storedTheme === "dark" || storedTheme === "light") {
			document.documentElement.dataset.theme = storedTheme;
		}
		window.dispatchEvent(new Event("themechange"));
	}, []);

	function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
		const nextTheme = isDark ? "light" : "dark";
		const applyTheme = () => {
			document.documentElement.dataset.theme = nextTheme;
			window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
			window.dispatchEvent(new Event("themechange"));
		};

		if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			applyTheme();
			return;
		}

		const root = document.documentElement;
		const bounds = event.currentTarget.getBoundingClientRect();
		root.style.setProperty("--theme-transition-x", `${bounds.left + bounds.width / 2}px`);
		root.style.setProperty("--theme-transition-y", `${bounds.top + bounds.height / 2}px`);

		const transition = document.startViewTransition(applyTheme);
		const clearOrigin = () => {
			root.style.removeProperty("--theme-transition-x");
			root.style.removeProperty("--theme-transition-y");
		};
		void transition.finished.then(clearOrigin, clearOrigin);
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
