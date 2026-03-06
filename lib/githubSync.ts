import { UserProfile } from './profileStore';

const apiBase = 'https://api.github.com';

interface GithubContentResponse {
  sha: string;
  content?: string;
  download_url?: string;
  name?: string;
  path?: string;
  type?: 'file' | 'dir';
}

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json'
});

const toBase64 = (value: string) => {
  if (typeof window !== 'undefined') return window.btoa(unescape(encodeURIComponent(value)));
  return Buffer.from(value, 'utf8').toString('base64');
};

export const pushProfileToGithub = async (
  token: string,
  owner: string,
  repo: string,
  profile: UserProfile
) => {
  const path = `profiles/${profile.username}.json`;
  const getUrl = `${apiBase}/repos/${owner}/${repo}/contents/${path}`;

  let existingSha: string | undefined;
  const existing = await fetch(getUrl, { headers: headers(token) });
  if (existing.ok) {
    const data = (await existing.json()) as GithubContentResponse;
    existingSha = data.sha;
  }

  const putUrl = `${apiBase}/repos/${owner}/${repo}/contents/${path}`;
  const payload = {
    message: `sync: update profile ${profile.username}`,
    content: toBase64(JSON.stringify(profile, null, 2)),
    sha: existingSha
  };

  const response = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      ...headers(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub sync failed: ${text.slice(0, 200)}`);
  }
};

export const fetchProfilesFromGithub = async (
  token: string,
  owner: string,
  repo: string
): Promise<UserProfile[]> => {
  const listUrl = `${apiBase}/repos/${owner}/${repo}/contents/profiles`;
  const listRes = await fetch(listUrl, { headers: headers(token) });

  if (!listRes.ok) {
    if (listRes.status === 404) return [];
    const text = await listRes.text();
    throw new Error(`Failed to read profiles folder: ${text.slice(0, 200)}`);
  }

  const files = (await listRes.json()) as GithubContentResponse[];
  const jsonFiles = files.filter((item) => item.type === 'file' && item.name?.endsWith('.json'));

  const profiles: UserProfile[] = [];
  for (const file of jsonFiles) {
    if (!file.download_url) continue;
    const fileRes = await fetch(file.download_url);
    if (!fileRes.ok) continue;
    const profile = (await fileRes.json()) as UserProfile;
    profiles.push(profile);
  }

  return profiles;
};
