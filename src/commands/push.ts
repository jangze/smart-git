import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import { execCommitWorkflow } from '../services/workflow.js';

export function pushCommand(program: Command) {
  program
    .command('push')
    .description('Full workflow: sync, commit, and push changes')
    .option('-m, --message <message>', 'Use custom commit message (skip AI)')
    .option('--no-edit', 'Accept AI-generated message without editing')
    .action(async (options) => {
      const cliOptions = program.opts();

      consola.start(chalk.blue('Starting push workflow...'));

      try {
        await execCommitWorkflow({
          ...cliOptions,
          ...options,
          doPush: true,
        });
        consola.success(chalk.green('Changes pushed successfully!'));
      } catch (error) {
        consola.error(chalk.red('Push failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
