import { OpenAI } from 'openai';
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
  private client: InstanceType<typeof OpenAI>;
  private model: string;

  constructor(config: AigitConfig) {
    this.client = new OpenAI({
      apiKey: config.ai.apiKey || process.env.OPENAI_API_KEY || '',
      baseURL: config.ai.baseURL,
    });
    this.model = config.ai.model;

    consola.info(chalk.gray(`AI Provider: ${config.ai.provider}`));
    consola.info(chalk.gray(`Model: ${this.model}`));
    if (config.ai.baseURL) {
      consola.info(chalk.gray(`Base URL: ${config.ai.baseURL}`));
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

      const response = await this.client.chat.completions.create({
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
