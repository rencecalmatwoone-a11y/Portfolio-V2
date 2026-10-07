"use client";

import Image from "next/image";
import { BatteryFull, ChevronRight, Headphones, Music2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { musicTracks } from "@/data/music";
import { profile } from "@/data/profile";
import { useMusicPlayback } from "./useMusicPlayback";
import styles from "./MusicPlayer.module.css";

type View = "main" | "music" | "songs" | "artists" | "artistSongs" | "settings" | "volume" | "playing";
type MenuItem = { id: string; label: string; accessibleLabel?: string; submenu?: boolean; trackIndex?: number; artist?: string };
const artists = [...new Set(musicTracks.map(track => track.artist))].sort();
const headings: Record<View, string> = { main: "iPod", music: "Music", songs: "All Songs", artists: "Artists", artistSongs: "", settings: "Settings", volume: "Volume", playing: "Now Playing" };

function isThemeControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("[data-theme-toggle]"));
}

function timestamp(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export function MusicPlayer() {
  const playback = useMusicPlayback();
  const { audioRef, track, index, playing, loading, elapsed, duration, volume, muted, error, shuffle, repeat, adjustVolume, seek } = playback;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("songs");
  const [selected, setSelected] = useState(0);
  const [artist, setArtist] = useState("");
  const [booted, setBooted] = useState(false);
  const [backlight, setBacklight] = useState(true);
  const [lcdFilter, setLcdFilter] = useState(true);
  const [artwork, setArtwork] = useState(true);
  const [activity, setActivity] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLButtonElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const autoBacklightRef = useRef(true);
  const gestureRef = useRef<{ pointer: number; angle: number; accumulated: number; moved: boolean; time: number } | null>(null);
  const suppressClickRef = useRef(false);
  const menuStack = useRef<View[]>(["main", "music"]);
  const id = useId();

  const wake = useCallback(() => {
    if (autoBacklightRef.current) setBacklight(true);
    setActivity(previous => previous + 1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const audio = audioRef.current;
    if (audio?.getAttribute("src") && audio.preload === "none") { audio.preload = "metadata"; audio.load(); }
    panelRef.current?.focus({ preventScroll: true });
    const dismiss = (event: globalThis.PointerEvent) => { if (!rootRef.current?.contains(event.target as Node) && !isThemeControl(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, audioRef]);

  useEffect(() => {
    if (!open || booted) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500;
    const timer = setTimeout(() => setBooted(true), delay);
    return () => clearTimeout(timer);
  }, [open, booted]);

  useEffect(() => {
    if (!open || !backlight || !autoBacklightRef.current) return;
    const timer = setTimeout(() => setBacklight(false), 30_000);
    return () => clearTimeout(timer);
  }, [open, activity, backlight]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function navigate(next: View) {
    menuStack.current.push(view);
    setSelected(0);
    setView(next);
  }

  function menuBack() {
    wake();
    if (view === "playing") { menuStack.current = ["main", "music"]; setView("songs"); setSelected(index); }
    else {
      const previous = menuStack.current.pop();
      setView(previous ?? "playing");
      setSelected(0);
    }
  }

  function toggleBacklight() {
    const next = !backlight;
    autoBacklightRef.current = next;
    setBacklight(next);
  }

  function playSelection(next: number) {
    playback.selectTrack(next);
    setArtwork(true);
    setView("playing");
    centerRef.current?.focus({ preventScroll: true });
  }

  const songItems = (trackIndices: number[]): MenuItem[] => trackIndices.map(trackIndex => ({
    label: musicTracks[trackIndex].title,
    accessibleLabel: `Select ${musicTracks[trackIndex].title} by ${musicTracks[trackIndex].artist}`,
    id: "track",
    trackIndex,
  }));

  let items: MenuItem[] = [];
  if (view === "main") items = [
    { id: "music", label: "Music", submenu: true },
    { id: "shuffleSongs", label: "Shuffle Songs" },
    { id: "settings", label: "Settings", submenu: true },
    { id: "backlight", label: "Backlight" },
    { id: "playing", label: "Now Playing", submenu: true },
  ];
  else if (view === "music") items = [
    { id: "songs", label: "All Songs", submenu: true },
    { id: "artists", label: "Artists", submenu: true },
  ];
  else if (view === "songs") items = songItems(musicTracks.map((_, trackIndex) => trackIndex));
  else if (view === "artists") items = artists.map(name => ({ id: "artistSongs", label: name, artist: name, submenu: true }));
  else if (view === "artistSongs") items = songItems(musicTracks.flatMap((song, trackIndex) => song.artist === artist ? [trackIndex] : []));
  else if (view === "settings") items = [
    { id: "shuffle", label: `Shuffle: ${shuffle ? "On" : "Off"}` },
    { id: "repeat", label: `Repeat: ${repeat === "off" ? "Off" : repeat === "one" ? "One" : "All"}` },
    { id: "backlight", label: `Backlight: ${backlight ? "On" : "Off"}` },
    { id: "filter", label: `LCD Filter: ${lcdFilter ? "On" : "Off"}` },
    { id: "volume", label: `Volume: ${Math.round((muted ? 0 : volume) * 100)}%`, submenu: true },
  ];

  function activateItem(item: MenuItem) {
    switch (item.id) {
      case "track": if (item.trackIndex !== undefined) playSelection(item.trackIndex); break;
      case "shuffleSongs": playback.shuffleSongs(); setView("playing"); break;
      case "shuffle": playback.toggleShuffle(); break;
      case "repeat": playback.setRepeat(repeat === "off" ? "one" : repeat === "one" ? "all" : "off"); break;
      case "backlight": toggleBacklight(); break;
      case "filter": setLcdFilter(!lcdFilter); break;
      case "artistSongs": setArtist(item.artist ?? ""); navigate("artistSongs"); break;
      case "playing": setView("playing"); break;
      default: navigate(item.id as View);
    }
  }

  const stepWheel = useCallback((steps: number) => {
    wake();
    if (view === "playing") {
      const audio = audioRef.current;
      if (audio && Number.isFinite(audio.duration) && !audio.error) {
        const time = Math.max(0, Math.min(audio.duration, audio.currentTime + steps * 5));
        seek(time);
      }
    } else if (view === "volume") {
      adjustVolume(steps * 0.05);
    } else setSelected(previous => Math.max(0, Math.min(items.length - 1, previous + steps)));
  }, [wake, view, audioRef, items.length, adjustVolume, seek]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel || !open || !booted) return;
    const scroll = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) > 1) stepWheel(event.deltaY > 0 ? 1 : -1);
    };
    wheel.addEventListener("wheel", scroll, { passive: false });
    return () => wheel.removeEventListener("wheel", scroll);
  }, [open, booted, stepWheel]);

  function centerPress() {
    wake();
    if (view === "playing") setArtwork(!artwork);
    else if (view === "volume") playback.toggleMute();
    else if (items[selected]) activateItem(items[selected]);
  }

  function wheelPointerDown(event: PointerEvent<HTMLDivElement>) {
    suppressClickRef.current = false;
    const button = (event.target as Element).closest("button");
    if (!booted || button === centerRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    gestureRef.current = { pointer: event.pointerId, angle: Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2), accumulated: 0, moved: false, time: audioRef.current?.currentTime ?? 0 };
    // Capture on the original button so a tap still clicks it; a drag suppresses that click.
    (button ?? event.currentTarget).setPointerCapture(event.pointerId);
    if (!button) event.currentTarget.focus({ preventScroll: true });
    wake();
  }

  function wheelPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointer !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const angle = Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2);
    let delta = angle - gesture.angle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    gesture.angle = angle;
    gesture.accumulated += delta;
    if (view === "playing" || view === "volume") {
      // Ignore finger jitter, then follow the full arc rather than five-second notches.
      if (!gesture.moved && Math.abs(gesture.accumulated) < 0.04) return;
      gesture.moved = true;
      const audio = audioRef.current;
      if (view === "volume") adjustVolume(gesture.accumulated * (0.05 / 0.3));
      else if (audio && Number.isFinite(audio.duration) && !audio.error) {
        gesture.time = Math.max(0, Math.min(audio.duration, gesture.time + gesture.accumulated * (5 / 0.3)));
        seek(gesture.time);
      }
      gesture.accumulated = 0;
      wake();
      return;
    }
    const steps = Math.trunc(gesture.accumulated / 0.3);
    if (steps) { gesture.moved = true; gesture.accumulated -= steps * 0.3; stepWheel(steps); }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    suppressClickRef.current = false;
    wake();
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (!booted || view === "main") close(); else menuBack();
      return;
    }
    if (!booted || (event.target as HTMLElement).tagName === "INPUT") return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      if (view === "playing" && ["ArrowLeft", "ArrowRight"].includes(event.key)) playback.skip(event.key === "ArrowLeft" ? -1 : 1);
      else if (view === "playing") stepWheel(event.key === "ArrowUp" ? 1 : -1);
      else stepWheel(["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1);
    } else if ((event.target === wheelRef.current || event.target === panelRef.current) && event.key === "Enter") { event.preventDefault(); centerPress(); }
    else if ((event.target === wheelRef.current || event.target === panelRef.current) && event.key === " ") { event.preventDefault(); setView("playing"); playback.togglePlayback(); }
  }

  const selectedItem = items[selected];
  const centerLabel = view === "playing" ? artwork ? "Show track details" : "Show album artwork" : view === "volume" ? muted || volume === 0 ? "Unmute music" : "Mute music" : `Select ${selectedItem?.label ?? "menu item"}`;
  const wheelPreviousLabel = view === "playing" ? "Previous song" : view === "volume" ? "Decrease volume" : "Previous menu item";
  const wheelNextLabel = view === "playing" ? "Next song" : view === "volume" ? "Increase volume" : "Next menu item";
  const status = !track.audioSrc ? "Audio coming soon" : error ? "Couldn't play. Press play to retry." : loading ? "Loading..." : playing ? "Playing" : "Paused";

  return (
    <div className={styles.root} ref={rootRef} onKeyDown={onKeyDown} onPointerDownCapture={wake} onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget) && !isThemeControl(event.relatedTarget)) setOpen(false); }}>
      <button type="button" ref={triggerRef} className={styles.trigger} aria-label={playing ? `Music player: playing ${track.title}` : "Open music player"} aria-expanded={open} aria-controls={id} aria-haspopup="dialog" title="A little background music" data-playing={playing} onClick={() => { wake(); setOpen(!open); }}>
        {playing ? <span className={styles.playingIcon} aria-hidden="true" data-loading={loading}><span /><span /><span /><span /></span> : <Headphones size={19} strokeWidth={1.5} aria-hidden="true" />}
      </button>
      <div ref={panelRef} tabIndex={-1} className={styles.panel} id={id} role="dialog" aria-label="Music player" hidden={!open} data-backlight={backlight} data-lcd-filter={lcdFilter} data-booted={booted} data-view={view} data-lenis-prevent>
        <div className={styles.screen}>
          {!booted && <div className={styles.bootScreen} role="status"><Music2 size={28} strokeWidth={1.5} aria-hidden="true" /><span>{profile.preferredName}&apos;s iPod</span></div>}
          <div className={styles.screenContent} inert={!booted} aria-hidden={!booted}>
            <div className={styles.screenHeader}>{playing ? <Play size={9} fill="currentColor" aria-hidden="true" /> : <Pause size={9} fill="currentColor" aria-hidden="true" />}<span>{view === "artistSongs" ? artist : headings[view]}</span><BatteryFull size={17} strokeWidth={1.5} aria-hidden="true" /></div>
            {items.length > 0 && <ol className={styles.menuList} aria-label={view === "songs" || view === "artistSongs" ? "Music playlist" : `${headings[view]} menu`}>
              {items.map((item, itemIndex) => <li key={item.label}><button type="button" className={styles.menuItem} aria-label={item.accessibleLabel ?? item.label} data-highlighted={selected === itemIndex} aria-current={item.trackIndex === index ? "true" : undefined} onPointerEnter={() => setSelected(itemIndex)} onFocus={() => setSelected(itemIndex)} onClick={() => { setSelected(itemIndex); activateItem(item); centerRef.current?.focus({ preventScroll: true }); }}><span>{item.label}</span>{item.submenu && <ChevronRight size={11} aria-hidden="true" />}</button></li>)}
            </ol>}
            {view === "playing" && <div className={styles.playingScreen}>
              <div className={styles.trackCounter}><span>{index + 1} of {musicTracks.length}</span><span className={styles.modeIcons}>{shuffle && <Shuffle size={10} aria-label="Shuffle on" />}{repeat === "one" ? <Repeat1 size={10} aria-label="Repeat one" /> : repeat === "all" && <Repeat size={10} aria-label="Repeat all" />}</span></div>
              <div className={styles.record} data-artwork={artwork}>
                {artwork && <a href={track.href} target="_blank" rel="noreferrer" aria-label={`${track.title} on Spotify`} className={styles.cover}><Image src={track.cover} alt={`${track.title} cover art`} width={48} height={48} /></a>}
                <div className={styles.details}><p className={styles.title}>{track.title}</p><p className={styles.artist}>{track.artist}</p></div>
              </div>
              <div className={styles.timeline}><input className={`${styles.range} ${styles.seek}`} type="range" min={0} max={duration || 1} step={0.1} value={elapsed} aria-label="Seek through song" aria-valuetext={`${timestamp(elapsed)} of ${timestamp(duration)}`} disabled={!track.audioSrc || !duration || error} style={{ "--progress": `${duration ? elapsed / duration * 100 : 0}%` } as CSSProperties} onChange={event => playback.seek(Number(event.target.value))} /><div className={styles.time}><span>{timestamp(elapsed)}</span><span>{duration ? `-${timestamp(Math.max(0, duration - elapsed))}` : "-:--"}</span></div></div>
              <p className={styles.status} role="status">{status}</p>
            </div>}
            {view === "volume" && <div className={styles.volumeScreen}><span className={styles.volumeNumber}>{Math.round((muted ? 0 : volume) * 100)}%</span><div className={styles.volume}><button type="button" className={styles.muteButton} aria-label={muted || volume === 0 ? "Unmute music" : "Mute music"} onClick={playback.toggleMute}>{muted || volume === 0 ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}</button><input className={styles.range} type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume} aria-label="Music volume" aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`} style={{ "--progress": `${muted ? 0 : volume * 100}%` } as CSSProperties} onChange={event => playback.changeVolume(Number(event.target.value))} /></div><span className={styles.volumeHint}>Turn the wheel to adjust</span></div>}
          </div>
        </div>
        <span className="sr-only" id={`${id}-wheel-help`}>Rotate to browse menus or seek. Arrow keys navigate; Enter selects; Space plays or pauses.</span>
        <div ref={wheelRef} className={styles.wheel} role="group" tabIndex={0} aria-label="iPod click wheel" aria-describedby={`${id}-wheel-help`} inert={!booted} onPointerDown={wheelPointerDown} onPointerMove={wheelPointerMove} onPointerUp={() => { suppressClickRef.current = gestureRef.current?.moved ?? false; gestureRef.current = null; }} onPointerCancel={() => { gestureRef.current = null; suppressClickRef.current = false; }} onClickCapture={event => { if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); suppressClickRef.current = false; } }}>
          <button className={`${styles.wheelButton} ${styles.menuButton}`} type="button" aria-label="Menu: go back" onClick={menuBack}>MENU</button>
          <button className={`${styles.wheelButton} ${styles.previousButton}`} type="button" aria-label={wheelPreviousLabel} onClick={() => { if (view === "playing") playback.skip(-1); else stepWheel(-1); }}><SkipBack size={17} fill="currentColor" aria-hidden="true" /></button>
          <button className={`${styles.wheelButton} ${styles.nextButton}`} type="button" aria-label={wheelNextLabel} onClick={() => { if (view === "playing") playback.skip(1); else stepWheel(1); }}><SkipForward size={17} fill="currentColor" aria-hidden="true" /></button>
          <button className={`${styles.wheelButton} ${styles.playButton}`} type="button" aria-label={playing ? "Pause song" : error ? "Retry song" : "Play song"} disabled={!track.audioSrc} onClick={() => { setView("playing"); playback.togglePlayback(); }}><Play size={11} fill="currentColor" aria-hidden="true" /><Pause size={11} fill="currentColor" aria-hidden="true" /></button>
          <button ref={centerRef} className={styles.centerButton} type="button" aria-label={centerLabel} onClick={centerPress} />
        </div>
      </div>
      <audio ref={audioRef} src={track.audioSrc ?? undefined} preload="none" {...playback.events} />
    </div>
  );
}
