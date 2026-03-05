'use client';

import { RepoState, headLabel } from '@/lib/gitEngine';
import GitGraph from './GitGraph';

interface RepoVisualizerProps {
  state: RepoState;
}

export default function RepoVisualizer({ state }: RepoVisualizerProps) {
  return (
    <section className="panel h-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Repository Graph</h3>
        <p className="font-mono text-xs text-gitBlue">{headLabel(state)}</p>
      </div>
      <GitGraph state={state} />
    </section>
  );
}
