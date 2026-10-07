"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { pixelWipeFrames } from "@/lib/theme-transition";
import { Switch } from "@/components/ui/switch-button";
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
		const transition = document.startViewTransition(() => {
			// Expose both live scenes only after the outgoing page has been captured.
			root.dataset.themeScenesLive = "true";
			applyTheme();
		});
		activeTransition = transition;
		const wipes: Animation[] = [];
		try {
			await transition.ready;
			wipes.push(root.animate(pixelWipeFrames(window.innerWidth, window.innerHeight, nextTheme === "dark"), {
				duration: 850,
				fill: "both",
				pseudoElement: "::view-transition-new(root)",
			}));
			// Both car scenes use live layers; reveal the incoming one along the page's block edge.
			const scene = document.querySelector(`[data-car-scene="${nextTheme}"]`);
			if (scene) {
				wipes.push(root.animate(pixelWipeFrames(window.innerWidth, window.innerHeight, nextTheme === "dark", scene.getBoundingClientRect()), {
					duration: 850,
					fill: "both",
					pseudoElement: `::view-transition-new(car-scene-${nextTheme})`,
				}));
			}
			const startTime = document.timeline.currentTime;
			if (typeof startTime === "number") {
				wipes.forEach(wipe => { wipe.startTime = startTime; });
			}
			// Keep the outgoing capture until its live replacement and both reveals are ready.
			root.dataset.themeWipeReady = "true";
			await Promise.all(wipes.map(wipe => wipe.finished));
		} catch {
			delete root.dataset.themeScenesLive;
			transition.skipTransition();
		} finally {
			// Restore scene visibility before the overlay releases the underlying page.
			delete root.dataset.themeScenesLive;
			await transition.finished.catch(() => {});
			wipes.forEach(wipe => { wipe.cancel(); });
			delete root.dataset.themeWipeReady;
			delete root.dataset.themeScenesLive;
			delete root.dataset.themeTransition;
			activeTransition = undefined;
		}
	}

	return (
		<Switch
			data-theme-toggle
			className={styles.toggle}
			value={isDark}
			aria-label="Dark mode"
			title={`Switch to ${isDark ? "light" : "dark"} mode`}
			onToggle={toggleTheme}
			iconOn={<Moon className="size-3" strokeWidth={1.75} />}
			iconOff={<Sun className="size-3" strokeWidth={1.75} />}
		/>
	);
}
