import { execa } from 'execa';

export type GitPlatform = 'github' | 'gitlab' | 'unknown';

export interface RemoteInfo {
  platform: GitPlatform;
  owner: string;
  repo: string;
  sshUrl: string;
  httpsUrl?: string;
}

/**
 * Get git remote URL
 */
export async function getRemoteUrl(remote = 'origin'): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['remote', 'get-url', remote]);
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Parse remote URL to extract platform and repo info
 */
export function parseRemoteUrl(url: string): RemoteInfo | null {
  // SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/^git@(.+):(.+)\/(.+?)(?:\.git)?$/);
  if (sshMatch) {
    const [, host, owner, repo] = sshMatch;
    const platform = detectPlatform(host);
    if (platform !== 'unknown') {
      return {
        platform,
        owner,
        repo: repo.replace(/\.git$/, ''),
        sshUrl: url,
      };
    }
  }

  // HTTPS format: https://github.com/owner/repo.git
  const httpsMatch = url.match(/^https?:\/\/(.+)\/(.+)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    const [, host, owner, repo] = httpsMatch;
    const platform = detectPlatform(host);
    if (platform !== 'unknown') {
      return {
        platform,
        owner,
        repo: repo.replace(/\.git$/, ''),
        sshUrl: url,
        httpsUrl: url,
      };
    }
  }

  return null;
}

/**
 * Detect platform from hostname
 */
function detectPlatform(host: string): GitPlatform {
  if (host.includes('github.com')) {
    return 'github';
  }
  if (host.includes('gitlab.com')) {
    return 'gitlab';
  }
  return 'unknown';
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Get remote info for MR/PR link generation
 */
export async function getRemoteInfo(): Promise<RemoteInfo | null> {
  const remoteUrl = await getRemoteUrl();
  if (!remoteUrl) {
    return null;
  }
  return parseRemoteUrl(remoteUrl);
}
