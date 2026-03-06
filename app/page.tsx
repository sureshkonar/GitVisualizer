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
import { CommandEvent, missionOfTheDay, gitMissions } from '@/lib/gitMissions';

const RebaseSimulator = dynamic(() => import('@/components/RebaseSimulator'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Rebase Lab...</div>
});

const TimeMachine = dynamic(() => import('@/components/TimeMachine'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Time Machine...</div>
});

const ChallengeMode = dynamic(() => import('@/components/ChallengeMode'), {
  loading: () => <div className="surface rounded-3xl p-5 text-sm text-slate-400">Loading Challenge Arena...</div>
});

type AppView = 'learn' | 'practice' | 'sandbox' | 'progress';

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

const navItems: { id: AppView; label: string }[] = [
  { id: 'learn', label: 'Learn' },
  { id: 'practice', label: 'Practice' },
  { id: 'sandbox', label: 'Sandbox' },
  { id: 'progress', label: 'Progress' }
];

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 }
};

export default function HomePage() {
  const [view, setView] = useState<AppView>('learn');
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
    setView('sandbox');
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
    setView('sandbox');
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

  const nextMission = useMemo(
    () => gitMissions.find((mission) => !clearedMissions.includes(mission.id)) ?? gitMissions[gitMissions.length - 1],
    [clearedMissions]
  );

  const recommendedCommands = useMemo(
    () => levelTrack.filter((command) => !learnedCommands.includes(command)).slice(0, 6),
    [levelTrack, learnedCommands]
  );

  return (
    <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 md:px-8 md:py-8">
      <OnboardingModal open={showOnboarding} onSelect={handleLevelSelect} />

      <section className="surface rounded-2xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="git-chip rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">Git Visualizer Lab</span>
            <p className="text-xs text-slate-400">Guided Git learning journey</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  view === item.id
                    ? 'bg-gitBlue/20 text-gitBlue border border-gitBlue/50'
                    : 'border border-white/15 text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {view === 'learn' ? (
        <>
          <motion.section {...reveal} className="surface rounded-3xl p-6 md:p-8">
            <p className="mb-3 inline-flex rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gitGreen">Guided Learn Mode (Recommended)</p>
            <h1 className="headline mb-3 text-4xl font-semibold md:text-6xl">Learn Git Through Missions</h1>
            <p className="max-w-3xl text-sm text-slate-300 md:text-base">
              Start with one clear mission at a time. Run commands, watch the graph react, and progress from beginner workflows to advanced history surgery.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Current Track</p>
                <p className="font-semibold text-slate-100">{experienceLevel ?? 'Choose in onboarding'}</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Next Mission</p>
                <p className="font-semibold text-slate-100">{nextMission.title}</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Total XP</p>
                <p className="font-semibold text-gitGreen">{stats.xp}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFocusedMissionId(nextMission.id);
                  setView('learn');
                  window.location.hash = 'missions';
                }}
                className="rounded-xl bg-gitGreen px-4 py-2 text-sm font-semibold text-black"
              >
                Continue Mission
              </button>
              <button onClick={() => setView('sandbox')} className="rounded-xl border border-gitBlue/50 px-4 py-2 text-sm font-semibold text-gitBlue">
                Open Sandbox
              </button>
            </div>
          </motion.section>

          <motion.section {...reveal} id="missions">
            <MissionCampaign
              repoState={repoState}
              commandHistory={commandHistory}
              onResetLab={resetLab}
              onStartFreshAttempt={startFreshAttempt}
              clearedMissionIds={clearedMissions}
              onMissionClear={handleMissionClear}
              focusMissionId={focusedMissionId}
            />
          </motion.section>

          <motion.section {...reveal}>
            <LearningPath focusCommands={levelTrack} />
          </motion.section>
        </>
      ) : null}

      {view === 'practice' ? (
        <>
          <motion.section {...reveal}>
            <DailyChallenge
              mission={todayMission}
              isCompletedToday={dailyCompleted}
              streak={dailyStreak}
              onJumpToMission={(missionId) => {
                setFocusedMissionId(missionId);
                setView('learn');
              }}
            />
          </motion.section>

          <section className="grid gap-4 xl:grid-cols-3">
            <motion.div {...reveal}>
              <ChallengeMode />
            </motion.div>
            <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.06 }}>
              <RebaseSimulator state={repoState} onStateChange={setRepoState} />
            </motion.div>
            <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.1 }}>
              <TimeMachine state={repoState} onStateChange={setRepoState} />
            </motion.div>
          </section>

          <motion.section {...reveal} transition={{ duration: 0.45 }} className="grid gap-4 xl:grid-cols-3">
            {commandCards.map((card) => (
              <CommandCard key={card.command} {...card} />
            ))}
          </motion.section>
        </>
      ) : null}

      {view === 'sandbox' ? (
        <>
          <motion.section {...reveal}>
            <CommandExplorer onSelectCommand={simulateFromExplorer} />
          </motion.section>

          <section id="sandbox" className="grid items-stretch gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...reveal} className="flex min-h-[640px] flex-col">
              <div className="surface-soft mb-3 rounded-xl p-3 text-xs text-slate-200">
                <p className="mb-1 uppercase tracking-widest text-[10px] text-gitBlue">Git Coach</p>
                <p>{coachTip}</p>
              </div>
              <div className="min-h-0 flex-1">
                <TerminalSandbox
                  state={repoState}
                  onStateChange={setRepoState}
                  resetSignal={sandboxResetSignal}
                  onCommand={(command, success, nextState) =>
                    trackCommandEvent(command, success, 'sandbox', repoState, nextState)
                  }
                />
              </div>
            </motion.div>
            <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.07 }} className="min-h-[640px]">
              <RepoVisualizer state={repoState} />
            </motion.div>
          </section>
        </>
      ) : null}

      {view === 'progress' ? (
        <>
          <motion.section {...reveal} className="surface rounded-2xl p-5">
            <h3 className="mb-3 text-2xl font-semibold">Progress Dashboard</h3>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Total XP</p>
                <p className="font-mono text-xl text-gitGreen">{stats.xp}</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Missions Cleared</p>
                <p className="font-mono text-xl text-gitBlue">{clearedMissions.length}/{gitMissions.length}</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Commands Mastered</p>
                <p className="font-mono text-xl text-gitBlue">{learnedCommands.length}</p>
              </div>
              <div className="surface-soft rounded-xl p-3">
                <p className="text-xs text-slate-400">Daily Streak</p>
                <p className="font-mono text-xl text-gitGreen">{dailyStreak}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {achievements.length ? (
                  achievements.map((item) => (
                    <span key={item} className="rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-xs text-gitGreen">
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No badges unlocked yet. Complete missions to unlock achievements.</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="surface-soft rounded-xl p-3">
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Recommended Next Commands</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedCommands.length ? (
                    recommendedCommands.map((command) => (
                      <span key={command} className="rounded-full border border-white/15 px-2 py-1 font-mono text-[11px] text-slate-300">
                        {command}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">You completed your current track recommendations.</p>
                  )}
                </div>
              </div>

              <div className="surface-soft rounded-xl p-3">
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Cleared Missions</p>
                <div className="max-h-36 space-y-1 overflow-auto text-xs text-slate-300">
                  {clearedMissions.length ? (
                    clearedMissions.map((id) => {
                      const mission = gitMissions.find((item) => item.id === id);
                      return <p key={id}>{mission?.level}. {mission?.title}</p>;
                    })
                  ) : (
                    <p className="text-slate-400">No mission cleared yet.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </>
      ) : null}
    </main>
  );
}
