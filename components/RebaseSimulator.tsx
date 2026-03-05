'use client';

import { useMemo, useState } from 'react';
import {
  InteractiveRebaseAction,
  RepoState,
  applyInteractiveRebase,
  computeGraphLayout
} from '@/lib/gitEngine';

interface RebaseSimulatorProps {
  state: RepoState;
  onStateChange: (state: RepoState) => void;
}

const actions: InteractiveRebaseAction[] = ['pick', 'reword', 'edit', 'squash', 'fixup', 'drop'];

export default function RebaseSimulator({ state, onStateChange }: RebaseSimulatorProps) {
  const [sequence, setSequence] = useState<InteractiveRebaseAction>('pick');

  const commits = useMemo(() => computeGraphLayout(state).slice(-6).reverse(), [state]);

  const runInteractive = () => {
    const ops = commits.map((commit, index) => ({
      commitId: commit.id,
      action: index === 0 ? 'pick' : sequence,
      message: sequence === 'reword' ? `${commit.message} (rebased)` : commit.message
    }));

    onStateChange(applyInteractiveRebase(state, state.currentBranch, ops));
  };

  return (
    <section className="panel p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold">Git Rebase Simulator</h3>
          <p className="text-xs text-slate-300">Interactive rebase commands: pick, reword, edit, squash, fixup, drop.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sequence}
            onChange={(event) => setSequence(event.target.value as InteractiveRebaseAction)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-xs"
          >
            {actions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <button
            onClick={runInteractive}
            className="rounded-lg bg-gitBlue px-3 py-1 text-xs font-semibold text-black transition hover:brightness-110"
          >
            Apply Rebase
          </button>
        </div>
      </header>

      <div className="grid gap-2 text-xs">
        {commits.map((commit, index) => (
          <div key={commit.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/25 px-3 py-2">
            <p className="font-mono text-slate-300">
              {index === 0 ? 'pick' : sequence} {commit.id} {commit.message}
            </p>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
              {commit.branch}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
