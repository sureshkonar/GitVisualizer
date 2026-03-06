'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface UserProfileModalProps {
  open: boolean;
  existingUsers: string[];
  onContinue: (username: string) => void;
}

export default function UserProfileModal({ open, existingUsers, onContinue }: UserProfileModalProps) {
  const [username, setUsername] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface w-full max-w-lg rounded-3xl p-6"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gitBlue">Profile Login</p>
        <h2 className="mb-2 text-2xl font-semibold">Enter Username To Continue</h2>
        <p className="mb-4 text-sm text-slate-300">Your progress, XP, leaderboard rank, and challenges are tied to this username.</p>

        <div className="mb-4">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="your-username"
            className="surface-soft w-full rounded-xl px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={() => {
              const trimmed = username.trim();
              if (!trimmed) return;
              onContinue(trimmed);
              setUsername('');
            }}
            className="mt-2 rounded-lg bg-gitGreen px-3 py-1.5 text-xs font-semibold text-black"
          >
            Continue
          </button>
        </div>

        {existingUsers.length ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Recent Users</p>
            <div className="flex flex-wrap gap-2">
              {existingUsers.slice(0, 8).map((user) => (
                <button
                  key={user}
                  onClick={() => onContinue(user)}
                  className="rounded-full border border-white/20 px-2 py-1 text-xs text-slate-300"
                >
                  {user}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </motion.section>
    </div>
  );
}
