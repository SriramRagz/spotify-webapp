"use client";

import { useEffect, useRef, useState } from "react";

type Track = {
  id: string;
  title: string;
  artists: { id: string; name: string }[];
};

type Props = {
  track: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function AudioPlayer({
  track,
  isPlaying,
  onTogglePlay,
  onPrevious,
  onNext,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [playbackError, setPlaybackError] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setPlaybackError("");

    if (isPlaying && track) {
      audio.play().catch(() => {
        setPlaybackError("Playback could not start. Press Play to try again.");
      });
    }
  }, [track?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && track) {
      audio.play().catch(() => {
        setPlaybackError("Playback could not start. Press Play to try again.");
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <footer className="fixed bottom-0 left-0 z-20 w-full border-t border-gray-800 bg-[#111713] px-4 py-3 text-white md:px-8">
      <audio
        ref={audioRef}
        src="/audio/demo-track.wav"
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onEnded={onNext}
        onError={() => setPlaybackError("Demo audio could not be loaded.")}
      />

      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-blue-900 text-xl">
            ♫
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {track?.title ?? "Select a track"}
            </p>
            <p className="truncate text-xs text-gray-400">
              {track?.artists.map((artist) => artist.name).join(", ") ?? "Your music player"}
            </p>
            <p className="text-[10px] text-green-400">Original demo audio</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <button onClick={onPrevious} disabled={!track} aria-label="Previous track"
              className="text-gray-400 hover:text-white disabled:opacity-30">
              |◀
            </button>
            <button onClick={onTogglePlay} disabled={!track}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-105 disabled:opacity-30">
              {isPlaying ? "Ⅱ" : "▶"}
            </button>
            <button onClick={onNext} disabled={!track} aria-label="Next track"
              className="text-gray-400 hover:text-white disabled:opacity-30">
              ▶|
            </button>
          </div>

          <div className="flex w-full max-w-xl items-center gap-2 text-[10px] text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <input
              aria-label="Seek audio"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (audioRef.current) audioRef.current.currentTime = value;
                setCurrentTime(value);
              }}
              className="h-1 flex-1 cursor-pointer accent-green-400"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden w-28 items-center gap-2 sm:flex">
          <span className="text-sm">♪</span>
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-full cursor-pointer accent-green-400"
          />
        </div>
      </div>

      {playbackError && (
        <p className="mt-1 text-center text-xs text-red-400">{playbackError}</p>
      )}
    </footer>
  );
}
