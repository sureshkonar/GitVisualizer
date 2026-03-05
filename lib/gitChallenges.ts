export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface GitChallenge {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  objective: string;
  expectedCommands: string[];
  xp: number;
  timeLimit: number;
}

export const gitChallenges: GitChallenge[] = [
  {
    id: 'challenge-branch-merge',
    title: 'Feature Merge Sprint',
    difficulty: 'Beginner',
    objective: 'Create a feature branch, commit, then merge it back into main.',
    expectedCommands: [
      'git branch feature',
      'git checkout feature',
      'git add .',
      'git commit -m "feature"',
      'git checkout main',
      'git merge feature'
    ],
    xp: 80,
    timeLimit: 150
  },
  {
    id: 'challenge-rebase',
    title: 'Linear History Mastery',
    difficulty: 'Intermediate',
    objective: 'Rebase your branch onto main to keep history linear.',
    expectedCommands: ['git checkout feature', 'git rebase main', 'git checkout main', 'git merge feature'],
    xp: 140,
    timeLimit: 170
  },
  {
    id: 'challenge-recovery',
    title: 'Recover From Mistake',
    difficulty: 'Advanced',
    objective: 'Use reflog and reset to recover repository state after a bad commit.',
    expectedCommands: ['git reflog', 'git reset --hard'],
    xp: 180,
    timeLimit: 120
  }
];

export interface LearningLevel {
  level: number;
  title: string;
  commands: string[];
  reward: string;
}

export const learningLevels: LearningLevel[] = [
  {
    level: 1,
    title: 'Git Basics',
    commands: ['git init', 'git clone', 'git status', 'git add', 'git commit', 'git log'],
    reward: 'Unlocked: Commit Graph View'
  },
  {
    level: 2,
    title: 'File Changes',
    commands: ['git diff', 'git restore', 'git reset', 'git stash'],
    reward: 'Unlocked: Diff Timeline'
  },
  {
    level: 3,
    title: 'Branching',
    commands: ['git branch', 'git checkout', 'git switch', 'git merge', 'git branch -d'],
    reward: 'Unlocked: Branch Heatmap'
  },
  {
    level: 4,
    title: 'Collaboration',
    commands: ['git remote', 'git fetch', 'git pull', 'git push'],
    reward: 'Unlocked: Remote Sync Radar'
  },
  {
    level: 5,
    title: 'Advanced Git',
    commands: ['git rebase', 'git cherry-pick', 'git reflog', 'git bisect', 'git blame', 'git revert', 'git submodule', 'git worktree'],
    reward: 'Unlocked: Rebase Lab + Time Machine'
  }
];
