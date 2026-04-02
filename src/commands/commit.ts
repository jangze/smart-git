import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import { execCommitWorkflow } from '../services/workflow.js';

export function commitCommand(program: Command) {
  program
    .command('commit')
    .description('Analyze changes and create commit with AI-generated message')
    .option('-m, --message <message>', 'Use custom commit message (skip AI)')
    .option('--no-edit', 'Accept AI-generated message without editing')
    .action(async (options) => {
      const cliOptions = program.opts();

      consola.start(chalk.blue('Starting commit workflow...'));

      try {
        await execCommitWorkflow({
          ...cliOptions,
          ...options,
          doPush: false,
        });
        consola.success(chalk.green('Commit created successfully!'));
      } catch (error) {
        consola.error(chalk.red('Commit failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
