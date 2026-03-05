'use client';

import { RepoState, headLabel } from '@/lib/gitEngine';
import GitGraph from './GitGraph';

interface RepoVisualizerProps {
  state: RepoState;
}

export default function RepoVisualizer({ state }: RepoVisualizerProps) {
  return (
    <section className="surface h-full rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Repository Graph</h3>
          <p className="text-xs text-slate-400">Live branch topology and commit ancestry</p>
        </div>
        <p className="rounded-full border border-gitBlue/40 bg-gitBlue/10 px-2.5 py-1 font-mono text-[11px] text-gitBlue">
          {headLabel(state)}
        </p>
      </div>
      <GitGraph state={state} />
    </section>
  );
}
