'use client';

import { useEffect, useMemo, useState } from 'react';
import { CommandEvent } from '@/lib/gitMissions';

interface MissionReplayProps {
  events: CommandEvent[];
}

export default function MissionReplay({ events }: MissionReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursor, setCursor] = useState(0);

  const timeline = useMemo(() => events.map((event) => `${event.raw} ${event.success ? '✓' : '✗'}`), [events]);

  useEffect(() => {
    if (!isPlaying) return;
    if (timeline.length === 0) return;
    if (cursor >= timeline.length - 1) {
      setIsPlaying(false);
      return;
    }

    const id = window.setTimeout(() => {
      setCursor((value) => Math.min(value + 1, timeline.length - 1));
    }, 520);

    return () => window.clearTimeout(id);
  }, [isPlaying, cursor, timeline.length]);

  useEffect(() => {
    setCursor(0);
    setIsPlaying(false);
  }, [timeline.length]);

  if (timeline.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 p-3 text-xs text-slate-400">
        Ghost replay will appear after you run commands in this attempt.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-400">Ghost Replay</p>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setIsPlaying((value) => !value)}
            className="rounded-md border border-gitBlue/50 px-2 py-1 text-gitBlue"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCursor(0);
            }}
            className="rounded-md border border-white/20 px-2 py-1 text-slate-300"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="max-h-36 space-y-1 overflow-auto font-mono text-[11px]">
        {timeline.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className={`rounded px-2 py-1 ${index === cursor ? 'bg-gitBlue/15 text-gitBlue' : 'text-slate-300'}`}
          >
            {index + 1}. {line}
          </div>
        ))}
      </div>
    </div>
  );
}
