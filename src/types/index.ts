/**
 * Global type declarations
 */

declare module 'inquirer' {
  export interface QuestionCollection {
    type?: string;
    name?: string;
    message?: string;
    default?: unknown;
    choices?: Array<{ name: string; value: unknown }>;
    validate?: (value: string) => boolean | string;
  }

  export function prompt<T>(questions: QuestionCollection[]): Promise<T>;
}
