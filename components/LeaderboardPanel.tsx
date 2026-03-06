'use client';

import { computeRankScore, UserProfile } from '@/lib/profileStore';

interface LeaderboardPanelProps {
  title: string;
  profiles: UserProfile[];
  currentUsername: string | null;
}

export default function LeaderboardPanel({ title, profiles, currentUsername }: LeaderboardPanelProps) {
  const ranked = [...profiles].sort((a, b) => computeRankScore(b) - computeRankScore(a));

  return (
    <section className="surface-soft rounded-xl p-3">
      <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">{title}</p>
      <div className="max-h-64 space-y-2 overflow-auto">
        {ranked.length ? (
          ranked.map((profile, index) => (
            <div
              key={profile.username}
              className={`rounded-md border px-2 py-1 text-xs ${
                profile.username === currentUsername
                  ? 'border-gitGreen/50 bg-gitGreen/10'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <p>
                  #{index + 1} {profile.username}
                </p>
                <p className="font-mono text-gitBlue">{computeRankScore(profile)}</p>
              </div>
              <p className="text-[10px] text-slate-400">
                XP {profile.xp} | Missions {profile.clearedMissions.length} | Streak {profile.dailyStreak}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400">No entries yet.</p>
        )}
      </div>
    </section>
  );
}
