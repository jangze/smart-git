import { consola } from 'consola';
import chalk from 'chalk';
import { loadConfig } from '../services/config.js';
import { AIService } from '../services/ai.js';
import * as git from '../services/git.js';
import { confirm, confirmOrEdit } from '../utils/interactive.js';

export interface WorkflowOptions {
  yes?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  message?: string;
  noEdit?: boolean;
  doPush: boolean;
}

/**
 * Main workflow execution for commit and push commands
 */
export async function execCommitWorkflow(options: WorkflowOptions): Promise<void> {
  const config = loadConfig();

  // Step 0: Stage all changes
  consola.info(chalk.blue('Step 0: Staging changes'));
  await git.stageAll();

  // Check if there are any changes
  const hasChanges = await git.hasStagedChanges();
  if (!hasChanges) {
    consola.info(chalk.yellow('No changes to commit'));
    return;
  }

  // Step 1: Check remote branch
  const currentBranch = await git.getCurrentBranch();
  consola.info(chalk.blue(`Step 1: Checking remote branch "${currentBranch}"`));

  if (!options.dryRun) {
    await git.fetchRemote();
  }

  const remoteBranchInfo = await git.checkRemoteBranch(currentBranch);

  if (remoteBranchInfo.exists && remoteBranchInfo.behind > 0) {
    consola.warn(
      chalk.yellow(`Remote branch has ${remoteBranchInfo.behind} new commit(s), local is behind`)
    );

    if (!options.yes) {
      const shouldPull = await confirm(
        chalk.yellow(`Download remote updates to local branch? (y/n)`)
      );
      if (shouldPull) {
        if (!options.dryRun) {
          await git.pullRemote(currentBranch);
          consola.success(chalk.green('Remote updates merged locally'));
        } else {
          consola.info(chalk.cyan('[Dry Run] Would pull remote changes'));
        }
      }
    } else {
      if (!options.dryRun) {
        await git.pullRemote(currentBranch);
      } else {
        consola.info(chalk.cyan('[Dry Run] Would pull remote changes'));
      }
    }
  } else if (remoteBranchInfo.exists) {
    consola.success(chalk.green('Current branch is up to date with remote'));
  } else {
    consola.info(chalk.gray('Remote branch does not exist yet'));
  }

  // Step 2: Check master sync status
  const defaultBranch = config.git.defaultBranch;
  consola.info(chalk.blue(`Step 2: Checking ${defaultBranch} sync status`));

  const masterSync = await git.checkMasterSync(defaultBranch);

  if (masterSync.remoteExists && masterSync.localBehind > 0) {
    consola.warn(
      chalk.yellow(`Local ${defaultBranch} is behind remote by ${masterSync.localBehind} commit(s)`)
    );

    if (!options.yes) {
      const shouldPull = await confirm(
        chalk.yellow(`Pull remote ${defaultBranch}? (y/n)`)
      );
      if (shouldPull) {
        if (!options.dryRun) {
          await git.pullRemote(defaultBranch);
          consola.success(chalk.green(`${defaultBranch} updated`));
        } else {
          consola.info(chalk.cyan(`[Dry Run] Would pull ${defaultBranch}`));
        }
      }
    } else {
      if (!options.dryRun) {
        await git.pullRemote(defaultBranch);
      } else {
        consola.info(chalk.cyan(`[Dry Run] Would pull ${defaultBranch}`));
      }
    }
  } else {
    consola.success(chalk.green(`${defaultBranch} is up to date`));
  }

  // Step 3: Check if current branch includes latest master
  consola.info(chalk.blue(`Step 3: Checking if current branch includes latest ${defaultBranch}`));

  const branchIncludesMaster = await git.checkBranchIncludesMaster(currentBranch, defaultBranch);

  if (branchIncludesMaster.needsMerge) {
    consola.warn(
      chalk.yellow(
        `Current branch is ${branchIncludesMaster.commitsBehind} commit(s) behind ${defaultBranch}`
      )
    );

    if (!options.yes) {
      const shouldMerge = await confirm(
        chalk.yellow(`Merge ${defaultBranch} into current branch? (y/n)`)
      );
      if (shouldMerge) {
        if (!options.dryRun) {
          await git.mergeBranch(defaultBranch);
          consola.success(chalk.green(`Merged ${defaultBranch} into current branch`));
        } else {
          consola.info(chalk.cyan(`[Dry Run] Would merge ${defaultBranch}`));
        }
      }
    } else {
      if (!options.dryRun) {
        await git.mergeBranch(defaultBranch);
      } else {
        consola.info(chalk.cyan(`[Dry Run] Would merge ${defaultBranch}`));
      }
    }
  } else {
    consola.success(chalk.green('Current branch includes latest master'));
  }

  // Step 4: Generate and confirm commit message
  consola.info(chalk.blue('Step 4: Generating commit message'));

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
  consola.info(chalk.white('Generated commit message:'));
  consola.log(chalk.cyan(commitMessage));

  // Allow editing unless --no-edit or dry-run
  // Default is Y (use generated), N leads to editor
  if (!options.noEdit && !options.dryRun) {
    const result = await confirmOrEdit('Use this commit message? (Y/n)');
    if (!result.useGenerated && result.editedMessage) {
      commitMessage = result.editedMessage;
    }
  }

  if (!commitMessage.trim()) {
    consola.error(chalk.red('Commit message is empty'));
    process.exit(1);
  }

  // Step 5: Execute commit (and push)
  consola.info(chalk.blue('Step 5: Creating commit'));

  if (options.dryRun) {
    consola.info(chalk.cyan('[Dry Run] Would create commit with message:'));
    consola.log(chalk.cyan(commitMessage));
    if (options.doPush) {
      consola.info(chalk.cyan('[Dry Run] Would push to remote'));
    }
    return;
  }

  await git.commit(commitMessage);
  consola.success(chalk.green('Commit created'));

  if (options.doPush) {
    consola.info(chalk.blue('Pushing to remote'));
    const shouldSetUpstream = !remoteBranchInfo.exists;

    await git.push(shouldSetUpstream);
    consola.success(chalk.green('Changes pushed to remote'));
  }
}
