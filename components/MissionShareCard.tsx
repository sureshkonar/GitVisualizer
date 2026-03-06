'use client';

import { useMemo, useState } from 'react';
import { CommandEvent } from '@/lib/gitMissions';

interface MissionShareCardProps {
  missionId: string;
  missionTitle: string;
  score: number;
  stars: 1 | 2 | 3;
  events: CommandEvent[];
}

export default function MissionShareCard({
  missionId,
  missionTitle,
  score,
  stars,
  events
}: MissionShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';

    const payload = {
      missionId,
      score,
      stars,
      commands: events.map((event) => event.raw)
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
  }, [missionId, score, stars, events]);

  const copyShare = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="rounded-lg border border-gitGreen/40 bg-gitGreen/10 p-3">
      <p className="mb-1 text-xs uppercase tracking-widest text-gitGreen">Share Mission Result</p>
      <p className="text-sm text-slate-100">{missionTitle}</p>
      <p className="mt-1 text-xs text-slate-300">Score {score} | {stars} star{stars > 1 ? 's' : ''} | {events.length} commands</p>
      <button
        onClick={copyShare}
        className="mt-2 rounded-md border border-gitGreen/60 px-2 py-1 text-xs text-gitGreen"
      >
        {copied ? 'Copied' : 'Copy Share Link'}
      </button>
    </div>
  );
}
