#!/usr/bin/env node
import { Command } from 'commander';
import { consola } from 'consola';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import inquirer from 'inquirer';
import { commitCommand } from '../commands/commit.js';
import { pushCommand } from '../commands/push.js';
import { configCommand } from '../commands/config.js';
import { t } from '../utils/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgPath = join(__dirname, '../../package.json');
let pkg: { version: string; name: string; description: string };

try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
} catch {
  // Fallback for packaged version
  pkg = { version: '0.1.0', name: 'aigit', description: 'AI-powered Git assistant' };
}

const program = new Command();

program
  .name('aigit')
  .version(pkg.version)
  .description('AI-powered Git assistant CLI tool')
  .option('-y, --yes', 'Skip non-dangerous confirmations')
  .option('-v, --verbose', 'Show verbose output')
  .option('--dry-run', 'Preview execution without making changes');

// Register commands
configCommand(program);
commitCommand(program);
pushCommand(program);

// 如果没有提供任何子命令和参数，显示交互式菜单
program.action(async () => {
  const { action } = await inquirer.prompt<{
    action: 'commit' | 'push' | 'config';
  }>([
    {
      type: 'list',
      name: 'action',
      message: t('menu.select'),
      choices: [
        { name: t('menu.commit'), value: 'commit' },
        { name: t('menu.push'), value: 'push' },
        { name: t('menu.config'), value: 'config' },
      ],
    },
  ]);

  // 执行选中的命令
  const args = process.argv.slice(2);
  program.parse(['node', 'aigit', action, ...args]);
});

// Global error handler
process.on('uncaughtException', (error) => {
  consola.error(chalk.red('Unhandled error:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  consola.error(chalk.red('Unhandled rejection:'), reason);
  process.exit(1);
});

// 检查是否提供了子命令参数
const hasSubCommand = process.argv.some(arg => {
  return ['commit', 'push', 'config', 'help', '-h', '--help', '-V', '--version'].includes(arg);
});

// Parse and execute
try {
  await program.parseAsync();
} catch (error) {
  consola.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
  process.exit(1);
}
