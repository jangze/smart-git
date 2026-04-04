import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import { execPush } from '../services/workflow.js';
import { t } from '../utils/i18n.js';

export function pushCommand(program: Command) {
  program
    .command('push')
    .description('Push changes to remote with gate checks')
    .option('-y, --yes', 'Skip confirmations (auto-accept all)')
    .option('--dry-run', 'Preview execution without making changes')
    .action(async (options) => {
      const cliOptions = program.opts();

      consola.start(chalk.blue(t('push.start')));

      try {
        await execPush({
          ...cliOptions,
          ...options,
        });
        consola.success(chalk.green(t('push.success')));
      } catch (error) {
        consola.error(chalk.red(t('push.failed')), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
