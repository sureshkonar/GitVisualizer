export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

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

export const onboardingTracks: Record<ExperienceLevel, string[]> = {
  Beginner: ['git init', 'git clone', 'git status', 'git add', 'git commit', 'git log'],
  Intermediate: ['git branch', 'git checkout', 'git merge', 'git pull', 'git push', 'git fetch'],
  Advanced: ['git rebase', 'git cherry-pick', 'git reflog', 'git bisect', 'git submodule', 'git worktree']
};

export interface CommandDoc {
  command: string;
  category:
    | 'Repository Setup'
    | 'Tracking Changes'
    | 'Branching'
    | 'Collaboration'
    | 'History Manipulation'
    | 'Advanced Tools';
  summary: string;
  useCase: string;
  sourceUrl: string;
}

export const commandDocs: CommandDoc[] = [
  { command: 'git init', category: 'Repository Setup', summary: 'Initialize a new Git repository.', useCase: 'Start version control in a new project.', sourceUrl: 'https://git-scm.com/docs/git-init' },
  { command: 'git clone', category: 'Repository Setup', summary: 'Clone an existing repository.', useCase: 'Copy a remote project locally.', sourceUrl: 'https://git-scm.com/docs/git-clone' },
  { command: 'git config', category: 'Repository Setup', summary: 'Read and write Git configuration.', useCase: 'Set user identity and defaults.', sourceUrl: 'https://git-scm.com/docs/git-config' },
  { command: 'git status', category: 'Tracking Changes', summary: 'Show working tree and index state.', useCase: 'Check what changed before committing.', sourceUrl: 'https://git-scm.com/docs/git-status' },
  { command: 'git add', category: 'Tracking Changes', summary: 'Stage file content for commit.', useCase: 'Prepare specific changes for the next commit.', sourceUrl: 'https://git-scm.com/docs/git-add' },
  { command: 'git commit', category: 'Tracking Changes', summary: 'Record staged changes as a commit.', useCase: 'Save a meaningful project snapshot.', sourceUrl: 'https://git-scm.com/docs/git-commit' },
  { command: 'git diff', category: 'Tracking Changes', summary: 'Show differences between states.', useCase: 'Review edits before staging or committing.', sourceUrl: 'https://git-scm.com/docs/git-diff' },
  { command: 'git restore', category: 'Tracking Changes', summary: 'Restore working tree files.', useCase: 'Discard unwanted local edits.', sourceUrl: 'https://git-scm.com/docs/git-restore' },
  { command: 'git branch', category: 'Branching', summary: 'List, create, or delete branches.', useCase: 'Start isolated feature development.', sourceUrl: 'https://git-scm.com/docs/git-branch' },
  { command: 'git checkout', category: 'Branching', summary: 'Switch branches or restore files.', useCase: 'Move between feature and main branches.', sourceUrl: 'https://git-scm.com/docs/git-checkout' },
  { command: 'git switch', category: 'Branching', summary: 'Switch branches with focused semantics.', useCase: 'Safer branch switching than checkout.', sourceUrl: 'https://git-scm.com/docs/git-switch' },
  { command: 'git merge', category: 'Branching', summary: 'Join two development histories.', useCase: 'Integrate feature branch into main.', sourceUrl: 'https://git-scm.com/docs/git-merge' },
  { command: 'git branch -d', category: 'Branching', summary: 'Delete a branch after merge.', useCase: 'Clean up completed branches.', sourceUrl: 'https://git-scm.com/docs/git-branch' },
  { command: 'git remote', category: 'Collaboration', summary: 'Manage remote repository references.', useCase: 'Inspect or configure origin/upstream.', sourceUrl: 'https://git-scm.com/docs/git-remote' },
  { command: 'git fetch', category: 'Collaboration', summary: 'Download refs and objects from remotes.', useCase: 'Get latest remote data without merge.', sourceUrl: 'https://git-scm.com/docs/git-fetch' },
  { command: 'git pull', category: 'Collaboration', summary: 'Fetch and integrate from remote.', useCase: 'Update local branch with remote changes.', sourceUrl: 'https://git-scm.com/docs/git-pull' },
  { command: 'git push', category: 'Collaboration', summary: 'Update remote refs with local commits.', useCase: 'Publish your branch to collaborators.', sourceUrl: 'https://git-scm.com/docs/git-push' },
  { command: 'git rebase', category: 'History Manipulation', summary: 'Reapply commits on top of another base.', useCase: 'Keep branch history linear.', sourceUrl: 'https://git-scm.com/docs/git-rebase' },
  { command: 'git cherry-pick', category: 'History Manipulation', summary: 'Apply specific commit(s) onto current branch.', useCase: 'Port a fix across branches.', sourceUrl: 'https://git-scm.com/docs/git-cherry-pick' },
  { command: 'git revert', category: 'History Manipulation', summary: 'Create commit that undoes earlier changes.', useCase: 'Safely reverse changes in shared history.', sourceUrl: 'https://git-scm.com/docs/git-revert' },
  { command: 'git reset', category: 'History Manipulation', summary: 'Move HEAD and optionally index/worktree.', useCase: 'Uncommit or unstage changes.', sourceUrl: 'https://git-scm.com/docs/git-reset' },
  { command: 'git reflog', category: 'History Manipulation', summary: 'Show where HEAD and refs have pointed.', useCase: 'Recover from mistaken history edits.', sourceUrl: 'https://git-scm.com/docs/git-reflog' },
  { command: 'git bisect', category: 'Advanced Tools', summary: 'Use binary search to find bad commit.', useCase: 'Debug regressions across many commits.', sourceUrl: 'https://git-scm.com/docs/git-bisect' },
  { command: 'git blame', category: 'Advanced Tools', summary: 'Show line-by-line last modification info.', useCase: 'Trace ownership of specific code lines.', sourceUrl: 'https://git-scm.com/docs/git-blame' },
  { command: 'git stash', category: 'Advanced Tools', summary: 'Temporarily shelve local modifications.', useCase: 'Pause work to switch context quickly.', sourceUrl: 'https://git-scm.com/docs/git-stash' },
  { command: 'git submodule', category: 'Advanced Tools', summary: 'Manage nested repositories.', useCase: 'Track external projects inside main repo.', sourceUrl: 'https://git-scm.com/docs/git-submodule' },
  { command: 'git worktree', category: 'Advanced Tools', summary: 'Manage multiple working trees.', useCase: 'Work on multiple branches simultaneously.', sourceUrl: 'https://git-scm.com/docs/git-worktree' }
];
