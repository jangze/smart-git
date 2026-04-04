import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execCommitWorkflow, execPush } from '../services/workflow.js';
import { t } from '../utils/i18n.js';

export function commitCommand(program: Command) {
  program
    .command('commit')
    .description('Analyze changes and create commit with AI-generated message')
    .option('-m, --message <message>', 'Use custom commit message (skip AI)')
    .option('--no-edit', 'Accept AI-generated message without editing')
    .action(async (options) => {
      const cliOptions = program.opts();

      consola.start(chalk.blue(t('commit.start')));

      try {
        await execCommitWorkflow({
          ...cliOptions,
          ...options,
        });
        consola.success(chalk.green(t('commit.success')));

        // 询问是否继续 push
        if (!options.dryRun) {
          const { continuePush } = await inquirer.prompt({
            type: 'confirm',
            name: 'continuePush',
            message: t('commit.continuePush'),
            default: true,
          });

          if (continuePush) {
            consola.start(chalk.blue(t('commit.push.start')));
            await execPush({
              ...cliOptions,
              ...options,
            });
            consola.success(chalk.green(t('commit.push.success')));
          }
        }
      } catch (error) {
        consola.error(chalk.red(t('commit.failed')), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
