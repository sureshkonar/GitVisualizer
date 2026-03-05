'use client';

import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { line, curveCatmullRom } from 'd3-shape';
import { RepoState, computeGraphLayout } from '@/lib/gitEngine';

interface GitGraphProps {
  state: RepoState;
}

export default function GitGraph({ state }: GitGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commits = useMemo(() => computeGraphLayout(state), [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);

    for (let i = 0; i < 90; i += 1) {
      const x = (Math.sin(i * 98.21) + 1) * 0.5 * width;
      const y = (Math.cos(i * 46.11) + 1) * 0.5 * height;
      context.fillStyle = i % 3 === 0 ? 'rgba(88,166,255,0.2)' : 'rgba(35,134,54,0.12)';
      context.beginPath();
      context.arc(x, y, i % 4 === 0 ? 1.8 : 1, 0, Math.PI * 2);
      context.fill();
    }
  }, [state.HEAD, commits.length]);

  const byId = useMemo(() => new Map(commits.map((commit) => [commit.id, commit])), [commits]);

  const branchColor = (branchName: string) =>
    state.branches.find((branch) => branch.name === branchName)?.color ?? '#58A6FF';

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b0f14]" style={{ minHeight: 520 }}>
      <canvas ref={canvasRef} width={980} height={560} className="absolute inset-0 h-full w-full opacity-80" />
      <svg className="relative z-10 h-full w-full" viewBox="0 0 980 560" preserveAspectRatio="xMidYMid meet">
        {commits.map((commit) =>
          commit.parentIds.map((parentId) => {
            const parent = byId.get(parentId);
            if (!parent) return null;

            const pathFactory = line<[number, number]>()
              .curve(curveCatmullRom.alpha(0.6))
              .x((point) => point[0])
              .y((point) => point[1]);

            const points: [number, number][] = [
              [commit.x ?? 0, commit.y ?? 0],
              [((commit.x ?? 0) + (parent.x ?? 0)) / 2, ((commit.y ?? 0) + (parent.y ?? 0)) / 2],
              [parent.x ?? 0, parent.y ?? 0]
            ];

            return (
              <path
                key={`${commit.id}-${parentId}`}
                d={pathFactory(points) ?? ''}
                stroke={branchColor(commit.branch)}
                strokeWidth={2}
                strokeOpacity={0.8}
                fill="none"
              />
            );
          })
        )}

        {commits.map((commit) => {
          const isHead = state.HEAD === commit.id;
          return (
            <g key={commit.id}>
              <motion.circle
                cx={commit.x}
                cy={commit.y}
                r={isHead ? 9 : 6}
                fill={branchColor(commit.branch)}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
              />
              {isHead ? (
                <text x={(commit.x ?? 0) + 15} y={(commit.y ?? 0) + 5} className="fill-gitBlue text-[12px] font-mono">
                  HEAD
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
