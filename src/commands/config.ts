import { Command } from 'commander';
import inquirer from 'inquirer';
import { consola } from 'consola';
import chalk from 'chalk';
import { saveConfig, loadConfig } from '../services/config.js';

export function configCommand(program: Command) {
  program
    .command('config')
    .description('Configure aigit settings')
    .action(async () => {
      const currentConfig = loadConfig();

      consola.info(chalk.blue('Configure aigit settings'));
      consola.info(chalk.gray(`Config file: ~/.aigit/config.json`));

      const answers = await inquirer.prompt<{
        apiKey: string;
        baseURL: string;
        model: string;
        defaultBranch: string;
        commitStyle: 'conventional' | 'plain';
      }>([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your OpenAI API Key:',
          default: currentConfig.ai.apiKey || '',
        },
        {
          type: 'input',
          name: 'baseURL',
          message: 'API Base URL (leave empty for OpenAI default):',
          default: currentConfig.ai.baseURL || 'https://api.openai.com/v1',
        },
        {
          type: 'input',
          name: 'model',
          message: 'Model name:',
          default: currentConfig.ai.model || 'gpt-4o-mini',
        },
        {
          type: 'input',
          name: 'defaultBranch',
          message: 'Default branch name:',
          default: currentConfig.git.defaultBranch || 'main',
        },
        {
          type: 'list',
          name: 'commitStyle',
          message: 'Commit message style:',
          choices: [
            { name: 'Conventional Commits', value: 'conventional' },
            { name: 'Plain', value: 'plain' },
          ],
          default: currentConfig.git.commitStyle || 'conventional',
        },
      ]);

      saveConfig({
        ai: {
          provider: 'openai',
          apiKey: answers.apiKey || undefined,
          baseURL: answers.baseURL || undefined,
          model: answers.model,
        },
        git: {
          defaultBranch: answers.defaultBranch,
          commitStyle: answers.commitStyle as 'conventional' | 'plain',
        },
      });

      consola.success(chalk.green('Configuration saved!'));
    });
}
