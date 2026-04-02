import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { consola } from 'consola';
import chalk from 'chalk';

export interface AIConfig {
  provider: 'openai' | 'ollama';
  apiKey?: string;
  baseURL?: string;
  model: string;
}

export interface GitConfig {
  defaultBranch: string;
  commitStyle: 'conventional' | 'plain';
}

export interface ConfirmConfig {
  level: 'interactive' | 'minimal' | 'none';
}

export interface AigitConfig {
  ai: AIConfig;
  git: GitConfig;
  confirm: ConfirmConfig;
  templates: string[];
}

const CONFIG_DIR = join(homedir(), '.aigit');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: AigitConfig = {
  ai: {
    provider: 'openai',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  git: {
    defaultBranch: 'main',
    commitStyle: 'conventional',
  },
  confirm: {
    level: 'interactive',
  },
  templates: [],
};

export function loadConfig(): AigitConfig {
  if (!existsSync(CONFIG_FILE)) {
    consola.info(chalk.yellow('Config file not found. Using default configuration.'));
    consola.info(chalk.gray(`Config location: ${CONFIG_FILE}`));
    return DEFAULT_CONFIG;
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    consola.warn(chalk.yellow('Failed to parse config file, using defaults'));
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Partial<AigitConfig>): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const currentConfig = loadConfig();
  const mergedConfig = { ...currentConfig, ...config };

  writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2));
  consola.success(chalk.green('Configuration saved to:', CONFIG_FILE));
}

export function ensureConfigExists(): boolean {
  if (!existsSync(CONFIG_FILE)) {
    consola.info(chalk.blue('Creating default configuration...'));
    saveConfig({});
    return false;
  }
  return true;
}
