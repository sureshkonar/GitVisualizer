import { RepoState } from './gitEngine';

const includes = (value: string, token: string) => value.toLowerCase().includes(token.toLowerCase());

export const buildCoachFeedback = (
  rawCommand: string,
  success: boolean,
  before: RepoState,
  after: RepoState
): string => {
  const cmd = rawCommand.trim();

  if (!success) {
    if (includes(cmd, 'commit')) return 'Commit failed. Stage changes first with git add ., then retry commit.';
    if (includes(cmd, 'merge')) return 'Merge could not apply. Ensure source branch exists and switch to target branch first.';
    if (includes(cmd, 'rebase')) return 'Rebase did not run. Checkout your feature branch, then rebase onto main.';
    return 'Command failed. Use git status to inspect state before retrying.';
  }

  if (includes(cmd, 'git status')) return 'Good habit. Always read status before and after major operations.';
  if (includes(cmd, 'git add')) return 'Index updated. Next step is commit to persist staged changes.';
  if (includes(cmd, 'git commit')) return 'Snapshot created. Use git log to verify commit order and message quality.';
  if (includes(cmd, 'git branch')) return 'Branch pointers are lightweight. Use focused branches per task.';
  if (includes(cmd, 'git merge')) return 'Merge integrates histories. Prefer small, frequent merges to reduce conflicts.';
  if (includes(cmd, 'git rebase')) return 'Rebase rewrites commit ancestry. Avoid rebasing shared public branches.';
  if (includes(cmd, 'git reset --hard')) return 'Hard reset rewrites working tree and index. Use with caution on unbacked work.';
  if (includes(cmd, 'git stash')) return 'Stash is ideal for quick context switching without noisy WIP commits.';
  if (includes(cmd, 'git reflog')) return 'Great recovery command. Reflog can rescue commits after resets or rebases.';

  const beforeHead = before.HEAD;
  const afterHead = after.HEAD;
  if (beforeHead !== afterHead) {
    return `HEAD moved from ${beforeHead?.slice(0, 7) ?? 'none'} to ${afterHead?.slice(0, 7) ?? 'none'}.`;
  }

  return 'Command applied. Keep iterating and validate with git status or git log.';
};
