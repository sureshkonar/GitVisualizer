'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import CommandCard from '@/components/CommandCard';
import type { CommandCardProps } from '@/components/CommandCard';
import CommandExplorer from '@/components/CommandExplorer';
import DailyChallenge from '@/components/DailyChallenge';
import LearningPath from '@/components/LearningPath';
import MissionCampaign from '@/components/MissionCampaign';
import OnboardingModal from '@/components/OnboardingModal';
import RepoVisualizer from '@/components/RepoVisualizer';
import TerminalSandbox from '@/components/TerminalSandbox';
import { RepoState, createInitialRepoState } from '@/lib/gitEngine';
import { executeGitCommand } from '@/lib/gitCommands';
import { ExperienceLevel, onboardingTracks } from '@/lib/gitChallenges';
import { buildCoachFeedback } from '@/lib/gitCoach';
import { CommandEvent, missionOfTheDay } from '@/lib/gitMissions';

const RebaseSimulator = dynamic(() => import('@/components/RebaseSimulator'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Rebase Lab...</div>
});

const TimeMachine = dynamic(() => import('@/components/TimeMachine'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Time Machine...</div>
});

const ChallengeMode = dynamic(() => import('@/components/ChallengeMode'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Challenge Arena...</div>
});

const commandCards: CommandCardProps[] = [
  {
    command: 'git merge feature',
    summary: 'Integrates feature work into main. If histories diverged, Git creates a merge node joining both parents.',
    beforeGraph: {
      title: 'Before',
      nodes: [
        { id: 'm1', x: 36, y: 46, branch: 'main' },
        { id: 'm2', x: 92, y: 46, branch: 'main', head: true },
        { id: 'f1', x: 92, y: 98, branch: 'feature' },
        { id: 'f2', x: 150, y: 98, branch: 'feature' }
      ],
      edges: [
        { from: 'm1', to: 'm2', branch: 'main' },
        { from: 'm2', to: 'f1', branch: 'feature' },
        { from: 'f1', to: 'f2', branch: 'feature' }
      ]
    },
    afterGraph: {
      title: 'After',
      nodes: [
        { id: 'm1', x: 36, y: 46, branch: 'main' },
        { id: 'm2', x: 92, y: 46, branch: 'main' },
        { id: 'f1', x: 92, y: 98, branch: 'feature' },
        { id: 'f2', x: 150, y: 98, branch: 'feature' },
        { id: 'mg', x: 206, y: 70, branch: 'merge', head: true }
      ],
      edges: [
        { from: 'm1', to: 'm2', branch: 'main' },
        { from: 'm2', to: 'mg', branch: 'main' },
        { from: 'm2', to: 'f1', branch: 'feature' },
        { from: 'f1', to: 'f2', branch: 'feature' },
        { from: 'f2', to: 'mg', branch: 'feature' }
      ]
    }
  },
  {
    command: 'git rebase main',
    summary: 'Moves feature commits on top of latest main so history stays linear and easier to reason about.',
    beforeGraph: {
      title: 'Before',
      nodes: [
        { id: 'rm1', x: 36, y: 46, branch: 'main' },
        { id: 'rm2', x: 92, y: 46, branch: 'main' },
        { id: 'rf1', x: 92, y: 98, branch: 'feature' },
        { id: 'rf2', x: 150, y: 98, branch: 'feature', head: true }
      ],
      edges: [
        { from: 'rm1', to: 'rm2', branch: 'main' },
        { from: 'rm2', to: 'rf1', branch: 'feature' },
        { from: 'rf1', to: 'rf2', branch: 'feature' }
      ]
    },
    afterGraph: {
      title: 'After',
      nodes: [
        { id: 'ram1', x: 36, y: 46, branch: 'main' },
        { id: 'ram2', x: 92, y: 46, branch: 'main' },
        { id: 'raf1', x: 150, y: 46, branch: 'feature' },
        { id: 'raf2', x: 206, y: 46, branch: 'feature', head: true }
      ],
      edges: [
        { from: 'ram1', to: 'ram2', branch: 'main' },
        { from: 'ram2', to: 'raf1', branch: 'feature' },
        { from: 'raf1', to: 'raf2', branch: 'feature' }
      ]
    }
  },
  {
    command: 'git reset --hard HEAD~1',
    summary: 'Moves branch pointer back and resets index + working tree to target commit in one shot.',
    beforeGraph: {
      title: 'Before',
      nodes: [
        { id: 'hs1', x: 36, y: 72, branch: 'main' },
        { id: 'hs2', x: 92, y: 72, branch: 'main' },
        { id: 'hs3', x: 150, y: 72, branch: 'main', head: true }
      ],
      edges: [
        { from: 'hs1', to: 'hs2', branch: 'main' },
        { from: 'hs2', to: 'hs3', branch: 'main' }
      ],
      note: 'Index: staged | Working tree: modified'
    },
    afterGraph: {
      title: 'After',
      nodes: [
        { id: 'ha1', x: 36, y: 72, branch: 'main' },
        { id: 'ha2', x: 92, y: 72, branch: 'main', head: true },
        { id: 'ha3', x: 150, y: 72, branch: 'main' }
      ],
      edges: [
        { from: 'ha1', to: 'ha2', branch: 'main' },
        { from: 'ha2', to: 'ha3', branch: 'main' }
      ],
      note: 'Index: synced | Working tree: synced'
    }
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
  const [commandHistory, setCommandHistory] = useState<CommandEvent[]>([]);
  const [missionXp, setMissionXp] = useState(0);
  const [clearedMissions, setClearedMissions] = useState<string[]>([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [focusedMissionId, setFocusedMissionId] = useState<string | null>(null);
  const [coachTip, setCoachTip] = useState('Run a command to get contextual Git coaching.');
  const [sandboxResetSignal, setSandboxResetSignal] = useState(0);

  const todayMission = useMemo(() => missionOfTheDay(), []);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const stats = useMemo(
    () => ({
      commits: repoState.commits.length,
      branches: repoState.branches.length,
      stash: repoState.stashes.length,
      xp: learnedCommands.length * 25 + missionXp
    }),
    [repoState, learnedCommands.length, missionXp]
  );

  useEffect(() => {
    const storedLevel = window.localStorage.getItem('gitviz_level') as ExperienceLevel | null;
    const storedCommands = window.localStorage.getItem('gitviz_learned');
    const storedMissionXp = window.localStorage.getItem('gitviz_mission_xp');
    const storedCleared = window.localStorage.getItem('gitviz_cleared_missions');
    const storedStreak = window.localStorage.getItem('gitviz_daily_streak');
    const storedDailyDate = window.localStorage.getItem('gitviz_last_daily_date');
    if (storedLevel) setExperienceLevel(storedLevel);
    if (storedCommands) setLearnedCommands(JSON.parse(storedCommands));
    if (storedMissionXp) setMissionXp(Number(storedMissionXp));
    if (storedCleared) setClearedMissions(JSON.parse(storedCleared));
    if (storedStreak) setDailyStreak(Number(storedStreak));
    if (storedDailyDate === todayKey) setDailyCompleted(true);
    setShowOnboarding(true);
  }, [todayKey]);

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

  const trackCommandEvent = (
    rawCommand: string,
    success: boolean,
    source: 'sandbox' | 'explorer',
    beforeState: RepoState,
    afterState: RepoState
  ) => {
    setCommandHistory((prev) => [
      ...prev,
      { raw: rawCommand, success, source, timestamp: Date.now() }
    ]);
    registerCommand(rawCommand, success);
    setCoachTip(buildCoachFeedback(rawCommand, success, beforeState, afterState));
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
    const before = repoState;
    const result = executeGitCommand(repoState, runnable);
    setRepoState(result.nextState);
    trackCommandEvent(runnable, result.success, 'explorer', before, result.nextState);
    window.location.hash = 'sandbox';
  };

  const resetLab = () => {
    setRepoState(createInitialRepoState());
    setCommandHistory([]);
    setCoachTip('Lab reset. Start with git status and follow mission objectives.');
    setSandboxResetSignal((value) => value + 1);
  };

  const startFreshAttempt = () => {
    setRepoState(createInitialRepoState());
    setCommandHistory([]);
    setCoachTip('Fresh attempt started. Follow mission objectives in the sandbox.');
    setSandboxResetSignal((value) => value + 1);
  };

  const handleMissionClear = (
    missionId: string,
    _score: number,
    _stars: 1 | 2 | 3,
    rewardXp: number
  ) => {
    setClearedMissions((prev) => {
      if (prev.includes(missionId)) return prev;
      const next = [...prev, missionId];
      window.localStorage.setItem('gitviz_cleared_missions', JSON.stringify(next));
      return next;
    });

    setMissionXp((prev) => {
      const next = prev + rewardXp;
      window.localStorage.setItem('gitviz_mission_xp', String(next));
      return next;
    });

    if (missionId !== todayMission.id || dailyCompleted) return;

    const previousDailyDate = window.localStorage.getItem('gitviz_last_daily_date');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    setDailyStreak((prev) => {
      const next = previousDailyDate === yesterdayKey ? prev + 1 : 1;
      window.localStorage.setItem('gitviz_daily_streak', String(next));
      return next;
    });
    window.localStorage.setItem('gitviz_last_daily_date', todayKey);
    setDailyCompleted(true);
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

      <section>
        <DailyChallenge
          mission={todayMission}
          isCompletedToday={dailyCompleted}
          streak={dailyStreak}
          onJumpToMission={(missionId) => {
            setFocusedMissionId(missionId);
            window.location.hash = 'missions';
          }}
        />
      </section>

      <section id="sandbox" className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.div {...reveal} className="min-h-[560px]">
          <div className="surface-soft mb-3 rounded-xl p-3 text-xs text-slate-200">
            <p className="mb-1 uppercase tracking-widest text-[10px] text-gitBlue">Git Coach</p>
            <p>{coachTip}</p>
          </div>
          <TerminalSandbox
            state={repoState}
            onStateChange={setRepoState}
            resetSignal={sandboxResetSignal}
            onCommand={(command, success, nextState) =>
              trackCommandEvent(command, success, 'sandbox', repoState, nextState)
            }
          />
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

      <section id="missions">
        <MissionCampaign
          repoState={repoState}
          commandHistory={commandHistory}
          onResetLab={resetLab}
          onStartFreshAttempt={startFreshAttempt}
          clearedMissionIds={clearedMissions}
          onMissionClear={handleMissionClear}
          focusMissionId={focusedMissionId}
        />
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
