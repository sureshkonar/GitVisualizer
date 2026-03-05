import {
  RepoState,
  createBranch,
  createCommit,
  mergeBranch,
  popStash,
  rebaseOnto,
  resetHead,
  stageAll,
  stashChanges,
  switchBranch
} from './gitEngine';

export interface CommandResult {
  nextState: RepoState;
  output: string;
  success: boolean;
}

const help = `Supported commands:
- git status | git log | git add . | git commit -m "msg"
- git branch <name> | git branch -d <name>
- git checkout <name> | git switch <name>
- git merge <branch> | git rebase <branch>
- git reset --soft|--mixed|--hard
- git stash | git stash pop
- git remote | git fetch | git pull | git push
- git reflog | git diff | git restore . | git cherry-pick <id>
- git revert <id> | git worktree list | git submodule status`; 

const branchExists = (state: RepoState, name: string) => state.branches.some((branch) => branch.name === name);

const getHead = (state: RepoState) => state.branches.find((branch) => branch.name === state.currentBranch)?.head ?? null;

const ensureGitPrefix = (command: string) => command.trim().startsWith('git ');

export const executeGitCommand = (state: RepoState, input: string): CommandResult => {
  const command = input.trim();
  if (!command) {
    return { nextState: state, output: '', success: true };
  }

  if (command === 'help') {
    return { nextState: state, output: help, success: true };
  }

  if (!ensureGitPrefix(command)) {
    return { nextState: state, output: 'Only git commands are allowed in this sandbox.', success: false };
  }

  const args = command.split(/\s+/);
  const verb = args[1];

  switch (verb) {
    case 'status': {
      const staged = Object.keys(state.stagingArea).length;
      const working = Object.keys(state.workingDirectory).length;
      return {
        nextState: state,
        output: `On branch ${state.currentBranch}\nStaged files: ${staged}\nWorking files: ${working}`,
        success: true
      };
    }

    case 'log': {
      const list = [...state.commits]
        .slice(-8)
        .reverse()
        .map((commit) => `${commit.id} (${commit.branch}) ${commit.message}`)
        .join('\n');

      return {
        nextState: state,
        output: list || 'No commits yet.',
        success: true
      };
    }

    case 'add': {
      return { nextState: stageAll(state), output: 'Staged all files.', success: true };
    }

    case 'commit': {
      const messageMatch = command.match(/-m\s+"([^"]+)"/);
      const message = messageMatch?.[1] ?? 'commit: update';
      const nextState = createCommit(state, message);
      if (nextState.HEAD === state.HEAD) {
        return { nextState: state, output: 'Nothing to commit.', success: false };
      }
      return { nextState, output: `[${nextState.currentBranch}] ${message}`, success: true };
    }

    case 'branch': {
      if (args[2] === '-d') {
        const target = args[3];
        if (!target || target === state.currentBranch || !branchExists(state, target)) {
          return { nextState: state, output: 'Cannot delete that branch.', success: false };
        }
        const nextState = {
          ...state,
          branches: state.branches.filter((branch) => branch.name !== target)
        };
        return { nextState, output: `Deleted branch ${target}.`, success: true };
      }

      const target = args[2];
      if (!target) {
        return {
          nextState: state,
          output: state.branches.map((branch) => `${branch.name === state.currentBranch ? '*' : ' '} ${branch.name}`).join('\n'),
          success: true
        };
      }

      if (branchExists(state, target)) {
        return { nextState: state, output: `Branch '${target}' already exists.`, success: false };
      }

      return { nextState: createBranch(state, target), output: `Created branch ${target}.`, success: true };
    }

    case 'checkout':
    case 'switch': {
      const target = args[2];
      if (!target) {
        return { nextState: state, output: 'Branch name is required.', success: false };
      }
      if (!branchExists(state, target)) {
        return { nextState: state, output: `Unknown branch: ${target}`, success: false };
      }
      return {
        nextState: switchBranch(state, target),
        output: `Switched to branch '${target}'.`,
        success: true
      };
    }

    case 'merge': {
      const target = args[2];
      if (!target) return { nextState: state, output: 'Specify a branch to merge.', success: false };
      if (!branchExists(state, target)) {
        return { nextState: state, output: `Unknown branch: ${target}`, success: false };
      }
      return {
        nextState: mergeBranch(state, target),
        output: `Merged ${target} into ${state.currentBranch}.`,
        success: true
      };
    }

    case 'rebase': {
      const onto = args[2];
      if (!onto || !branchExists(state, onto)) {
        return { nextState: state, output: 'Specify a valid branch to rebase onto.', success: false };
      }

      return {
        nextState: rebaseOnto(state, state.currentBranch, onto),
        output: `Rebased ${state.currentBranch} onto ${onto}.`,
        success: true
      };
    }

    case 'reset': {
      const mode = args[2] as '--soft' | '--mixed' | '--hard';
      if (!mode || !['--soft', '--mixed', '--hard'].includes(mode)) {
        return { nextState: state, output: 'Use git reset --soft|--mixed|--hard', success: false };
      }
      return {
        nextState: resetHead(state, mode),
        output: `Reset ${mode} applied.`,
        success: true
      };
    }

    case 'stash': {
      if (args[2] === 'pop') {
        return { nextState: popStash(state), output: 'Applied latest stash.', success: true };
      }
      return { nextState: stashChanges(state), output: 'Saved working changes to stash.', success: true };
    }

    case 'remote': {
      return {
        nextState: state,
        output: Object.entries(state.remotes)
          .map(([name, url]) => `${name}\t${url}`)
          .join('\n'),
        success: true
      };
    }

    case 'fetch':
      return {
        nextState: state,
        output: 'Fetched updates from origin (simulated).',
        success: true
      };

    case 'pull':
      return {
        nextState: state,
        output: 'Pull completed. Local branch synchronized (simulated).',
        success: true
      };

    case 'push':
      return {
        nextState: state,
        output: 'Push successful (simulated).',
        success: true
      };

    case 'diff': {
      const head = getHead(state);
      return {
        nextState: state,
        output: `Comparing working tree against ${head ?? 'empty tree'}\n+ ${Object.keys(state.workingDirectory).length} files tracked`,
        success: true
      };
    }

    case 'restore': {
      if (args[2] !== '.') {
        return { nextState: state, output: 'Use git restore . in this sandbox.', success: false };
      }
      const headCommit = state.commits.find((commit) => commit.id === getHead(state));
      return {
        nextState: {
          ...state,
          workingDirectory: { ...(headCommit?.snapshot ?? {}) },
          stagingArea: {}
        },
        output: 'Restored working tree to HEAD.',
        success: true
      };
    }

    case 'reflog': {
      return {
        nextState: state,
        output: state.reflog
          .slice(0, 10)
          .map((entry, index) => `${index} ${entry.head ?? 'none'} ${entry.action}`)
          .join('\n'),
        success: true
      };
    }

    case 'cherry-pick': {
      const commitId = args[2];
      const source = state.commits.find((commit) => commit.id === commitId);
      if (!source) return { nextState: state, output: 'Commit not found.', success: false };
      const synthetic = createCommit(
        {
          ...state,
          stagingArea: { ...source.snapshot }
        },
        `cherry-pick: ${source.message}`
      );
      return { nextState: synthetic, output: `Applied ${commitId} to ${state.currentBranch}.`, success: true };
    }

    case 'revert': {
      const commitId = args[2];
      const source = state.commits.find((commit) => commit.id === commitId);
      if (!source) return { nextState: state, output: 'Commit not found.', success: false };
      const reverted = createCommit(state, `revert: ${source.message}`);
      return { nextState: reverted, output: `Reverted ${commitId}.`, success: true };
    }

    case 'bisect': {
      return {
        nextState: state,
        output: 'Bisect simulation: mark commits as good/bad in Challenge Mode.',
        success: true
      };
    }

    case 'blame': {
      const files = Object.keys(state.workingDirectory);
      return {
        nextState: state,
        output: files.length
          ? files.map((file) => `${state.HEAD?.slice(0, 7) ?? '0000000'} (${state.currentBranch}) ${file}`).join('\n')
          : 'No tracked files for blame.',
        success: true
      };
    }

    case 'submodule': {
      return {
        nextState: state,
        output: 'No submodules configured in this sandbox.',
        success: true
      };
    }

    case 'worktree': {
      return {
        nextState: state,
        output: `${state.currentBranch}\t${state.HEAD ?? 'none'}\t(main worktree)`,
        success: true
      };
    }

    case 'init':
    case 'clone': {
      return {
        nextState: state,
        output: 'Repository already initialized in this simulation.',
        success: true
      };
    }

    default:
      return {
        nextState: state,
        output: `Unknown command: ${command}\n\n${help}`,
        success: false
      };
  }
};
