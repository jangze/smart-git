import inquirer from 'inquirer';

interface PromptResult {
  answer: unknown;
  useGenerated: boolean;
}

/**
 * Ask user for confirmation
 */
export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const { answer } = await inquirer.prompt<PromptResult>([
    {
      type: 'confirm',
      name: 'answer',
      message,
      default: defaultValue,
    },
  ]);
  return answer as boolean;
}

/**
 * Ask user if they want to use the generated message or edit it
 * Default is Y (use generated), N leads to editor
 */
export async function confirmOrEdit(message: string): Promise<{ useGenerated: boolean; editedMessage?: string }> {
  const { useGenerated } = await inquirer.prompt<PromptResult>([
    {
      type: 'confirm',
      name: 'useGenerated',
      message,
      default: true,
    },
  ]);

  if (!useGenerated) {
    const { answer } = await inquirer.prompt<PromptResult>([
      {
        type: 'editor',
        name: 'answer',
        message: 'Edit commit message:',
        default: message,
      },
    ]);
    return { useGenerated: false, editedMessage: answer as string };
  }

  return { useGenerated: true };
}
