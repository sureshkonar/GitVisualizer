'use client';

import { motion } from 'framer-motion';
import { GitMission } from '@/lib/gitMissions';

interface DailyChallengeProps {
  mission: GitMission;
  isCompletedToday: boolean;
  streak: number;
  onJumpToMission: (missionId: string) => void;
}

export default function DailyChallenge({
  mission,
  isCompletedToday,
  streak,
  onJumpToMission
}: DailyChallengeProps) {
  return (
    <section className="surface rounded-2xl p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gitBlue">Daily Challenge</p>
          <h3 className="text-xl font-semibold">{mission.title}</h3>
          <p className="text-xs text-slate-400">Mission #{mission.level} - {mission.tier}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-gitGreen">Streak {streak} day{streak === 1 ? '' : 's'}</p>
          <p className="text-xs text-slate-400">Reward {mission.rewardXp} XP</p>
        </div>
      </header>

      <p className="mb-3 text-sm text-slate-300">{mission.story}</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {mission.recommended.map((command) => (
          <span key={command} className="rounded-full border border-white/15 px-2 py-1 font-mono text-[11px] text-slate-300">
            {command}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onJumpToMission(mission.id)}
          className="rounded-lg bg-gitBlue px-3 py-1.5 text-xs font-semibold text-black"
        >
          Open Mission
        </button>
        {isCompletedToday ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full border border-gitGreen/40 bg-gitGreen/10 px-3 py-1 text-xs text-gitGreen"
          >
            Completed Today
          </motion.span>
        ) : (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Not completed yet
          </span>
        )}
      </div>
    </section>
  );
}
