import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import { execPush } from '../services/workflow.js';

export function pushCommand(program: Command) {
  program
    .command('push')
    .description('Push changes to remote with gate checks')
    .option('-y, --yes', 'Skip confirmations (auto-accept all)')
    .option('--dry-run', 'Preview execution without making changes')
    .action(async (options) => {
      const cliOptions = program.opts();

      consola.start(chalk.blue('Starting push workflow...'));

      try {
        await execPush({
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
