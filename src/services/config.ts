import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { consola } from 'consola';
import chalk from 'chalk';

export interface AIConfig {
  provider: 'openai' | 'ollama' | 'anthropic';
  apiKey?: string;
  baseURL?: string;
  model: string;
  httpProxy?: string;
}

export interface GitConfig {
  defaultBranch: string;
}

export interface CommitConfig {
  language: 'zh' | 'en';
}

export interface FilterConfig {
  ignoreWhitespace: boolean;
  ignoreComments: boolean;
  ignoreBuildArtifacts: boolean;
  mergeCancelingOps: boolean;
  maxListItems: number;
}

export interface ConfirmConfig {
  level: 'interactive' | 'minimal' | 'none';
}

export interface MrConfig {
  enabled: boolean;
  platform: 'auto' | 'github' | 'gitlab';
}

export interface AigitConfig {
  ai: AIConfig;
  git: GitConfig;
  commit: CommitConfig;
  filter: FilterConfig;
  confirm: ConfirmConfig;
  mr: MrConfig;
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
  },
  commit: {
    language: 'zh',
  },
  filter: {
    ignoreWhitespace: true,
    ignoreComments: true,
    ignoreBuildArtifacts: true,
    mergeCancelingOps: true,
    maxListItems: 7,
  },
  confirm: {
    level: 'interactive',
  },
  mr: {
    enabled: true,
    platform: 'auto',
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

    // 向后兼容：如果配置文件没有 provider 字段，根据 baseURL 推断
    if (!config.ai?.provider) {
      if (config.ai?.baseURL?.includes('anthropic.com')) {
        config.ai.provider = 'anthropic';
      } else if (config.ai?.baseURL?.includes('ollama')) {
        config.ai.provider = 'ollama';
      } else {
        // 默认视为 OpenAI 兼容 API（包括老配置文件和其他兼容服务）
        config.ai.provider = 'openai';
      }
      consola.info(chalk.yellow('Legacy config detected. Auto-detected provider:'), config.ai.provider);
    }

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
