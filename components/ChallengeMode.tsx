'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { gitChallenges } from '@/lib/gitChallenges';

export default function ChallengeMode() {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  const challenge = gitChallenges[index];
  const expected = challenge.expectedCommands[progress];

  const complete = useMemo(() => progress >= challenge.expectedCommands.length, [challenge.expectedCommands.length, progress]);

  const submit = () => {
    const normalized = input.trim();
    if (!normalized) return;

    if (normalized === expected) {
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      setInput('');

      if (nextProgress >= challenge.expectedCommands.length) {
        setXp((value) => value + challenge.xp);
        if (!badges.includes(challenge.title)) {
          setBadges((value) => [...value, challenge.title]);
        }
      }
      return;
    }

    setInput('');
  };

  const nextChallenge = () => {
    setIndex((value) => (value + 1) % gitChallenges.length);
    setProgress(0);
    setInput('');
  };

  return (
    <section className="panel p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Git Challenge Mode</h3>
          <p className="text-xs text-slate-300">LeetCode-style command puzzles with XP, badges, and timing pressure.</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-mono text-gitGreen">XP {xp}</p>
          <p className="text-slate-400">Badges {badges.length}</p>
        </div>
      </header>

      <motion.div key={challenge.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-3 rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="mb-1 text-xs uppercase tracking-widest text-gitBlue">{challenge.difficulty}</p>
        <h4 className="font-semibold">{challenge.title}</h4>
        <p className="mt-2 text-sm text-slate-300">{challenge.objective}</p>
        <p className="mt-2 text-xs text-slate-400">Time limit: {challenge.timeLimit}s</p>
      </motion.div>

      <div className="mb-3 rounded-xl border border-white/10 bg-black/40 p-3">
        <p className="mb-2 text-xs text-slate-400">Next required command</p>
        <p className="font-mono text-sm text-gitBlue">{complete ? 'Challenge completed.' : expected}</p>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type exact git command"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm outline-none"
        />
        <button onClick={submit} className="rounded-lg bg-gitGreen px-3 py-2 text-sm font-semibold">
          Run
        </button>
      </div>

      {complete ? (
        <button onClick={nextChallenge} className="mt-3 rounded-lg border border-gitBlue/60 px-3 py-1 text-xs text-gitBlue">
          Next Challenge
        </button>
      ) : null}
    </section>
  );
}
