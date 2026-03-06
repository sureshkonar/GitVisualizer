import { ExperienceLevel } from './gitChallenges';

export interface UserProfile {
  username: string;
  createdAt: string;
  lastSeen: string;
  xp: number;
  missionXp: number;
  learnedCommands: string[];
  clearedMissions: string[];
  dailyStreak: number;
  lastDailyDate: string | null;
  experienceLevel: ExperienceLevel | null;
}

const PROFILES_KEY = 'gitviz_profiles_v1';
const ACTIVE_USER_KEY = 'gitviz_active_user_v1';

const isBrowser = () => typeof window !== 'undefined';

export const createDefaultProfile = (username: string): UserProfile => ({
  username,
  createdAt: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
  xp: 0,
  missionXp: 0,
  learnedCommands: [],
  clearedMissions: [],
  dailyStreak: 0,
  lastDailyDate: null,
  experienceLevel: null
});

export const loadProfiles = (): Record<string, UserProfile> => {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, UserProfile>;
  } catch {
    return {};
  }
};

export const saveProfiles = (profiles: Record<string, UserProfile>) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const loadActiveUsername = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_USER_KEY);
};

export const saveActiveUsername = (username: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACTIVE_USER_KEY, username);
};

export const upsertProfile = (profile: UserProfile) => {
  const profiles = loadProfiles();
  profiles[profile.username] = { ...profile, lastSeen: new Date().toISOString() };
  saveProfiles(profiles);
};

export const getOrCreateProfile = (username: string): UserProfile => {
  const profiles = loadProfiles();
  const existing = profiles[username];
  if (existing) return existing;
  const created = createDefaultProfile(username);
  profiles[username] = created;
  saveProfiles(profiles);
  return created;
};

export const exportProfileJson = (profile: UserProfile) =>
  JSON.stringify(profile, null, 2);

export const exportLeaderboardCsv = (profiles: UserProfile[]) => {
  const lines = ['username,xp,missionXp,commandsMastered,missionsCleared,dailyStreak,lastSeen'];
  profiles.forEach((profile) => {
    lines.push(
      [
        profile.username,
        profile.xp,
        profile.missionXp,
        profile.learnedCommands.length,
        profile.clearedMissions.length,
        profile.dailyStreak,
        profile.lastSeen
      ].join(',')
    );
  });
  return lines.join('\n');
};

export const computeRankScore = (profile: UserProfile) => {
  const starsProxy = profile.clearedMissions.length * 2;
  return (
    profile.xp +
    profile.clearedMissions.length * 150 +
    starsProxy * 80 +
    profile.dailyStreak * 20
  );
};
