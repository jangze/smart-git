import { execa } from 'execa';
import { consola } from 'consola';
import chalk from 'chalk';

export interface GitStatus {
  currentBranch: string;
  hasUncommittedChanges: boolean;
  hasStagedChanges: boolean;
  ahead: number;
  behind: number;
  upstreamBranch?: string;
}

export interface RemoteBranchInfo {
  exists: boolean;
  ahead: number;
  behind: number;
}

/**
 * Execute a git command and return the output
 */
export async function execGit(args: string[], options?: { cwd?: string }): Promise<string> {
  const { stdout } = await execa('git', args, {
    cwd: options?.cwd,
    encoding: 'utf8',
  });
  return stdout;
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(): Promise<string> {
  return await execGit(['rev-parse', '--abbrev-ref', 'HEAD']);
}

/**
 * Check if there are staged changes
 */
export async function hasStagedChanges(): Promise<boolean> {
  try {
    await execGit(['diff', '--cached', '--quiet']);
    return false;
  } catch {
    return true;
  }
}

/**
 * Check if there are uncommitted changes (staged or unstaged)
 */
export async function hasUncommittedChanges(): Promise<boolean> {
  try {
    await execGit(['diff', '--quiet']);
    return false;
  } catch {
    return true;
  }
}

/**
 * Stage all changes (git add .)
 */
export async function stageAll(): Promise<void> {
  await execGit(['add', '.']);
  consola.info(chalk.gray('Staged all changes'));
}

/**
 * Check if remote branch exists
 */
export async function checkRemoteBranch(branch: string): Promise<RemoteBranchInfo> {
  try {
    // Get upstream tracking info
    const upstream = await execGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', `${branch}@{u}`], {
      cwd: process.cwd(),
    }).catch(() => '');

    if (!upstream) {
      return { exists: false, ahead: 0, behind: 0 };
    }

    // Get ahead/behind counts
    const result = await execGit([
      'rev-list',
      '--left-right',
      '--count',
      `${branch}...${upstream}`,
    ]);

    const [ahead, behind] = result.split(/\s+/).map(Number);

    return { exists: true, ahead, behind };
  } catch {
    return { exists: false, ahead: 0, behind: 0 };
  }
}

/**
 * Check local vs remote master/main sync status
 */
export async function checkMasterSync(defaultBranch: string): Promise<{
  localExists: boolean;
  remoteExists: boolean;
  localBehind: number;
  localAhead: number;
}> {
  try {
    // Check if local branch exists
    const localExists = await execGit(['rev-parse', '--verify', defaultBranch], {
      cwd: process.cwd(),
    })
      .then(() => true)
      .catch(() => false);

    if (!localExists) {
      return { localExists: false, remoteExists: false, localBehind: 0, localAhead: 0 };
    }

    // Check remote tracking
    const upstream = `${defaultBranch}@{u}`;
    const result = await execGit([
      'rev-list',
      '--left-right',
      '--count',
      `${defaultBranch}...${upstream}`,
    ]).catch(() => '0\t0');

    const [ahead, behind] = result.split(/\s+/).map(Number);

    return {
      localExists: true,
      remoteExists: true,
      localBehind: behind,
      localAhead: ahead,
    };
  } catch {
    return { localExists: false, remoteExists: false, localBehind: 0, localAhead: 0 };
  }
}

/**
 * Check if current branch includes latest master
 */
export async function checkBranchIncludesMaster(
  branch: string,
  defaultBranch: string
): Promise<{
  needsMerge: boolean;
  commitsBehind: number;
}> {
  try {
    const result = await execGit([
      'rev-list',
      '--left-right',
      '--count',
      `${branch}...${defaultBranch}`,
    ]);

    const [, behind] = result.split(/\s+/).map(Number);

    return {
      needsMerge: behind > 0,
      commitsBehind: behind,
    };
  } catch {
    return { needsMerge: false, commitsBehind: 0 };
  }
}

/**
 * Fetch latest from remote
 */
export async function fetchRemote(): Promise<void> {
  consola.info(chalk.gray('Fetching from remote...'));
  await execGit(['fetch', '--all']);
}

/**
 * Pull remote changes
 */
export async function pullRemote(branch?: string): Promise<void> {
  consola.info(chalk.gray(`Pulling ${branch || 'remote'} changes...`));
  await execGit(['pull']);
}

/**
 * Merge branch into current
 */
export async function mergeBranch(branch: string): Promise<void> {
  consola.info(chalk.gray(`Merging ${branch} into current branch...`));
  await execGit(['merge', branch, '--no-edit']);
}

/**
 * Create commit with message
 */
export async function commit(message: string): Promise<void> {
  await execGit(['commit', '-m', message]);
}

/**
 * Push to remote
 */
export async function push(upstream?: boolean, branch?: string): Promise<void> {
  if (upstream) {
    const currentBranch = branch || await getCurrentBranch();
    await execGit(['push', '-u', 'origin', currentBranch || 'HEAD']);
  } else {
    await execGit(['push']);
  }
}

/**
 * Get staged diff for AI analysis
 */
export async function getStagedDiff(): Promise<string> {
  return await execGit(['diff', '--cached']);
}

/**
 * Get unstaged diff for AI analysis
 */
export async function getUnstagedDiff(): Promise<string> {
  return await execGit(['diff']);
}
