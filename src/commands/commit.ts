import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { execCommitWorkflow, execPush } from '../services/workflow.js';

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
        });
        consola.success(chalk.green('Commit created successfully!'));

        // 询问是否继续 push
        if (!options.dryRun) {
          const { continuePush } = await inquirer.prompt({
            type: 'confirm',
            name: 'continuePush',
            message: 'Continue to push changes to remote?',
            default: true,
          });

          if (continuePush) {
            consola.start(chalk.blue('Starting push workflow...'));
            await execPush({
              ...cliOptions,
              ...options,
            });
            consola.success(chalk.green('Changes pushed successfully!'));
          }
        }
      } catch (error) {
        consola.error(chalk.red('Commit failed:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });
}
