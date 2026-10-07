"use client";

import { useEffect, useRef, useState } from "react";
import { musicTracks } from "@/data/music";

export type RepeatMode = "off" | "one" | "all";

function shuffledIndices(first?: number) {
  const indices = musicTracks.map((_, index) => index).filter(index => index !== first);
  for (let index = indices.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swap]] = [indices[swap], indices[index]];
  }
  return first === undefined ? indices : [first, ...indices];
}

export function useMusicPlayback() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.65);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeRef = useRef(false);
  const orderRef = useRef(musicTracks.map((_, index) => index));
  const track = musicTracks[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) { audio.volume = volume; audio.muted = muted; }
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track.audioSrc || !resumeRef.current) return;
    let cancelled = false;
    audio.play().catch((reason: unknown) => {
      if (!cancelled && !(reason instanceof DOMException && reason.name === "AbortError")) {
        setLoading(false);
        setError(true);
      }
    });
    return () => { cancelled = true; };
  }, [track]);

  async function play() {
    const audio = audioRef.current;
    if (!audio || !track.audioSrc) return;
    if (!audio.paused && !audio.ended && !audio.error) return;
    setError(false);
    setLoading(true);
    resumeRef.current = true;
    if (audio.error) audio.load();
    if (audio.ended) audio.currentTime = 0;
    try { await audio.play(); }
    catch (reason) {
      if (audioRef.current?.getAttribute("src") !== track.audioSrc) return;
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setLoading(false);
      setError(true);
    }
  }

  function pause() {
    resumeRef.current = false;
    audioRef.current?.pause();
    setLoading(false);
  }

  function togglePlayback() {
    if (audioRef.current && !audioRef.current.paused) pause();
    else void play();
  }

  function selectTrack(next: number, autoplay = true) {
    const normalized = (next + musicTracks.length) % musicTracks.length;
    if (normalized === index) { if (autoplay) void play(); return; }
    audioRef.current?.pause();
    resumeRef.current = autoplay;
    setPlaying(false);
    setLoading(Boolean(autoplay && musicTracks[normalized].audioSrc));
    setElapsed(0);
    setDuration(0);
    setError(false);
    setIndex(normalized);
  }

  function skip(direction: number, automatic = false) {
    const order = orderRef.current;
    const position = order.indexOf(index) + direction;
    if (automatic && position >= order.length && repeat === "off") {
      resumeRef.current = false;
      setPlaying(false);
      return;
    }
    selectTrack(order[(position + order.length) % order.length]);
  }

  function toggleShuffle() {
    orderRef.current = shuffle ? musicTracks.map((_, index) => index) : shuffledIndices(index);
    setShuffle(!shuffle);
  }

  function shuffleSongs() {
    orderRef.current = shuffledIndices();
    setShuffle(true);
    selectTrack(orderRef.current[0]);
  }

  function seek(time: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || error) return;
    const next = Math.max(0, Math.min(audio.duration, time));
    audio.currentTime = next;
    setElapsed(next);
  }

  function toggleMute() {
    if (volume === 0) setVolume(0.65);
    setMuted(!muted && volume !== 0);
  }

  function changeVolume(next: number) {
    setVolume(Math.max(0, Math.min(1, next)));
    setMuted(false);
  }

  const events = {
    onPlaying: () => { setPlaying(true); setLoading(false); setError(false); },
    onPause: () => { setPlaying(false); setLoading(false); },
    onWaiting: () => setLoading(true),
    onTimeUpdate: () => setElapsed(audioRef.current?.currentTime ?? 0),
    onDurationChange: () => { const value = audioRef.current?.duration ?? 0; setDuration(Number.isFinite(value) ? value : 0); },
    onEnded: () => {
      if (repeat === "one") { seek(0); void play(); }
      else skip(1, true);
    },
    onError: () => { if (track.audioSrc) { setError(true); setLoading(false); setPlaying(false); } },
  };

  return { audioRef, track, index, playing, loading, elapsed, duration, volume, muted, error, shuffle, repeat, setRepeat, toggleShuffle, shuffleSongs, selectTrack, skip, seek, togglePlayback, toggleMute, changeVolume, events };
}
