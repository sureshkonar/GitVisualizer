'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import CommandCard from '@/components/CommandCard';
import LearningPath from '@/components/LearningPath';
import RepoVisualizer from '@/components/RepoVisualizer';
import TerminalSandbox from '@/components/TerminalSandbox';
import { RepoState, createInitialRepoState } from '@/lib/gitEngine';

const RebaseSimulator = dynamic(() => import('@/components/RebaseSimulator'), {
  loading: () => <div className="panel p-5 text-sm text-slate-400">Loading Rebase Lab...</div>
});

const TimeMachine = dynamic(() => import('@/components/TimeMachine'), {
  loading: () => <div className="panel p-5 text-sm text-slate-400">Loading Time Machine...</div>
});

const ChallengeMode = dynamic(() => import('@/components/ChallengeMode'), {
  loading: () => <div className="panel p-5 text-sm text-slate-400">Loading Challenge Arena...</div>
});

const commandCards = [
  {
    command: 'git merge feature',
    summary: 'Combine feature history into main; creates merge commit when branches diverged.',
    beforeGraph: `Before\nmain --o--o\n      \\\nfeature -o--o`,
    afterGraph: `After\nmain --o--o----o\n      \\      /\nfeature -o--o`
  },
  {
    command: 'git rebase main',
    summary: 'Replay current branch commits on top of main for a cleaner linear history.',
    beforeGraph: `Before\nmain    --o--o\nfeature --o--o`,
    afterGraph: `After\nmain    --o--o\nfeature      -o--o`
  },
  {
    command: 'git reset --hard HEAD~1',
    summary: 'Move branch pointer back and rewrite index + working tree to match target commit.',
    beforeGraph: `Before\nmain --o--o--o(HEAD)\nIndex: staged\nWD: modified`,
    afterGraph: `After\nmain --o--o(HEAD)\nIndex: synced\nWD: synced`
  }
];

export default function HomePage() {
  const [repoState, setRepoState] = useState<RepoState>(() => createInitialRepoState());

  const stats = useMemo(
    () => ({
      commits: repoState.commits.length,
      branches: repoState.branches.length,
      stash: repoState.stashes.length
    }),
    [repoState]
  );

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-8">
      <section className="panel grid overflow-hidden md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 p-7 md:p-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-xs uppercase tracking-widest text-gitGreen"
          >
            Interactive Git Learning Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold leading-tight md:text-6xl"
          >
            Understand Git Visually
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl text-slate-300"
          >
            From git init to advanced rebases, learn Git through interactive simulations, animated graphs,
            and gamified challenges.
          </motion.p>

          <div className="flex flex-wrap gap-3">
            <a href="#learning" className="rounded-xl bg-gitGreen px-4 py-2 text-sm font-semibold text-black">
              Start Learning
            </a>
            <a href="#sandbox" className="rounded-xl border border-gitBlue/40 bg-gitBlue/10 px-4 py-2 text-sm font-semibold text-gitBlue">
              Open Git Sandbox
            </a>
          </div>

          <div className="grid max-w-lg grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="font-mono text-xl text-gitBlue">{stats.commits}</p>
              <p className="text-xs text-slate-400">Commits</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="font-mono text-xl text-gitBlue">{stats.branches}</p>
              <p className="text-xs text-slate-400">Branches</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="font-mono text-xl text-gitBlue">{stats.stash}</p>
              <p className="text-xs text-slate-400">Stashes</p>
            </div>
          </div>
        </div>

        <div className="h-full min-h-[420px] border-l border-white/10 p-4 md:p-6">
          <RepoVisualizer state={repoState} />
        </div>
      </section>

      <div id="learning">
        <LearningPath />
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        {commandCards.map((card) => (
          <CommandCard key={card.command} {...card} />
        ))}
      </section>

      <section id="sandbox" className="grid gap-4 xl:grid-cols-2">
        <div className="min-h-[540px]">
          <TerminalSandbox state={repoState} onStateChange={setRepoState} />
        </div>
        <div className="min-h-[540px]">
          <RepoVisualizer state={repoState} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <RebaseSimulator state={repoState} onStateChange={setRepoState} />
        <TimeMachine state={repoState} onStateChange={setRepoState} />
        <ChallengeMode />
      </section>
    </main>
  );
}
