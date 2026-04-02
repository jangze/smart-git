import inquirer from 'inquirer';
import { consola } from 'consola';
import chalk from 'chalk';

interface PromptResult {
  answer: unknown;
}

/**
 * Ask user for confirmation
 */
export async function confirm(message: string): Promise<boolean> {
  const { answer } = await inquirer.prompt<PromptResult>([
    {
      type: 'confirm',
      name: 'answer',
      message,
      default: false,
    },
  ]);
  return answer as boolean;
}

/**
 * Ask user for text input
 */
export async function input(options: {
  message: string;
  default?: string;
  validate?: (value: string) => boolean | string;
}): Promise<string> {
  const { answer } = await inquirer.prompt<PromptResult>([
    {
      type: 'input',
      name: 'answer',
      ...options,
    },
  ]);
  return answer as string;
}

/**
 * Ask user to select from options
 */
export async function select<T>(options: {
  message: string;
  choices: Array<{ name: string; value: T }>;
}): Promise<T> {
  const { answer } = await inquirer.prompt<PromptResult>([
    {
      type: 'list',
      name: 'answer',
      ...options,
    },
  ]);
  return answer as T;
}

/**
 * Ask user to edit text in editor
 */
export async function editor(options: {
  message: string;
  default: string;
}): Promise<string> {
  consola.info(chalk.blue(options.message));
  consola.info(chalk.gray('Press Ctrl+D (Unix) or Ctrl+Z+Enter (Windows) to save'));

  const { answer } = await inquirer.prompt<PromptResult>([
    {
      type: 'editor',
      name: 'answer',
      message: options.message,
      default: options.default,
    },
  ]);
  return answer as string;
}
