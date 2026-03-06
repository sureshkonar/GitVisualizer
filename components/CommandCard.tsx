'use client';

import { motion } from 'framer-motion';

interface DiagramNode {
  id: string;
  x: number;
  y: number;
  branch: 'main' | 'feature' | 'merge';
  head?: boolean;
}

interface DiagramEdge {
  from: string;
  to: string;
  branch: 'main' | 'feature' | 'merge';
}

interface DiagramState {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  note?: string;
}

interface CommandCardProps {
  command: string;
  summary: string;
  beforeGraph: DiagramState;
  afterGraph: DiagramState;
}

export type { CommandCardProps };

const branchColor = {
  main: '#238636',
  feature: '#58A6FF',
  merge: '#f59e0b'
};

function MiniGraph({ state }: { state: DiagramState }) {
  const nodeMap = new Map(state.nodes.map((node) => [node.id, node]));
  return (
    <div className="surface-soft rounded-xl p-3">
      <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">{state.title}</p>
      <svg viewBox="0 0 280 145" className="h-[145px] w-full rounded-lg bg-[#060a11]">
        <text x={12} y={18} className="fill-[#238636] text-[10px] font-mono">
          main
        </text>
        <text x={12} y={130} className="fill-[#58A6FF] text-[10px] font-mono">
          feature
        </text>
        {state.edges.map((edge) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={branchColor[edge.branch]}
              strokeWidth={3}
              strokeOpacity={0.95}
            />
          );
        })}
        {state.nodes.map((node) => (
          <g key={node.id}>
            {node.head ? (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={12}
                fill={branchColor[node.branch]}
                fillOpacity={0.18}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />
            ) : null}
            <circle cx={node.x} cy={node.y} r={7} fill={branchColor[node.branch]} stroke="#dbe8ff" strokeWidth={1.4} />
            <text x={node.x - 7} y={node.y - 11} className="fill-slate-300 text-[9px] font-mono">
              {node.id}
            </text>
            {node.head ? (
              <text x={node.x + 10} y={node.y + 4} className="fill-gitBlue text-[10px] font-mono">
                HEAD
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      {state.note ? <p className="mt-2 text-[11px] text-slate-400">{state.note}</p> : null}
    </div>
  );
}

export default function CommandCard({ command, summary, beforeGraph, afterGraph }: CommandCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={{ y: -3 }}
      className="surface rounded-2xl p-5"
    >
      <div className="mb-3 inline-flex rounded-full border border-gitBlue/35 bg-gitBlue/10 px-3 py-1 font-mono text-xs text-gitBlue">
        {command}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{summary}</p>
      <div className="grid gap-3 font-mono text-xs text-slate-300 md:grid-cols-2">
        <MiniGraph state={beforeGraph} />
        <MiniGraph state={afterGraph} />
      </div>
    </motion.article>
  );
}
