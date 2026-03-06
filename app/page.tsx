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
import WebsiteTutorial from '@/components/WebsiteTutorial';
import { RepoState, createInitialRepoState } from '@/lib/gitEngine';
import { executeGitCommand } from '@/lib/gitCommands';
import { ExperienceLevel, onboardingTracks } from '@/lib/gitChallenges';
import { buildCoachFeedback } from '@/lib/gitCoach';
import { CommandEvent, evaluateMission, missionOfTheDay, gitMissions } from '@/lib/gitMissions';

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
  const [practiceMissionIndex, setPracticeMissionIndex] = useState(0);
  const [practiceAttemptStartIndex, setPracticeAttemptStartIndex] = useState(0);
  const [practiceAttemptStartTime, setPracticeAttemptStartTime] = useState(() => Date.now());
  const [practiceHintLevel, setPracticeHintLevel] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

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
    const tutorialDone = window.localStorage.getItem('gitviz_tutorial_done') === '1';
    if (storedLevel) setExperienceLevel(storedLevel);
    if (storedCommands) setLearnedCommands(JSON.parse(storedCommands));
    if (storedMissionXp) setMissionXp(Number(storedMissionXp));
    if (storedCleared) setClearedMissions(JSON.parse(storedCleared));
    if (storedStreak) setDailyStreak(Number(storedStreak));
    if (storedDailyDate === todayKey) setDailyCompleted(true);
    setHasSeenTutorial(tutorialDone);
    setShowOnboarding(true);
    if (!tutorialDone) setTutorialOpen(true);
  }, [todayKey]);

  const handleLevelSelect = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    setShowOnboarding(false);
    window.localStorage.setItem('gitviz_level', level);
    if (!hasSeenTutorial) setTutorialOpen(true);
  };

  const tutorialSteps: { title: string; description: string; cta: string; view: AppView }[] = [
    {
      title: 'Learn Tab: Your Main Journey',
      description:
        'Start here. Pick one mission, run commands, and clear objectives with hints and scoring.',
      cta: 'Go To Learn',
      view: 'learn'
    },
    {
      title: 'Practice Tab: Solve Like LeetCode',
      description:
        'Left side shows the task and objectives. Right side is live terminal + graph to solve in real time.',
      cta: 'Go To Practice',
      view: 'practice'
    },
    {
      title: 'Sandbox Tab: Free Exploration',
      description:
        'Try any command sequence and inspect repository behavior with visual feedback and Git coach tips.',
      cta: 'Go To Sandbox',
      view: 'sandbox'
    },
    {
      title: 'Progress Tab: Track Growth',
      description:
        'Review XP, cleared missions, unlocked achievements, and recommended commands to practice next.',
      cta: 'Go To Progress',
      view: 'progress'
    }
  ];

  const closeTutorial = () => {
    setTutorialOpen(false);
    setTutorialStep(0);
    setHasSeenTutorial(true);
    window.localStorage.setItem('gitviz_tutorial_done', '1');
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
    if (view !== 'practice') setView('sandbox');
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

  const practiceMission = gitMissions[practiceMissionIndex];
  const practiceEvents = useMemo(
    () => commandHistory.slice(practiceAttemptStartIndex),
    [commandHistory, practiceAttemptStartIndex]
  );
  const practiceEvaluation = useMemo(
    () =>
      evaluateMission(
        practiceMission,
        repoState,
        practiceEvents,
        practiceAttemptStartTime,
        practiceHintLevel
      ),
    [practiceMission, repoState, practiceEvents, practiceAttemptStartTime, practiceHintLevel]
  );

  useEffect(() => {
    if (view !== 'practice') return;
    setPracticeAttemptStartIndex(commandHistory.length);
    setPracticeAttemptStartTime(Date.now());
    setPracticeHintLevel(0);
  }, [practiceMissionIndex, view]); // start a new mission attempt when mission changes

  useEffect(() => {
    if (view !== 'practice') return;
    if (!practiceEvaluation.passed) return;
    handleMissionClear(
      practiceMission.id,
      practiceEvaluation.score,
      practiceEvaluation.stars,
      practiceMission.rewardXp
    );
  }, [view, practiceEvaluation.passed, practiceEvaluation.score, practiceEvaluation.stars, practiceMission.id, practiceMission.rewardXp]);

  const startPracticeAttempt = () => {
    setRepoState(createInitialRepoState());
    setCommandHistory([]);
    setCoachTip('Practice attempt started. Solve the mission using terminal commands.');
    setSandboxResetSignal((value) => value + 1);
    setPracticeAttemptStartIndex(0);
    setPracticeAttemptStartTime(Date.now());
    setPracticeHintLevel(0);
  };

  return (
    <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 md:px-8 md:py-8">
      <OnboardingModal open={showOnboarding} onSelect={handleLevelSelect} />
      <WebsiteTutorial
        open={tutorialOpen && !showOnboarding}
        currentStep={tutorialStep}
        steps={tutorialSteps}
        onPrev={() => setTutorialStep((value) => Math.max(0, value - 1))}
        onNext={() => {
          if (tutorialStep >= tutorialSteps.length - 1) {
            closeTutorial();
            return;
          }
          setTutorialStep((value) => value + 1);
        }}
        onClose={closeTutorial}
        onGoToView={(nextView) => setView(nextView)}
      />

      <section className="surface rounded-2xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="git-chip rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">Git Visualizer Lab</span>
            <p className="text-xs text-slate-400">Guided Git learning journey</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTutorialOpen(true)}
              className="rounded-lg border border-gitGreen/50 bg-gitGreen/10 px-3 py-1.5 text-xs font-semibold text-gitGreen"
            >
              Website Tutorial
            </button>
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

      <section className="grid gap-3 md:grid-cols-4">
        <div className="surface-soft rounded-xl px-3 py-2">
          <p className="text-[11px] uppercase tracking-widest text-slate-400">Rank</p>
          <p className="font-semibold text-gitBlue">
            {stats.xp >= 1600 ? 'Git Master' : stats.xp >= 900 ? 'Advanced' : stats.xp >= 400 ? 'Intermediate' : 'Beginner'}
          </p>
        </div>
        <div className="surface-soft rounded-xl px-3 py-2">
          <p className="text-[11px] uppercase tracking-widest text-slate-400">Mission Progress</p>
          <p className="font-semibold text-gitGreen">{clearedMissions.length}/{gitMissions.length} cleared</p>
        </div>
        <div className="surface-soft rounded-xl px-3 py-2">
          <p className="text-[11px] uppercase tracking-widest text-slate-400">Daily Streak</p>
          <p className="font-semibold text-gitGreen">{dailyStreak} day{dailyStreak === 1 ? '' : 's'}</p>
        </div>
        <div className="surface-soft rounded-xl px-3 py-2">
          <p className="text-[11px] uppercase tracking-widest text-slate-400">XP Meter</p>
          <div className="mt-1 h-1.5 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gitBlue" style={{ width: `${Math.min(100, (stats.xp % 400) / 4)}%` }} />
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
            <LearningPath
              focusCommands={levelTrack}
              learnedCommands={learnedCommands}
              onStartQuest={(command) => {
                simulateFromExplorer(command);
                setView('sandbox');
              }}
            />
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
                const index = gitMissions.findIndex((mission) => mission.id === missionId);
                if (index >= 0) setPracticeMissionIndex(index);
                setView('practice');
              }}
            />
          </motion.section>

          <section className="grid items-stretch gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <motion.aside {...reveal} className="surface flex min-h-[760px] flex-col rounded-2xl p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {gitMissions.map((mission, index) => (
                  <button
                    key={mission.id}
                    onClick={() => setPracticeMissionIndex(index)}
                    className={`rounded-md px-2 py-1 text-[11px] ${
                      index === practiceMissionIndex
                        ? 'border border-gitBlue/60 bg-gitBlue/15 text-gitBlue'
                        : 'border border-white/15 text-slate-300'
                    }`}
                  >
                    {mission.level}
                  </button>
                ))}
              </div>

              <div className="surface-soft mb-3 rounded-xl p-3">
                <p className="text-xs uppercase tracking-widest text-gitBlue">
                  Mission {practiceMission.level} - {practiceMission.tier}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{practiceMission.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{practiceMission.story}</p>
              </div>

              <div className="surface-soft mb-3 rounded-xl p-3">
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Objectives</p>
                <div className="space-y-2">
                  {practiceMission.objectives.map((objective) => {
                    const done = objective.check(repoState, practiceEvents);
                    return (
                      <div
                        key={objective.id}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          done
                            ? 'border-gitGreen/50 bg-gitGreen/10 text-gitGreen'
                            : 'border-white/10 text-slate-300'
                        }`}
                      >
                        {done ? 'Done' : 'Pending'} - {objective.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="surface-soft mb-3 rounded-xl p-3 text-xs text-slate-200">
                <p className="mb-1 uppercase tracking-widest text-[10px] text-gitBlue">Hint</p>
                <p>{practiceMission.hints[Math.min(practiceHintLevel, 2)]}</p>
                <button
                  onClick={() => setPracticeHintLevel((value) => Math.min(value + 1, 2))}
                  className="mt-2 rounded-md border border-gitBlue/50 px-2 py-1 text-[11px] text-gitBlue"
                >
                  Reveal Next Hint
                </button>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-white/10 px-2 py-1">Score: {practiceEvaluation.score}</div>
                <div className="rounded-md border border-white/10 px-2 py-1">Stars: {practiceEvaluation.stars}</div>
                <div className="rounded-md border border-white/10 px-2 py-1">
                  Progress: {practiceEvaluation.completed}/{practiceEvaluation.total}
                </div>
                <div className="rounded-md border border-white/10 px-2 py-1">
                  Commands: {practiceEvaluation.commandCount}
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  onClick={startPracticeAttempt}
                  className="rounded-lg bg-gitGreen px-3 py-1.5 text-xs font-semibold text-black"
                >
                  Start Practice Attempt
                </button>
                <button
                  onClick={() => setView('learn')}
                  className="rounded-lg border border-gitBlue/50 px-3 py-1.5 text-xs text-gitBlue"
                >
                  Back To Learn
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <CommandExplorer onSelectCommand={simulateFromExplorer} />
              </div>
            </motion.aside>

            <motion.div {...reveal} transition={{ duration: 0.45, delay: 0.06 }} className="grid min-h-[760px] gap-3 xl:grid-rows-[auto_1fr]">
              <div className="surface-soft rounded-xl p-3 text-xs text-slate-200">
                <p className="mb-1 uppercase tracking-widest text-[10px] text-gitBlue">Git Coach</p>
                <p>{coachTip}</p>
              </div>

              <div className="grid min-h-0 gap-3 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="min-h-0">
                  <TerminalSandbox
                    state={repoState}
                    onStateChange={setRepoState}
                    resetSignal={sandboxResetSignal}
                    onCommand={(command, success, nextState) =>
                      trackCommandEvent(command, success, 'sandbox', repoState, nextState)
                    }
                  />
                </div>
                <div className="min-h-0">
                  <RepoVisualizer state={repoState} />
                </div>
              </div>
            </motion.div>
          </section>

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
