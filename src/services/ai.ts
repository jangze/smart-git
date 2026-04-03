import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { consola } from 'consola';
import chalk from 'chalk';
import type { AigitConfig, CommitConfig, FilterConfig } from './config.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateCommitMessageOptions {
  diff: string;
  language: 'zh' | 'en';
  filter: FilterConfig;
}

export class AIService {
  private client: InstanceType<typeof OpenAI> | Anthropic;
  private model: string;
  private provider: 'openai' | 'anthropic';

  constructor(config: AigitConfig) {
    this.provider = config.ai.provider;
    this.model = config.ai.model;

    if (config.ai.provider === 'anthropic') {
      this.client = new Anthropic({
        apiKey: config.ai.apiKey || process.env.ANTHROPIC_API_KEY || '',
        baseURL: config.ai.baseURL,
      });
      consola.info(chalk.gray(`AI Provider: Anthropic`));
      consola.info(chalk.gray(`Model: ${this.model}`));
      if (config.ai.baseURL) {
        consola.info(chalk.gray(`Base URL: ${config.ai.baseURL}`));
      }
    } else {
      // OpenAI or Ollama
      this.client = new OpenAI({
        apiKey: config.ai.apiKey || process.env.OPENAI_API_KEY || '',
        baseURL: config.ai.baseURL,
      });
      consola.info(chalk.gray(`AI Provider: ${config.ai.provider}`));
      consola.info(chalk.gray(`Model: ${this.model}`));
      if (config.ai.baseURL) {
        consola.info(chalk.gray(`Base URL: ${config.ai.baseURL}`));
      }
    }
  }

  async generateCommitMessage(options: GenerateCommitMessageOptions): Promise<string> {
    const { diff, language, filter } = options;

    const languageInstruction =
      language === 'zh'
        ? 'Use Chinese for the commit message.'
        : 'Use English for the commit message.';

    const systemPrompt = `You are a commit message generator. Generate commit messages in the following format:

Format:
<type>: <description>

- 1. <change item 1>
- 2. <change item 2>
- 3. <change item 3>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

Rules:
- Use imperative mood in the description ("add" not "added")
- Don't capitalize the first letter after type
- No period at the end of the subject line
- Focus on WHAT and WHY, not HOW
- List items should be concise and specific
- Prioritize: deletions > additions > modifications
- ${languageInstruction}

Filter Rules:
- Ignore whitespace-only changes
- Ignore comment-only changes
- Ignore build artifacts (.lock files, dist/, build/, *.min.js, etc.)
- Merge canceling operations (add then delete same variable)
- If changes span multiple language/i18n files, generate at most one list item for them
- Maximum ${filter.maxListItems} list items, merge similar changes if exceeded

Output ONLY the commit message, no additional text or explanation.`;

    const userPrompt = `Please analyze the following git diff and generate a commit message:

${diff}`;

    try {
      consola.start(chalk.blue('Analyzing changes with AI...'));

      if (this.provider === 'anthropic') {
        const anthropicClient = this.client as Anthropic;
        const response = await anthropicClient.messages.create({
          model: this.model,
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt },
          ],
        });

        const message = response.content[0]?.type === 'text' ? response.content[0].text : '';

        if (!message) {
          throw new Error('AI returned empty response');
        }

        consola.success(chalk.green('Commit message generated'));

        return message.trim();
      } else {
        // OpenAI or Ollama
        const openaiClient = this.client as InstanceType<typeof OpenAI>;
        const response = await openaiClient.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        const message = response.choices[0]?.message?.content?.trim();

        if (!message) {
          throw new Error('AI returned empty response');
        }

        consola.success(chalk.green('Commit message generated'));

        return message;
      }
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
