import type { RemoteInfo } from './platform.js';

export interface MrLinkResult {
  platform: 'github' | 'gitlab';
  url: string;
  displayUrl: string;
}

/**
 * Generate MR/PR link for GitHub or GitLab
 */
export function generateMrLink(remote: RemoteInfo, targetBranch: string, currentBranch: string): MrLinkResult | null {
  if (remote.platform === 'unknown') {
    return null;
  }

  // Don't generate link if current branch equals target branch
  if (currentBranch === targetBranch) {
    return null;
  }

  if (remote.platform === 'github') {
    return generateGithubLink(remote, targetBranch, currentBranch);
  }

  if (remote.platform === 'gitlab') {
    return generateGitlabLink(remote, targetBranch, currentBranch);
  }

  return null;
}

/**
 * Generate GitHub PR link
 * Format: https://github.com/{owner}/{repo}/compare/{base}...{head}?expand=1
 */
function generateGithubLink(remote: RemoteInfo, targetBranch: string, currentBranch: string): MrLinkResult {
  const baseUrl = `https://github.com/${remote.owner}/${remote.repo}`;
  const url = `${baseUrl}/compare/${encodeURIComponent(targetBranch)}...${encodeURIComponent(currentBranch)}?expand=1`;

  return {
    platform: 'github',
    url,
    displayUrl: `${baseUrl}/compare/${targetBranch}...${currentBranch}?expand=1`,
  };
}

/**
 * Generate GitLab MR link
 * Format: https://gitlab.com/{owner}/{repo}/merge_requests/new?merge_request[source_branch]={head}&merge_request[target_branch]={base}
 */
function generateGitlabLink(remote: RemoteInfo, targetBranch: string, currentBranch: string): MrLinkResult {
  const baseUrl = `https://gitlab.com/${remote.owner}/${remote.repo}`;
  const url = `${baseUrl}/merge_requests/new?merge_request[source_branch]=${encodeURIComponent(currentBranch)}&merge_request[target_branch]=${encodeURIComponent(targetBranch)}`;

  return {
    platform: 'gitlab',
    url,
    displayUrl: `${baseUrl}/merge_requests/new?merge_request[source_branch]=${currentBranch}&merge_request[target_branch]=${targetBranch}`,
  };
}
