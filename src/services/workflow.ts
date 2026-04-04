import { consola } from 'consola';
import chalk from 'chalk';
import { loadConfig, type AigitConfig } from '../services/config.js';
import { AIService } from '../services/ai.js';
import * as git from '../services/git.js';
import { confirm, confirmOrEdit } from '../utils/interactive.js';
import { getRemoteInfo, getCurrentBranch } from '../utils/platform.js';
import { generateMrLink } from '../utils/mrLink.js';
import { t } from '../utils/i18n.js';

export interface WorkflowOptions {
  yes?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  message?: string;
  noEdit?: boolean;
}

/**
 * Main workflow execution for commit command
 * Simplified: only stage changes and create commit (no remote/sync checks)
 */
export async function execCommitWorkflow(options: WorkflowOptions): Promise<void> {
  const config = loadConfig();

  // Step 1: Stage all changes
  consola.info(chalk.blue(t('workflow.step1')));
  await git.stageAll();

  // Check if there are any changes
  const hasChanges = await git.hasStagedChanges();
  if (!hasChanges) {
    consola.info(chalk.yellow(t('commit.noChanges')));
    return;
  }

  // Step 2: Generate and confirm commit message
  consola.info(chalk.blue(t('workflow.step2')));

  let commitMessage = options.message;

  if (!commitMessage) {
    const diff = await git.getStagedDiff();

    if (!diff.trim()) {
      consola.warn(chalk.yellow('No staged changes to analyze'));
      return;
    }

    const aiService = new AIService(config);
    commitMessage = await aiService.generateCommitMessage({
      diff,
      language: config.commit.language,
      filter: config.filter,
    });
  }

  // Show generated message
  consola.info(chalk.white(t('commit.generatedMessage')));
  consola.log(chalk.cyan(commitMessage));

  // Allow editing unless --no-edit or dry-run
  // Default is Y (use generated), N leads to editor
  if (!options.noEdit && !options.dryRun) {
    const result = await confirmOrEdit(t('commit.useThisMessage'));
    if (!result.useGenerated && result.editedMessage) {
      commitMessage = result.editedMessage;
    }
  }

  if (!commitMessage.trim()) {
    consola.error(chalk.red(t('commit.emptyMessage')));
    process.exit(1);
  }

  // Step 3: Execute commit
  consola.info(chalk.blue(t('workflow.step3')));

  if (options.dryRun) {
    consola.info(chalk.cyan(t('commit.dryRun')));
    consola.log(chalk.cyan(commitMessage));
    return;
  }

  await git.commit(commitMessage);
  consola.success(chalk.green(t('commit.created')));
}

/**
 * Push-only workflow with gate checks (no commit)
 * Step 1: Check remote branch status
 * Step 2: Check default branch sync status
 * Step 3: Check if current branch includes latest default branch
 * Step 4: Push to remote
 * Step 5: Display MR/PR link
 */
export async function execPush(options: WorkflowOptions): Promise<void> {
  const config = loadConfig();
  const currentBranch = await git.getCurrentBranch();

  // Step 1: Check remote branch
  consola.info(chalk.blue(t('workflow.checkingRemote', { branch: currentBranch })));

  await git.fetchRemote();

  const remoteBranchInfo = await git.checkRemoteBranch(currentBranch);

  if (remoteBranchInfo.exists && remoteBranchInfo.behind > 0) {
    consola.warn(
      chalk.yellow(t('workflow.remoteBehind', { count: remoteBranchInfo.behind }))
    );

    if (!options.yes) {
      const shouldPull = await confirm(
        chalk.yellow(t('workflow.pullRemote'))
      );
      if (shouldPull) {
        await git.pullRemote(currentBranch);
        consola.success(chalk.green(t('workflow.remoteMerged')));
      }
    } else {
      await git.pullRemote(currentBranch);
      consola.success(chalk.green(t('workflow.remoteMerged')));
    }
  } else if (remoteBranchInfo.exists) {
    consola.success(chalk.green(t('workflow.remoteUpToDate')));
  } else {
    consola.info(chalk.gray(t('workflow.remoteNotExists')));
  }

  // Step 2: Check default branch sync status
  const defaultBranch = config.git.defaultBranch;
  consola.info(chalk.blue(t('workflow.checkingMaster', { branch: defaultBranch })));

  const masterSync = await git.checkMasterSync(defaultBranch);

  if (masterSync.remoteExists && masterSync.localBehind > 0) {
    consola.warn(
      chalk.yellow(t('workflow.masterBehind', { branch: defaultBranch, count: masterSync.localBehind }))
    );

    if (!options.yes) {
      const shouldPull = await confirm(
        chalk.yellow(t('workflow.pullMaster', { branch: defaultBranch }))
      );
      if (shouldPull) {
        await git.pullRemote(defaultBranch);
        consola.success(chalk.green(t('workflow.masterUpdated', { branch: defaultBranch })));
      }
    } else {
      await git.pullRemote(defaultBranch);
      consola.success(chalk.green(t('workflow.masterUpdated', { branch: defaultBranch })));
    }
  } else {
    consola.success(chalk.green(t('workflow.masterUpToDate', { branch: defaultBranch })));
  }

  // Step 3: Check if current branch includes latest default branch
  consola.info(chalk.blue(t('workflow.checkingBranchIncludesMaster', { branch: defaultBranch })));

  const branchIncludesMaster = await git.checkBranchIncludesMaster(currentBranch, defaultBranch);

  if (branchIncludesMaster.needsMerge) {
    consola.warn(
      chalk.yellow(
        t('workflow.branchBehind', { branch: defaultBranch, count: branchIncludesMaster.commitsBehind })
      )
    );

    if (!options.yes) {
      const shouldMerge = await confirm(
        chalk.yellow(t('workflow.mergeMaster', { branch: defaultBranch }))
      );
      if (shouldMerge) {
        await git.mergeBranch(defaultBranch);
        consola.success(chalk.green(t('workflow.masterMerged', { branch: defaultBranch })));
      }
    } else {
      await git.mergeBranch(defaultBranch);
      consola.success(chalk.green(t('workflow.masterMerged', { branch: defaultBranch })));
    }
  } else {
    consola.success(chalk.green(t('workflow.branchIncludesLatest')));
  }

  // Step 4: Push to remote
  consola.info(chalk.blue(t('workflow.step4')));

  if (options.dryRun) {
    consola.info(chalk.cyan(t('workflow.push.dryRun')));
    return;
  }

  const shouldSetUpstream = !remoteBranchInfo.exists;
  await git.push(shouldSetUpstream);
  consola.success(chalk.green(t('workflow.pushed')));

  // Step 5: Display MR/PR link
  await displayMrLink(config);
}

/**
 * Display MR/PR link after successful push
 */
async function displayMrLink(config: AigitConfig): Promise<void> {
  // Check if MR feature is enabled
  if (!config.mr.enabled) {
    return;
  }

  // Get remote info
  const remote = await getRemoteInfo();
  if (!remote) {
    return;
  }

  // Check platform preference
  if (config.mr.platform !== 'auto' && config.mr.platform !== remote.platform) {
    return;
  }

  // Get current branch
  const currentBranch = await getCurrentBranch();
  if (!currentBranch) {
    return;
  }

  // Generate MR link
  const targetBranch = config.git.defaultBranch;
  const mrResult = generateMrLink(remote, targetBranch, currentBranch);

  if (!mrResult) {
    return;
  }

  // Display the link
  const boxWidth = Math.max(50, mrResult.displayUrl.length + 4);
  const horizontalLine = '─'.repeat(boxWidth);

  consola.log('');
  consola.log(chalk.green(`┌${horizontalLine}┐`));
  consola.log(chalk.green(`│`) + chalk.white('  ' + t('mr.create').padEnd(boxWidth - 1) + '│'));
  consola.log(chalk.green(`│`) + chalk.white(''.padEnd(boxWidth - 1) + '│'));

  // Wrap long URLs
  const urlLines = wrapUrl(mrResult.displayUrl, boxWidth - 4);
  for (const line of urlLines) {
    consola.log(chalk.green(`│`) + chalk.cyan('  ' + line.padEnd(boxWidth - 3) + '│'));
  }

  consola.log(chalk.green(`│`) + chalk.white(''.padEnd(boxWidth - 1) + '│'));
  consola.log(chalk.green(`└${horizontalLine}┘`));
  consola.log('');
}

/**
 * Wrap long URL into multiple lines
 */
function wrapUrl(url: string, maxWidth: number): string[] {
  if (url.length <= maxWidth) {
    return [url];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const char of url) {
    if (currentLine.length >= maxWidth) {
      lines.push(currentLine);
      currentLine = '';
    }
    currentLine += char;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
