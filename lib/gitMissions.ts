import { RepoState } from './gitEngine';

export interface CommandEvent {
  raw: string;
  success: boolean;
  timestamp: number;
  source: 'sandbox' | 'explorer';
}

export interface MissionObjective {
  id: string;
  label: string;
  check: (repo: RepoState, events: CommandEvent[]) => boolean;
}

export interface GitMission {
  id: string;
  level: number;
  tier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Git Master';
  title: string;
  story: string;
  recommended: string[];
  maxCommands: number;
  timeLimitSec: number;
  rewardXp: number;
  objectives: MissionObjective[];
  hints: [string, string, string];
}

export interface MissionEvaluation {
  completed: number;
  total: number;
  passed: boolean;
  score: number;
  stars: 1 | 2 | 3;
  commandCount: number;
  elapsedSec: number;
}

const norm = (cmd: string) => cmd.trim().toLowerCase();

const successfulCommands = (events: CommandEvent[]) =>
  events.filter((event) => event.success).map((event) => norm(event.raw));

const commandUsed = (events: CommandEvent[], pattern: string) => {
  const p = norm(pattern);
  return successfulCommands(events).some((cmd) => cmd === p || cmd.startsWith(`${p} `));
};

const branchExists = (repo: RepoState, name: string) =>
  repo.branches.some((branch) => branch.name === name);

const hasMergeCommit = (repo: RepoState) =>
  repo.commits.some((commit) => commit.parentIds.length > 1);

const hasRecentCommit = (repo: RepoState) => repo.commits.length >= 2;

export const gitMissions: GitMission[] = [
  {
    id: 'mission-01',
    level: 1,
    tier: 'Beginner',
    title: 'Terminal Wakeup',
    story: 'Initialize your first Git workflow and inspect repository status.',
    recommended: ['git init', 'git status'],
    maxCommands: 4,
    timeLimitSec: 90,
    rewardXp: 60,
    hints: [
      'Use a command that reports repository state.',
      'You need status visibility before coding.',
      'Run: git status'
    ],
    objectives: [
      { id: 'status', label: 'Run git status', check: (_repo, events) => commandUsed(events, 'git status') }
    ]
  },
  {
    id: 'mission-02',
    level: 2,
    tier: 'Beginner',
    title: 'First Snapshot',
    story: 'Stage changes and create your first useful commit.',
    recommended: ['git add .', 'git commit -m "..."'],
    maxCommands: 6,
    timeLimitSec: 120,
    rewardXp: 80,
    hints: [
      'You need to stage, then create a snapshot.',
      'Think: index first, commit second.',
      'Run: git add . then git commit -m "..."'
    ],
    objectives: [
      { id: 'add', label: 'Run git add .', check: (_repo, events) => commandUsed(events, 'git add .') },
      { id: 'commit', label: 'Create a commit', check: (repo) => hasRecentCommit(repo) }
    ]
  },
  {
    id: 'mission-03',
    level: 3,
    tier: 'Beginner',
    title: 'Branch Out',
    story: 'Create a feature branch and move HEAD onto it.',
    recommended: ['git branch feature', 'git checkout feature'],
    maxCommands: 6,
    timeLimitSec: 120,
    rewardXp: 90,
    hints: [
      'Create a new branch and move HEAD.',
      'Use branch creation and checkout/switch.',
      'Run: git branch feature then git checkout feature'
    ],
    objectives: [
      { id: 'create-feature', label: 'Create feature branch', check: (repo) => branchExists(repo, 'feature') },
      { id: 'switch-feature', label: 'Switch to feature', check: (repo) => repo.currentBranch === 'feature' }
    ]
  },
  {
    id: 'mission-04',
    level: 4,
    tier: 'Intermediate',
    title: 'Merge Protocol',
    story: 'Merge feature back into main and confirm integrated history.',
    recommended: ['git checkout main', 'git merge feature'],
    maxCommands: 8,
    timeLimitSec: 140,
    rewardXp: 120,
    hints: [
      'Integration happens from main branch.',
      'Switch to main before merging feature.',
      'Run: git checkout main then git merge feature'
    ],
    objectives: [
      { id: 'on-main', label: 'Be on main branch', check: (repo) => repo.currentBranch === 'main' },
      { id: 'merged', label: 'Create merge integration', check: (repo, events) => hasMergeCommit(repo) || commandUsed(events, 'git merge feature') }
    ]
  },
  {
    id: 'mission-05',
    level: 5,
    tier: 'Intermediate',
    title: 'Remote Pulse',
    story: 'Practice team sync commands used in collaboration workflows.',
    recommended: ['git fetch', 'git pull', 'git push'],
    maxCommands: 7,
    timeLimitSec: 120,
    rewardXp: 120,
    hints: [
      'This mission is about remote sync sequence.',
      'You need all three: fetch, pull, push.',
      'Run: git fetch, git pull, git push'
    ],
    objectives: [
      { id: 'fetch', label: 'Run git fetch', check: (_repo, events) => commandUsed(events, 'git fetch') },
      { id: 'pull', label: 'Run git pull', check: (_repo, events) => commandUsed(events, 'git pull') },
      { id: 'push', label: 'Run git push', check: (_repo, events) => commandUsed(events, 'git push') }
    ]
  },
  {
    id: 'mission-06',
    level: 6,
    tier: 'Intermediate',
    title: 'Hotfix Stash',
    story: 'Stash temporary work and restore it cleanly.',
    recommended: ['git stash', 'git stash pop'],
    maxCommands: 6,
    timeLimitSec: 110,
    rewardXp: 130,
    hints: [
      'Save WIP temporarily, then restore it.',
      'Two-step stash flow is required.',
      'Run: git stash then git stash pop'
    ],
    objectives: [
      { id: 'stash', label: 'Run git stash', check: (_repo, events) => commandUsed(events, 'git stash') },
      { id: 'pop', label: 'Run git stash pop', check: (_repo, events) => commandUsed(events, 'git stash pop') }
    ]
  },
  {
    id: 'mission-07',
    level: 7,
    tier: 'Advanced',
    title: 'History Surgeon',
    story: 'Use reset modes to control HEAD, staging area, and working tree.',
    recommended: ['git reset --soft', 'git reset --mixed', 'git reset --hard'],
    maxCommands: 9,
    timeLimitSec: 150,
    rewardXp: 150,
    hints: [
      'Demonstrate all reset modes.',
      'Soft, mixed, and hard are all required.',
      'Run: git reset --soft, git reset --mixed, git reset --hard'
    ],
    objectives: [
      { id: 'soft', label: 'Use git reset --soft', check: (_repo, events) => commandUsed(events, 'git reset --soft') },
      { id: 'mixed', label: 'Use git reset --mixed', check: (_repo, events) => commandUsed(events, 'git reset --mixed') },
      { id: 'hard', label: 'Use git reset --hard', check: (_repo, events) => commandUsed(events, 'git reset --hard') }
    ]
  },
  {
    id: 'mission-08',
    level: 8,
    tier: 'Advanced',
    title: 'Linear Timeline',
    story: 'Rebase your branch and produce a clean history chain.',
    recommended: ['git checkout feature', 'git rebase main'],
    maxCommands: 8,
    timeLimitSec: 140,
    rewardXp: 170,
    hints: [
      'History should be replayed on top of main.',
      'You may need to switch to feature first.',
      'Run: git checkout feature then git rebase main'
    ],
    objectives: [
      { id: 'rebase', label: 'Run git rebase main', check: (_repo, events) => commandUsed(events, 'git rebase main') }
    ]
  },
  {
    id: 'mission-09',
    level: 9,
    tier: 'Advanced',
    title: 'Selective Recovery',
    story: 'Apply and revert targeted history edits.',
    recommended: ['git cherry-pick <id>', 'git revert <id>'],
    maxCommands: 8,
    timeLimitSec: 150,
    rewardXp: 180,
    hints: [
      'Apply a specific commit and then undo one.',
      'Both cherry-pick and revert are required.',
      'Run: git cherry-pick <id> and git revert <id>'
    ],
    objectives: [
      { id: 'pick', label: 'Run git cherry-pick', check: (_repo, events) => commandUsed(events, 'git cherry-pick') },
      { id: 'revert', label: 'Run git revert', check: (_repo, events) => commandUsed(events, 'git revert') }
    ]
  },
  {
    id: 'mission-10',
    level: 10,
    tier: 'Git Master',
    title: 'Forensics Finale',
    story: 'Debug repository history with forensic Git tools.',
    recommended: ['git reflog', 'git bisect', 'git blame'],
    maxCommands: 10,
    timeLimitSec: 180,
    rewardXp: 220,
    hints: [
      'Use forensic commands to inspect history and blame changes.',
      'All three are needed: reflog, bisect, blame.',
      'Run: git reflog, git bisect, git blame'
    ],
    objectives: [
      { id: 'reflog', label: 'Run git reflog', check: (_repo, events) => commandUsed(events, 'git reflog') },
      { id: 'bisect', label: 'Run git bisect', check: (_repo, events) => commandUsed(events, 'git bisect') },
      { id: 'blame', label: 'Run git blame', check: (_repo, events) => commandUsed(events, 'git blame') }
    ]
  }
];

export const evaluateMission = (
  mission: GitMission,
  repo: RepoState,
  events: CommandEvent[],
  startedAt: number,
  hintsUsed = 0
): MissionEvaluation => {
  const completed = mission.objectives.filter((objective) => objective.check(repo, events)).length;
  const total = mission.objectives.length;
  const passed = completed === total;

  const elapsedSec = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
  const commandCount = events.length;

  const objectiveRatio = completed / total;
  const efficiencyScore = Math.max(0, 1 - commandCount / Math.max(mission.maxCommands, 1));
  const speedScore = Math.max(0, 1 - elapsedSec / Math.max(mission.timeLimitSec, 1));
  const rawScore = (objectiveRatio * 0.65 + efficiencyScore * 0.2 + speedScore * 0.15) * 1000;
  const hintPenalty = Math.min(150, hintsUsed * 60);
  const score = Math.max(0, Math.round(rawScore - hintPenalty));

  let stars: 1 | 2 | 3 = 1;
  if (passed && score >= 750) stars = 3;
  else if (passed && score >= 550) stars = 2;

  return {
    completed,
    total,
    passed,
    score,
    stars,
    commandCount,
    elapsedSec
  };
};

export const missionOfTheDay = (seedDate = new Date()): GitMission => {
  const key = `${seedDate.getUTCFullYear()}-${seedDate.getUTCMonth() + 1}-${seedDate.getUTCDate()}`;
  const hash = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return gitMissions[hash % gitMissions.length];
};
