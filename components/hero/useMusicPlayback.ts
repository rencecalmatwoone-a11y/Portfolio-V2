"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const levelRef = useRef({ volume: 0.65, muted: false });
  const outputRef = useRef<{ context: AudioContext; source: MediaElementAudioSourceNode; gain: GainNode } | null>(null);
  const volumeCheckedRef = useRef(false);
  const resumeRef = useRef(false);
  const orderRef = useRef(musicTracks.map((_, index) => index));
  const track = musicTracks[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !outputRef.current) { audio.volume = volume; audio.muted = muted; }
  }, [volume, muted]);

  useEffect(() => () => {
    const output = outputRef.current;
    if (output) {
      output.source.disconnect();
      output.gain.disconnect();
      void output.context.close();
      outputRef.current = null;
    }
  }, []);

  // iOS may ignore HTMLMediaElement.volume. Create its gain stage in a user gesture.
  function prepareOutput() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!volumeCheckedRef.current) {
      audio.volume = 0.5;
      const nativeVolume = Math.abs(audio.volume - 0.5) < 0.001;
      audio.volume = levelRef.current.volume;
      if (!nativeVolume) {
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = levelRef.current.muted ? 0 : levelRef.current.volume;
        const source = context.createMediaElementSource(audio);
        source.connect(gain);
        gain.connect(context.destination);
        outputRef.current = { context, gain, source };
      }
      volumeCheckedRef.current = true;
    }
    const output = outputRef.current;
    if (output) {
      audio.volume = 1;
      audio.muted = false;
      const level = levelRef.current.muted ? 0 : levelRef.current.volume;
      output.gain.gain.setTargetAtTime(level, output.context.currentTime, 0.015);
      if (output.context.state !== "running") void output.context.resume().catch(() => {});
    } else {
      audio.volume = levelRef.current.volume;
      audio.muted = levelRef.current.muted;
    }
  }

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
    prepareOutput();
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
    if (autoplay) prepareOutput();
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

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.error) return;
    const next = Math.max(0, Math.min(audio.duration, time));
    audio.currentTime = next;
    setElapsed(next);
  }, []);

  function toggleMute() {
    const current = levelRef.current;
    levelRef.current = { volume: current.volume || 0.65, muted: !current.muted && current.volume !== 0 };
    setVolume(levelRef.current.volume);
    setMuted(levelRef.current.muted);
    prepareOutput();
  }

  function changeVolume(next: number) {
    const level = Math.max(0, Math.min(1, next));
    levelRef.current = { volume: level, muted: false };
    setVolume(level);
    setMuted(false);
    prepareOutput();
  }

  function adjustVolume(delta: number) {
    changeVolume((levelRef.current.muted ? 0 : levelRef.current.volume) + delta);
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

  return { audioRef, track, index, playing, loading, elapsed, duration, volume, muted, error, shuffle, repeat, setRepeat, toggleShuffle, shuffleSongs, selectTrack, skip, seek, togglePlayback, toggleMute, changeVolume, adjustVolume, events };
}
