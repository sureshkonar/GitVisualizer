export type FileMap = Record<string, string>;

export interface GitCommit {
  id: string;
  parentIds: string[];
  message: string;
  author: string;
  timestamp: number;
  branch: string;
  snapshot: FileMap;
  x?: number;
  y?: number;
}

export interface GitBranch {
  name: string;
  head: string | null;
  color: string;
}

export interface ReflogEntry {
  id: string;
  action: string;
  head: string | null;
  branch: string;
  timestamp: number;
}

export interface RepoState {
  commits: GitCommit[];
  branches: GitBranch[];
  HEAD: string | null;
  currentBranch: string;
  workingDirectory: FileMap;
  stagingArea: FileMap;
  stashes: FileMap[];
  remotes: Record<string, string>;
  reflog: ReflogEntry[];
  historyCursor: number;
}

const BRANCH_COLORS = ['#58A6FF', '#3FB950', '#F778BA', '#D2A8FF', '#FFA657'];

const cloneMap = (files: FileMap): FileMap => ({ ...files });

const createId = () => Math.random().toString(16).slice(2, 9);

const getBranch = (state: RepoState, name: string) =>
  state.branches.find((branch) => branch.name === name) ?? null;

const getHeadCommit = (state: RepoState, branchName = state.currentBranch) => {
  const branch = getBranch(state, branchName);
  if (!branch?.head) return null;
  return state.commits.find((commit) => commit.id === branch.head) ?? null;
};

const readCommit = (state: RepoState, id: string | null) => {
  if (!id) return null;
  return state.commits.find((commit) => commit.id === id) ?? null;
};

const writeReflog = (state: RepoState, action: string) => {
  state.reflog.unshift({
    id: createId(),
    action,
    branch: state.currentBranch,
    head: state.HEAD,
    timestamp: Date.now()
  });
  state.reflog = state.reflog.slice(0, 50);
};

const allocateBranchColor = (state: RepoState) => BRANCH_COLORS[state.branches.length % BRANCH_COLORS.length];

export const createInitialRepoState = (): RepoState => {
  const rootCommit: GitCommit = {
    id: createId(),
    parentIds: [],
    message: 'Initial commit',
    author: 'you',
    timestamp: Date.now(),
    branch: 'main',
    snapshot: {}
  };

  return {
    commits: [rootCommit],
    branches: [{ name: 'main', head: rootCommit.id, color: BRANCH_COLORS[0] }],
    HEAD: rootCommit.id,
    currentBranch: 'main',
    workingDirectory: {},
    stagingArea: {},
    stashes: [],
    remotes: { origin: 'https://github.com/demo/repo.git' },
    reflog: [
      {
        id: createId(),
        action: 'init: created initial repository',
        branch: 'main',
        head: rootCommit.id,
        timestamp: Date.now()
      }
    ],
    historyCursor: 0
  };
};

export const cloneState = (state: RepoState): RepoState => ({
  ...state,
  commits: state.commits.map((commit) => ({ ...commit, snapshot: cloneMap(commit.snapshot), parentIds: [...commit.parentIds] })),
  branches: state.branches.map((branch) => ({ ...branch })),
  workingDirectory: cloneMap(state.workingDirectory),
  stagingArea: cloneMap(state.stagingArea),
  stashes: state.stashes.map((stash) => cloneMap(stash)),
  remotes: { ...state.remotes },
  reflog: state.reflog.map((entry) => ({ ...entry }))
});

export const checkoutCommit = (state: RepoState, commitId: string): RepoState => {
  const next = cloneState(state);
  const commit = readCommit(next, commitId);
  if (!commit) return next;
  next.workingDirectory = cloneMap(commit.snapshot);
  next.stagingArea = {};
  next.HEAD = commit.id;
  next.historyCursor = Math.max(0, next.commits.findIndex((item) => item.id === commit.id));
  writeReflog(next, `checkout: moved to ${commit.id}`);
  return next;
};

export const createCommit = (
  state: RepoState,
  message = 'commit: update files',
  author = 'you'
): RepoState => {
  const next = cloneState(state);
  const headCommit = getHeadCommit(next);
  const snapshot = cloneMap(headCommit?.snapshot ?? {});

  Object.entries(next.stagingArea).forEach(([path, content]) => {
    if (content === '__DELETE__') {
      delete snapshot[path];
      delete next.workingDirectory[path];
      return;
    }
    snapshot[path] = content;
    next.workingDirectory[path] = content;
  });

  if (Object.keys(next.stagingArea).length === 0) {
    return next;
  }

  const commit: GitCommit = {
    id: createId(),
    parentIds: headCommit ? [headCommit.id] : [],
    message,
    author,
    timestamp: Date.now(),
    branch: next.currentBranch,
    snapshot
  };

  next.commits.push(commit);
  next.HEAD = commit.id;

  const branch = getBranch(next, next.currentBranch);
  if (branch) branch.head = commit.id;

  next.stagingArea = {};
  next.historyCursor = next.commits.length - 1;
  writeReflog(next, `commit (${next.currentBranch}): ${message}`);
  return next;
};

export const stageAll = (state: RepoState): RepoState => {
  const next = cloneState(state);
  next.stagingArea = cloneMap(next.workingDirectory);
  writeReflog(next, 'add: staged all files');
  return next;
};

export const createBranch = (state: RepoState, name: string): RepoState => {
  const next = cloneState(state);
  if (getBranch(next, name)) return next;
  next.branches.push({ name, head: next.HEAD, color: allocateBranchColor(next) });
  writeReflog(next, `branch: created ${name}`);
  return next;
};

export const switchBranch = (state: RepoState, name: string): RepoState => {
  const next = cloneState(state);
  const branch = getBranch(next, name);
  if (!branch) return next;
  next.currentBranch = name;
  next.HEAD = branch.head;
  const headCommit = readCommit(next, branch.head);
  next.workingDirectory = cloneMap(headCommit?.snapshot ?? {});
  next.stagingArea = {};
  writeReflog(next, `checkout: switched to ${name}`);
  return next;
};

const findCommonAncestor = (state: RepoState, left: string | null, right: string | null): string | null => {
  if (!left || !right) return null;
  const visited = new Set<string>();
  let cursor: string | null = left;
  while (cursor) {
    visited.add(cursor);
    cursor = readCommit(state, cursor)?.parentIds[0] ?? null;
  }

  cursor = right;
  while (cursor) {
    if (visited.has(cursor)) return cursor;
    cursor = readCommit(state, cursor)?.parentIds[0] ?? null;
  }
  return null;
};

export const mergeBranch = (state: RepoState, sourceBranchName: string): RepoState => {
  const next = cloneState(state);
  const source = getBranch(next, sourceBranchName);
  const target = getBranch(next, next.currentBranch);
  if (!source?.head || !target?.head || source.name === target.name) return next;

  const targetCommit = readCommit(next, target.head);
  const sourceCommit = readCommit(next, source.head);
  if (!targetCommit || !sourceCommit) return next;

  const ancestor = findCommonAncestor(next, targetCommit.id, sourceCommit.id);
  if (ancestor === sourceCommit.id) {
    writeReflog(next, `merge: ${sourceBranchName} already merged`);
    return next;
  }

  if (ancestor === targetCommit.id) {
    target.head = source.head;
    next.HEAD = source.head;
    next.workingDirectory = cloneMap(sourceCommit.snapshot);
    writeReflog(next, `merge: fast-forward ${sourceBranchName}`);
    return next;
  }

  const mergedSnapshot = { ...targetCommit.snapshot, ...sourceCommit.snapshot };
  const mergeCommit: GitCommit = {
    id: createId(),
    parentIds: [targetCommit.id, sourceCommit.id],
    message: `Merge branch '${sourceBranchName}' into ${target.name}`,
    author: 'you',
    timestamp: Date.now(),
    branch: target.name,
    snapshot: mergedSnapshot
  };

  next.commits.push(mergeCommit);
  target.head = mergeCommit.id;
  next.HEAD = mergeCommit.id;
  next.workingDirectory = cloneMap(mergedSnapshot);
  next.stagingArea = {};
  next.historyCursor = next.commits.length - 1;
  writeReflog(next, `merge: ${sourceBranchName} -> ${target.name}`);
  return next;
};

export const rebaseOnto = (state: RepoState, sourceBranchName: string, ontoBranchName: string): RepoState => {
  const next = cloneState(state);
  const source = getBranch(next, sourceBranchName);
  const onto = getBranch(next, ontoBranchName);
  if (!source?.head || !onto?.head) return next;

  const sourceHead = readCommit(next, source.head);
  const ontoHead = readCommit(next, onto.head);
  if (!sourceHead || !ontoHead) return next;

  const ancestor = findCommonAncestor(next, sourceHead.id, ontoHead.id);
  const linear: GitCommit[] = [];
  let cursor: GitCommit | null = sourceHead;

  while (cursor && cursor.id !== ancestor) {
    linear.unshift(cursor);
    const parentId = cursor.parentIds[0] ?? null;
    cursor = parentId ? readCommit(next, parentId) : null;
  }

  let parentId = ontoHead.id;
  for (const original of linear) {
    const rebased: GitCommit = {
      ...original,
      id: createId(),
      parentIds: [parentId],
      timestamp: Date.now() + Math.floor(Math.random() * 1000),
      branch: source.name
    };
    next.commits.push(rebased);
    parentId = rebased.id;
  }

  source.head = parentId;
  if (next.currentBranch === source.name) {
    next.HEAD = parentId;
    const headCommit = readCommit(next, parentId);
    next.workingDirectory = cloneMap(headCommit?.snapshot ?? {});
  }

  next.historyCursor = next.commits.length - 1;
  writeReflog(next, `rebase: ${source.name} onto ${onto.name}`);
  return next;
};

export type InteractiveRebaseAction = 'pick' | 'reword' | 'edit' | 'squash' | 'fixup' | 'drop';

export interface InteractiveRebaseItem {
  commitId: string;
  action: InteractiveRebaseAction;
  message?: string;
}

export const applyInteractiveRebase = (
  state: RepoState,
  branchName: string,
  operations: InteractiveRebaseItem[]
): RepoState => {
  const next = cloneState(state);
  const branch = getBranch(next, branchName);
  if (!branch?.head) return next;

  const headCommit = readCommit(next, branch.head);
  if (!headCommit) return next;

  let parentId = headCommit.parentIds[0] ?? null;
  let previous: GitCommit | null = null;

  operations.forEach((op) => {
    const source = readCommit(next, op.commitId);
    if (!source) return;

    if (op.action === 'drop') return;

    if (op.action === 'squash' || op.action === 'fixup') {
      if (!previous) return;
      const suffix = op.action === 'squash' ? ` + ${op.message ?? source.message}` : '';
      previous.message = `${previous.message}${suffix}`;
      previous.snapshot = { ...previous.snapshot, ...source.snapshot };
      return;
    }

    const rewritten: GitCommit = {
      ...source,
      id: createId(),
      parentIds: parentId ? [parentId] : [],
      message: op.action === 'reword' ? op.message ?? `${source.message} (reworded)` : source.message,
      timestamp: Date.now() + Math.floor(Math.random() * 1000)
    };

    if (op.action === 'edit') {
      rewritten.message = `${rewritten.message} [edited]`;
    }

    next.commits.push(rewritten);
    parentId = rewritten.id;
    previous = rewritten;
  });

  if (parentId) {
    branch.head = parentId;
    if (next.currentBranch === branch.name) {
      next.HEAD = parentId;
      next.workingDirectory = cloneMap(readCommit(next, parentId)?.snapshot ?? {});
    }
  }

  next.historyCursor = next.commits.length - 1;
  writeReflog(next, `rebase -i: rewrote ${branchName}`);
  return next;
};

export const resetHead = (
  state: RepoState,
  mode: '--soft' | '--mixed' | '--hard',
  steps = 1
): RepoState => {
  const next = cloneState(state);
  const branch = getBranch(next, next.currentBranch);
  if (!branch?.head) return next;

  let cursorId: string | null = branch.head;
  for (let i = 0; i < steps; i += 1) {
    const commit = readCommit(next, cursorId);
    cursorId = commit?.parentIds[0] ?? null;
  }
  if (!cursorId) return next;

  const target = readCommit(next, cursorId);
  if (!target) return next;

  branch.head = target.id;
  next.HEAD = target.id;

  if (mode === '--soft') {
    writeReflog(next, 'reset --soft: moved HEAD');
    return next;
  }

  next.stagingArea = cloneMap(target.snapshot);
  if (mode === '--mixed') {
    writeReflog(next, 'reset --mixed: reset staging area');
    return next;
  }

  next.workingDirectory = cloneMap(target.snapshot);
  writeReflog(next, 'reset --hard: reset working tree');
  return next;
};

export const stashChanges = (state: RepoState): RepoState => {
  const next = cloneState(state);
  if (Object.keys(next.workingDirectory).length === 0) return next;
  next.stashes.unshift(cloneMap(next.workingDirectory));
  next.workingDirectory = cloneMap(readCommit(next, next.HEAD)?.snapshot ?? {});
  next.stagingArea = {};
  writeReflog(next, 'stash: saved working directory');
  return next;
};

export const popStash = (state: RepoState): RepoState => {
  const next = cloneState(state);
  const stash = next.stashes.shift();
  if (!stash) return next;
  next.workingDirectory = stash;
  writeReflog(next, 'stash pop: restored last stash');
  return next;
};

export const getCommitTimeline = (state: RepoState): GitCommit[] =>
  [...state.commits].sort((a, b) => a.timestamp - b.timestamp);

export const computeGraphLayout = (state: RepoState): GitCommit[] => {
  const commits = getCommitTimeline(state);
  const laneByBranch = new Map<string, number>();
  let laneCounter = 0;

  return commits.map((commit, index) => {
    if (!laneByBranch.has(commit.branch)) {
      laneByBranch.set(commit.branch, laneCounter);
      laneCounter += 1;
    }

    const lane = laneByBranch.get(commit.branch) ?? 0;
    return {
      ...commit,
      x: 80 + lane * 150,
      y: 70 + index * 85
    };
  });
};

export const headLabel = (state: RepoState) => `HEAD -> ${state.currentBranch}`;
