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
        provider: 'openai' | 'anthropic' | 'ollama';
        defaultBranch: string;
        language: 'zh' | 'en';
        mrEnabled: boolean;
        mrPlatform: 'auto' | 'github' | 'gitlab';
      }>([
        {
          type: 'list',
          name: 'provider',
          message: 'AI Provider:',
          choices: [
            { name: 'Anthropic (Claude)', value: 'anthropic' },
            { name: 'OpenAI', value: 'openai' },
            { name: 'Ollama (Local)', value: 'ollama' },
          ],
          default: currentConfig.ai.provider || 'openai',
        },
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your API Key:',
          default: currentConfig.ai.apiKey || '',
        },
        {
          type: 'input',
          name: 'baseURL',
          message: 'API Base URL (leave empty for default):',
          default: (answers: { provider: string }) => {
            if (answers.provider === 'anthropic') return 'https://api.anthropic.com';
            if (answers.provider === 'openai') return 'https://api.openai.com/v1';
            return 'http://localhost:11434/v1';
          },
        },
        {
          type: 'input',
          name: 'model',
          message: 'Model name:',
          default: (answers: { provider: string }) => {
            if (answers.provider === 'anthropic') return 'claude-sonnet-4-20250514';
            if (answers.provider === 'openai') return 'gpt-4o-mini';
            return 'llama-3.2';
          },
        },
        {
          type: 'input',
          name: 'defaultBranch',
          message: 'Default branch name:',
          default: currentConfig.git.defaultBranch || 'main',
        },
        {
          type: 'list',
          name: 'language',
          message: 'Commit message language:',
          choices: [
            { name: '中文', value: 'zh' },
            { name: 'English', value: 'en' },
          ],
          default: currentConfig.commit.language || 'zh',
        },
        {
          type: 'confirm',
          name: 'mrEnabled',
          message: 'Enable Merge Request link generation after push?',
          default: currentConfig.mr.enabled,
        },
        {
          type: 'list',
          name: 'mrPlatform',
          message: 'Git platform:',
          choices: [
            { name: 'Auto-detect', value: 'auto' },
            { name: 'GitHub', value: 'github' },
            { name: 'GitLab', value: 'gitlab' },
          ],
          default: currentConfig.mr.platform,
          when: (ans: { mrEnabled: boolean }) => ans.mrEnabled,
        },
      ]);

      saveConfig({
        ai: {
          provider: answers.provider,
          apiKey: answers.apiKey || undefined,
          baseURL: answers.baseURL || undefined,
          model: answers.model,
        },
        git: {
          defaultBranch: answers.defaultBranch,
        },
        commit: {
          language: answers.language,
        },
        mr: {
          enabled: answers.mrEnabled,
          platform: answers.mrPlatform || 'auto',
        },
      });

      consola.success(chalk.green('Configuration saved!'));
    });
}
