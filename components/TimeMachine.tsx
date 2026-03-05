'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RepoState, getCommitTimeline } from '@/lib/gitEngine';

interface TimeMachineProps {
  state: RepoState;
  onStateChange: (state: RepoState) => void;
}

export default function TimeMachine({ state, onStateChange }: TimeMachineProps) {
  const timeline = useMemo(() => getCommitTimeline(state), [state]);
  const max = Math.max(0, timeline.length - 1);

  const cursor = Math.min(state.historyCursor, max);
  const current = timeline[cursor] ?? timeline[timeline.length - 1] ?? null;

  return (
    <section className="panel p-5">
      <header className="mb-4">
        <h3 className="text-xl font-semibold">Git Time Machine</h3>
        <p className="text-xs text-slate-300">Scrub repository history and replay commit evolution.</p>
      </header>

      <input
        type="range"
        min={0}
        max={max}
        value={cursor}
        onChange={(event) =>
          onStateChange({
            ...state,
            historyCursor: Number(event.target.value),
            workingDirectory: { ...(timeline[Number(event.target.value)]?.snapshot ?? state.workingDirectory) }
          })
        }
        className="mb-3 w-full accent-gitGreen"
      />

      <motion.div
        key={current?.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm"
      >
        {current ? (
          <>
            <p className="font-mono text-gitBlue">Commit {current.id}</p>
            <p className="mt-1">{current.message}</p>
            <p className="mt-2 text-xs text-slate-400">Branch: {current.branch}</p>
            <p className="mt-2 text-xs text-slate-400">
              Snapshot files: {Object.keys(current.snapshot).length} | Timeline position: {cursor + 1}/{timeline.length}
            </p>
          </>
        ) : (
          <p className="text-slate-400">No commit history yet.</p>
        )}
      </motion.div>
    </section>
  );
}
