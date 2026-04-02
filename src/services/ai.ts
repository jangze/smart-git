import { OpenAI } from 'openai';
import { consola } from 'consola';
import chalk from 'chalk';
import type { AIConfig } from './config.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private client: InstanceType<typeof OpenAI>;
  private model: string;

  constructor(config: AIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || '',
      baseURL: config.baseURL,
    });
    this.model = config.model;

    consola.info(chalk.gray(`AI Provider: ${config.provider}`));
    consola.info(chalk.gray(`Model: ${this.model}`));
    if (config.baseURL) {
      consola.info(chalk.gray(`Base URL: ${config.baseURL}`));
    }
  }

  async generateCommitMessage(diff: string, style: 'conventional' | 'plain'): Promise<string> {
    const systemPrompt =
      style === 'conventional'
        ? `You are a commit message generator. Generate commit messages following the Conventional Commits specification.
Format: <type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

Rules:
- Use imperative mood in the description ("add" not "added")
- Don't capitalize the first letter
- No period at the end
- Keep it concise (under 72 characters for the subject line)
- Focus on WHAT and WHY, not HOW`
        : `You are a commit message generator. Generate clear and concise commit messages.

Rules:
- Use imperative mood in the description ("add" not "added")
- Keep it concise
- Focus on WHAT changed`;

    const userPrompt = `Please analyze the following git diff and generate a commit message:

${diff}`;

    try {
      consola.start(chalk.blue('Analyzing changes with AI...'));

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const message = response.choices[0]?.message?.content?.trim();

      if (!message) {
        throw new Error('AI returned empty response');
      }

      consola.success(chalk.green('Commit message generated'));

      return message;
    } catch (error) {
      consola.error(chalk.red('Failed to generate commit message:'), error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  }
}
