'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import CommandCard from '@/components/CommandCard';
import CommandExplorer from '@/components/CommandExplorer';
import LearningPath from '@/components/LearningPath';
import OnboardingModal from '@/components/OnboardingModal';
import RepoVisualizer from '@/components/RepoVisualizer';
import TerminalSandbox from '@/components/TerminalSandbox';
import { RepoState, createInitialRepoState } from '@/lib/gitEngine';
import { executeGitCommand } from '@/lib/gitCommands';
import { ExperienceLevel, onboardingTracks } from '@/lib/gitChallenges';

const RebaseSimulator = dynamic(() => import('@/components/RebaseSimulator'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Rebase Lab...</div>
});

const TimeMachine = dynamic(() => import('@/components/TimeMachine'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Time Machine...</div>
});

const ChallengeMode = dynamic(() => import('@/components/ChallengeMode'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Challenge Arena...</div>
});

const commandCards = [
  {
    command: 'git merge feature',
    summary: 'Integrates feature work into main. If histories diverged, Git creates a merge node joining both parents.',
    beforeGraph: `Before\nmain --o--o\n      \\\nfeature -o--o`,
    afterGraph: `After\nmain --o--o----o\n      \\      /\nfeature -o--o`
  },
  {
    command: 'git rebase main',
    summary: 'Moves feature commits on top of latest main so history stays linear and easier to reason about.',
    beforeGraph: `Before\nmain    --o--o\nfeature --o--o`,
    afterGraph: `After\nmain    --o--o\nfeature      -o--o`
  },
  {
    command: 'git reset --hard HEAD~1',
    summary: 'Moves branch pointer back and resets index + working tree to target commit in one shot.',
    beforeGraph: `Before\nmain --o--o--o(HEAD)\nIndex: staged\nWD: modified`,
    afterGraph: `After\nmain --o--o(HEAD)\nIndex: synced\nWD: synced`
  }
];

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const [repoState, setRepoState] = useState<RepoState>(() => createInitialRepoState());
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [learnedCommands, setLearnedCommands] = useState<string[]>([]);

  const stats = useMemo(
    () => ({
      commits: repoState.commits.length,
      branches: repoState.branches.length,
      stash: repoState.stashes.length,
      xp: learnedCommands.length * 25
    }),
    [repoState, learnedCommands.length]
  );

  useEffect(() => {
    const storedLevel = window.localStorage.getItem('gitviz_level') as ExperienceLevel | null;
    const storedCommands = window.localStorage.getItem('gitviz_learned');
    if (storedLevel) setExperienceLevel(storedLevel);
    if (storedCommands) setLearnedCommands(JSON.parse(storedCommands));
    if (!storedLevel) setShowOnboarding(true);
  }, []);

  const handleLevelSelect = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    setShowOnboarding(false);
    window.localStorage.setItem('gitviz_level', level);
  };

  const registerCommand = (rawCommand: string, success: boolean) => {
    if (!success) return;
    const match = rawCommand.trim().match(/^git\s+([a-z-]+)/);
    if (!match) return;
    const normalized = `git ${match[1]}`;
    setLearnedCommands((prev) => {
      if (prev.includes(normalized)) return prev;
      const next = [...prev, normalized];
      window.localStorage.setItem('gitviz_learned', JSON.stringify(next));
      return next;
    });
  };

  const mapSimulationCommand = (command: string): string => {
    const examples: Record<string, string> = {
      'git branch': 'git branch feature',
      'git checkout': 'git checkout main',
      'git switch': 'git switch main',
      'git merge': 'git merge feature',
      'git branch -d': 'git branch -d feature',
      'git remote': 'git remote',
      'git fetch': 'git fetch',
      'git pull': 'git pull',
      'git push': 'git push',
      'git rebase': 'git rebase main',
      'git cherry-pick': 'git cherry-pick deadbee',
      'git revert': 'git revert deadbee',
      'git reset': 'git reset --mixed',
      'git restore': 'git restore .',
      'git bisect': 'git bisect',
      'git blame': 'git blame',
      'git stash': 'git stash',
      'git submodule': 'git submodule status',
      'git worktree': 'git worktree list',
      'git add': 'git add .',
      'git commit': 'git commit -m "docs: simulated commit"'
    };
    return examples[command] ?? command;
  };

  const simulateFromExplorer = (baseCommand: string) => {
    const runnable = mapSimulationCommand(baseCommand);
    const result = executeGitCommand(repoState, runnable);
    setRepoState(result.nextState);
    registerCommand(runnable, result.success);
    window.location.hash = 'sandbox';
  };

  const levelTrack = experienceLevel ? onboardingTracks[experienceLevel] : [];
  const achievements = [
    learnedCommands.includes('git commit') ? 'First Commit' : null,
    learnedCommands.includes('git branch') ? 'Branch Creator' : null,
    learnedCommands.includes('git merge') ? 'Merge Master' : null,
    learnedCommands.includes('git rebase') ? 'Rebase Ninja' : null
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-6 md:px-8 md:py-8">
      <OnboardingModal open={showOnboarding} onSelect={handleLevelSelect} />
      <section className="surface rounded-3xl p-4 md:p-6">
        <div className="surface-soft mb-4 flex items-center justify-between rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="git-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              Git Visualizer Lab
            </span>
            <p className="hidden text-xs text-slate-400 md:block">Interactive Git learning engine and simulation playground</p>
          </div>
          <div className="font-mono text-xs text-slate-300">v0.1 / static export</div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
          <motion.div {...reveal} className="surface-soft git-sheen rounded-3xl p-7 md:p-10">
            <p className="mb-4 inline-flex rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gitGreen">
              Build Git intuition visually
            </p>
            <h1 className="headline mb-4 text-5xl font-semibold md:text-7xl">Understand Git Visually</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              A real-time Git simulation environment where commit graphs animate, branches evolve, rebases rewrite
              history, and terminal commands immediately reshape repository state.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#learning"
                className="rounded-xl bg-gitGreen px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Start Learning
              </a>
              <a
                href="#sandbox"
                className="rounded-xl border border-gitBlue/50 bg-gitBlue/10 px-5 py-2.5 text-sm font-semibold text-gitBlue transition hover:bg-gitBlue/20"
              >
                Open Git Sandbox
              </a>
            </div>

            <div className="mt-7 grid max-w-xl grid-cols-3 gap-2">
              <div className="surface-soft rounded-xl px-4 py-3">
                <p className="font-mono text-2xl text-gitBlue">{stats.commits}</p>
                <p className="text-xs text-slate-400">Commits</p>
              </div>
              <div className="surface-soft rounded-xl px-4 py-3">
                <p className="font-mono text-2xl text-gitBlue">{stats.branches}</p>
                <p className="text-xs text-slate-400">Branches</p>
              </div>
              <div className="surface-soft rounded-xl px-4 py-3">
                <p className="font-mono text-2xl text-gitBlue">{stats.stash}</p>
                <p className="text-xs text-slate-400">Stashes</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-gitGreen">
                XP {stats.xp}
              </span>
              <span className="rounded-full border border-gitBlue/40 bg-gitBlue/10 px-3 py-1 text-gitBlue">
                Track: {experienceLevel ?? 'Not selected'}
              </span>
            </div>
          </motion.div>

          <motion.div {...reveal} transition={{ duration: 0.55, delay: 0.08 }} className="surface-soft rounded-3xl p-4">
            <RepoVisualizer state={repoState} />
          </motion.div>
        </div>
      </section>

      <motion.section {...reveal} id="learning">
        <LearningPath focusCommands={levelTrack} />
      </motion.section>

      <motion.section {...reveal}>
        <CommandExplorer onSelectCommand={simulateFromExplorer} />
      </motion.section>

      <motion.section {...reveal} transition={{ duration: 0.45 }} className="grid gap-4 xl:grid-cols-3">
        {commandCards.map((card) => (
          <CommandCard key={card.command} {...card} />
        ))}
      </motion.section>

      <section id="sandbox" className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.div {...reveal} className="min-h-[560px]">
          <TerminalSandbox state={repoState} onStateChange={setRepoState} onCommand={registerCommand} />
        </motion.div>
        <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.07 }} className="min-h-[560px]">
          <RepoVisualizer state={repoState} />
        </motion.div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <motion.div {...reveal}>
          <RebaseSimulator state={repoState} onStateChange={setRepoState} />
        </motion.div>
        <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.06 }}>
          <TimeMachine state={repoState} onStateChange={setRepoState} />
        </motion.div>
        <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.1 }}>
          <ChallengeMode />
        </motion.div>
      </section>
      <section className="surface rounded-2xl p-5">
        <h3 className="mb-2 text-xl font-semibold">Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {achievements.length ? (
            achievements.map((item) => (
              <span key={item} className="rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-xs text-gitGreen">
                {item}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-400">No badges unlocked yet. Start with git status and git commit.</p>
          )}
        </div>
      </section>
    </main>
  );
}
