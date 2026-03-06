'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RepoState } from '@/lib/gitEngine';
import { CommandEvent, evaluateMission, gitMissions } from '@/lib/gitMissions';

interface MissionCampaignProps {
  repoState: RepoState;
  commandHistory: CommandEvent[];
  onResetLab: () => void;
}

export default function MissionCampaign({ repoState, commandHistory, onResetLab }: MissionCampaignProps) {
  const [active, setActive] = useState(0);
  const [attemptStartIndex, setAttemptStartIndex] = useState(0);
  const [attemptStartTime, setAttemptStartTime] = useState(() => Date.now());
  const [completed, setCompleted] = useState<Record<string, number>>({});

  const mission = gitMissions[active];

  useEffect(() => {
    setAttemptStartIndex(commandHistory.length);
    setAttemptStartTime(Date.now());
  }, [active]);

  const attemptEvents = useMemo(
    () => commandHistory.slice(attemptStartIndex),
    [commandHistory, attemptStartIndex]
  );

  const evaluation = useMemo(
    () => evaluateMission(mission, repoState, attemptEvents, attemptStartTime),
    [mission, repoState, attemptEvents, attemptStartTime]
  );

  useEffect(() => {
    if (!evaluation.passed) return;
    setCompleted((prev) => {
      const currentBest = prev[mission.id] ?? 0;
      if (evaluation.score <= currentBest) return prev;
      return { ...prev, [mission.id]: evaluation.score };
    });
  }, [evaluation.passed, evaluation.score, mission.id]);

  const completedCount = Object.keys(completed).length;

  const resetAttempt = () => {
    onResetLab();
    setAttemptStartIndex(0);
    setAttemptStartTime(Date.now());
  };

  const nextMission = () => {
    setActive((value) => Math.min(value + 1, gitMissions.length - 1));
  };

  return (
    <section className="surface rounded-2xl p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold">Mission Campaign</h3>
          <p className="text-xs text-slate-400">10-level progression from Git basics to advanced forensics.</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-mono text-gitBlue">Cleared {completedCount}/{gitMissions.length}</p>
          <p className="text-slate-400">Current Tier: {mission.tier}</p>
        </div>
      </header>

      <div className="mb-4 grid gap-2 md:grid-cols-5">
        {gitMissions.map((item, index) => {
          const done = completed[item.id] !== undefined;
          const isActive = index === active;
          return (
            <button
              key={item.id}
              onClick={() => setActive(index)}
              className={`rounded-lg border px-3 py-2 text-left ${
                isActive
                  ? 'border-gitBlue/60 bg-gitBlue/15'
                  : done
                    ? 'border-gitGreen/50 bg-gitGreen/10'
                    : 'border-white/10 bg-black/20'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Level {item.level}</p>
              <p className="mt-1 text-xs font-semibold">{item.title}</p>
            </button>
          );
        })}
      </div>

      <motion.article key={mission.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="surface-soft rounded-xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gitBlue">{mission.tier}</p>
            <h4 className="text-xl font-semibold">{mission.title}</h4>
            <p className="text-sm text-slate-300">{mission.story}</p>
          </div>
          <div className="text-right text-xs text-slate-300">
            <p>Reward XP: {mission.rewardXp}</p>
            <p>Limit: {mission.maxCommands} commands / {mission.timeLimitSec}s</p>
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">Recommended Commands</p>
          <div className="flex flex-wrap gap-2">
            {mission.recommended.map((cmd) => (
              <span key={cmd} className="rounded-full border border-white/15 px-2 py-1 font-mono text-[11px] text-slate-300">
                {cmd}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3 grid gap-2 md:grid-cols-2">
          {mission.objectives.map((objective) => {
            const done = objective.check(repoState, attemptEvents);
            return (
              <div key={objective.id} className={`rounded-lg border px-3 py-2 text-xs ${done ? 'border-gitGreen/50 bg-gitGreen/10 text-gitGreen' : 'border-white/10 text-slate-300'}`}>
                {done ? 'Done' : 'Pending'} - {objective.label}
              </div>
            );
          })}
        </div>

        <div className="mb-3 grid gap-2 md:grid-cols-4 text-xs">
          <div className="rounded-lg border border-white/10 px-3 py-2">Progress: {evaluation.completed}/{evaluation.total}</div>
          <div className="rounded-lg border border-white/10 px-3 py-2">Score: {evaluation.score}</div>
          <div className="rounded-lg border border-white/10 px-3 py-2">Commands: {evaluation.commandCount}</div>
          <div className="rounded-lg border border-white/10 px-3 py-2">Time: {evaluation.elapsedSec}s</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={resetAttempt} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-300">
            Reset Lab
          </button>
          <button onClick={() => setAttemptStartIndex(commandHistory.length)} className="rounded-lg border border-gitBlue/50 px-3 py-1.5 text-xs text-gitBlue">
            Start Fresh Attempt
          </button>
          {evaluation.passed ? (
            <>
              <span className="rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-xs text-gitGreen">
                Mission Complete - {evaluation.stars} star{evaluation.stars > 1 ? 's' : ''}
              </span>
              {active < gitMissions.length - 1 ? (
                <button onClick={nextMission} className="rounded-lg bg-gitGreen px-3 py-1.5 text-xs font-semibold text-black">
                  Next Mission
                </button>
              ) : null}
            </>
          ) : (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              Keep going - complete all objectives
            </span>
          )}
        </div>
      </motion.article>
    </section>
  );
}
