'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CommandDoc, commandDocs } from '@/lib/gitChallenges';

type Category = CommandDoc['category'];

type MiniNode = {
  id: string;
  x: number;
  y: number;
  branch: 'main' | 'feature' | 'merge';
  head?: boolean;
};

type MiniEdge = {
  from: string;
  to: string;
  branch: 'main' | 'feature' | 'merge';
};

type VisualState = {
  before: { title: string; nodes: MiniNode[]; edges: MiniEdge[]; note?: string };
  after: { title: string; nodes: MiniNode[]; edges: MiniEdge[]; note?: string };
};

const categories: Category[] = [
  'Repository Setup',
  'Tracking Changes',
  'Branching',
  'Collaboration',
  'History Manipulation',
  'Advanced Tools'
];

const color = { main: '#238636', feature: '#58A6FF', merge: '#f59e0b' };

const fallbackVisual: VisualState = {
  before: {
    title: 'Before',
    nodes: [
      { id: 'a1', x: 42, y: 72, branch: 'main' },
      { id: 'a2', x: 110, y: 72, branch: 'main', head: true }
    ],
    edges: [{ from: 'a1', to: 'a2', branch: 'main' }],
    note: 'Current repository state'
  },
  after: {
    title: 'After',
    nodes: [
      { id: 'a1', x: 42, y: 72, branch: 'main' },
      { id: 'a2', x: 110, y: 72, branch: 'main' },
      { id: 'a3', x: 178, y: 72, branch: 'main', head: true }
    ],
    edges: [
      { from: 'a1', to: 'a2', branch: 'main' },
      { from: 'a2', to: 'a3', branch: 'main' }
    ],
    note: 'State updated by command'
  }
};

const commandVisuals: Record<string, VisualState> = {
  'git merge': {
    before: {
      title: 'Before',
      nodes: [
        { id: 'm1', x: 36, y: 46, branch: 'main' },
        { id: 'm2', x: 96, y: 46, branch: 'main', head: true },
        { id: 'f1', x: 96, y: 100, branch: 'feature' },
        { id: 'f2', x: 156, y: 100, branch: 'feature' }
      ],
      edges: [
        { from: 'm1', to: 'm2', branch: 'main' },
        { from: 'm2', to: 'f1', branch: 'feature' },
        { from: 'f1', to: 'f2', branch: 'feature' }
      ]
    },
    after: {
      title: 'After',
      nodes: [
        { id: 'm1', x: 36, y: 46, branch: 'main' },
        { id: 'm2', x: 96, y: 46, branch: 'main' },
        { id: 'f1', x: 96, y: 100, branch: 'feature' },
        { id: 'f2', x: 156, y: 100, branch: 'feature' },
        { id: 'mg', x: 216, y: 72, branch: 'merge', head: true }
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
  'git rebase': {
    before: {
      title: 'Before',
      nodes: [
        { id: 'r1', x: 36, y: 46, branch: 'main' },
        { id: 'r2', x: 96, y: 46, branch: 'main' },
        { id: 'r3', x: 96, y: 100, branch: 'feature' },
        { id: 'r4', x: 156, y: 100, branch: 'feature', head: true }
      ],
      edges: [
        { from: 'r1', to: 'r2', branch: 'main' },
        { from: 'r2', to: 'r3', branch: 'feature' },
        { from: 'r3', to: 'r4', branch: 'feature' }
      ]
    },
    after: {
      title: 'After',
      nodes: [
        { id: 'r1', x: 36, y: 46, branch: 'main' },
        { id: 'r2', x: 96, y: 46, branch: 'main' },
        { id: 'r3', x: 156, y: 46, branch: 'feature' },
        { id: 'r4', x: 216, y: 46, branch: 'feature', head: true }
      ],
      edges: [
        { from: 'r1', to: 'r2', branch: 'main' },
        { from: 'r2', to: 'r3', branch: 'feature' },
        { from: 'r3', to: 'r4', branch: 'feature' }
      ]
    }
  },
  'git reset': {
    before: {
      title: 'Before',
      nodes: [
        { id: 'h1', x: 42, y: 72, branch: 'main' },
        { id: 'h2', x: 108, y: 72, branch: 'main' },
        { id: 'h3', x: 176, y: 72, branch: 'main', head: true }
      ],
      edges: [
        { from: 'h1', to: 'h2', branch: 'main' },
        { from: 'h2', to: 'h3', branch: 'main' }
      ],
      note: 'Index and working tree may be dirty'
    },
    after: {
      title: 'After',
      nodes: [
        { id: 'h1', x: 42, y: 72, branch: 'main' },
        { id: 'h2', x: 108, y: 72, branch: 'main', head: true },
        { id: 'h3', x: 176, y: 72, branch: 'main' }
      ],
      edges: [
        { from: 'h1', to: 'h2', branch: 'main' },
        { from: 'h2', to: 'h3', branch: 'main' }
      ],
      note: 'HEAD moved. State depends on mode.'
    }
  },
  'git branch': {
    before: {
      title: 'Before',
      nodes: [
        { id: 'b1', x: 42, y: 72, branch: 'main' },
        { id: 'b2', x: 110, y: 72, branch: 'main', head: true }
      ],
      edges: [{ from: 'b1', to: 'b2', branch: 'main' }]
    },
    after: {
      title: 'After',
      nodes: [
        { id: 'b1', x: 42, y: 72, branch: 'main' },
        { id: 'b2', x: 110, y: 72, branch: 'main', head: true },
        { id: 'bf', x: 170, y: 104, branch: 'feature' }
      ],
      edges: [
        { from: 'b1', to: 'b2', branch: 'main' },
        { from: 'b2', to: 'bf', branch: 'feature' }
      ],
      note: 'New branch pointer created'
    }
  }
};

function inferVisual(command: string): VisualState {
  if (command.includes('merge')) return commandVisuals['git merge'];
  if (command.includes('rebase')) return commandVisuals['git rebase'];
  if (command.includes('reset')) return commandVisuals['git reset'];
  if (command.includes('branch') || command.includes('checkout') || command.includes('switch')) return commandVisuals['git branch'];
  return fallbackVisual;
}

function MiniVisual({ state }: { state: VisualState['before'] }) {
  const nodeMap = new Map(state.nodes.map((n) => [n.id, n]));
  return (
    <div className="surface-soft rounded-xl p-2">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-slate-400">{state.title}</p>
      <svg viewBox="0 0 260 140" className="h-[132px] w-full rounded-lg bg-[#060a11]">
        {state.edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color[edge.branch]} strokeWidth={3} />;
        })}
        {state.nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={7} fill={color[node.branch]} stroke="#dbe8ff" strokeWidth={1.2} />
            {node.head ? <text x={node.x + 10} y={node.y + 4} className="fill-gitBlue text-[10px] font-mono">HEAD</text> : null}
          </g>
        ))}
      </svg>
      {state.note ? <p className="mt-1 text-[10px] text-slate-400">{state.note}</p> : null}
    </div>
  );
}

interface CommandExplorerProps {
  onSelectCommand: (command: string) => void;
}

export default function CommandExplorer({ onSelectCommand }: CommandExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('Repository Setup');
  const [activeCommand, setActiveCommand] = useState<CommandDoc>(commandDocs[0]);

  const scoped = useMemo(() => commandDocs.filter((doc) => doc.category === activeCategory), [activeCategory]);
  const visual = useMemo(() => inferVisual(activeCommand.command), [activeCommand.command]);

  return (
    <section className="surface rounded-2xl p-5">
      <header className="mb-4">
        <h3 className="text-2xl font-semibold">Command Explorer</h3>
        <p className="text-xs text-slate-400">Official descriptions from git-scm docs + interactive simulation.</p>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              const first = commandDocs.find((doc) => doc.category === category);
              if (first) setActiveCommand(first);
            }}
            className={`rounded-full px-3 py-1 text-xs ${
              activeCategory === category
                ? 'bg-gitBlue/20 text-gitBlue border border-gitBlue/50'
                : 'border border-white/15 text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-soft max-h-[420px] space-y-2 overflow-auto rounded-xl p-3">
          {scoped.map((doc) => (
            <button
              key={doc.command}
              onClick={() => setActiveCommand(doc)}
              className={`block w-full rounded-lg border px-3 py-2 text-left font-mono text-xs transition ${
                activeCommand.command === doc.command
                  ? 'border-gitGreen/50 bg-gitGreen/10 text-gitGreen'
                  : 'border-white/10 text-slate-300 hover:border-white/25'
              }`}
            >
              {doc.command}
            </button>
          ))}
        </div>

        <motion.article key={activeCommand.command} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-soft rounded-xl p-4">
          <p className="mb-2 inline-flex rounded-full border border-gitBlue/40 bg-gitBlue/10 px-2 py-1 font-mono text-[11px] text-gitBlue">
            {activeCommand.command}
          </p>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Official description (git-scm)</p>
          <p className="mb-2 text-sm text-slate-100">{activeCommand.summary}</p>
          <p className="mb-4 text-xs text-slate-400">Use case: {activeCommand.useCase}</p>

          <div className="mb-3 grid gap-2 md:grid-cols-2">
            <MiniVisual state={visual.before} />
            <MiniVisual state={visual.after} />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => onSelectCommand(activeCommand.command)} className="rounded-lg bg-gitGreen px-3 py-1.5 text-xs font-semibold text-black">
              Simulate Command
            </button>
            <a href={activeCommand.sourceUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-gitBlue/50 px-3 py-1.5 text-xs font-semibold text-gitBlue">
              Open Official Docs
            </a>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
