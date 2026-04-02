# aigit

AI-powered Git assistant CLI tool.

## Features

- AI-generated commit messages
- Automated sync workflow with gate confirmations
- Multi-model support (OpenAI compatible APIs)

## Installation

```bash
npm install -g aigit
```

## Quick Start

```bash
# Configure your API key
aigit config

# Commit changes with AI-generated message
aigit commit

# Full workflow: sync, commit, and push
aigit push
```

## Commands

| Command | Description |
|---------|-------------|
| `aigit commit` | Analyze changes and create commit with AI-generated message |
| `aigit push` | Full workflow: sync, commit, and push changes |

## Global Options

| Option | Description |
|--------|-------------|
| `-y, --yes` | Skip non-dangerous confirmations |
| `-v, --verbose` | Show verbose output |
| `--dry-run` | Preview execution without making changes |

## Configuration

Configuration file location: `~/.aigit/config.json`

```json
{
  "ai": {
    "provider": "openai",
    "baseURL": "https://api.openai.com/v1",
    "apiKey": "sk-xxx",
    "model": "gpt-4o-mini"
  },
  "git": {
    "defaultBranch": "main",
    "commitStyle": "conventional"
  },
  "confirm": {
    "level": "interactive"
  }
}
```

## Workflow

### `aigit commit`

1. Stage all changes (`git add .`)
2. Generate commit message using AI
3. Allow user to edit message
4. Create commit

### `aigit push`

1. Stage all changes (`git add .`)
2. Check remote branch status → gate confirmation
3. Check local master sync status → gate confirmation
4. Check if current branch includes latest master → gate confirmation
5. Generate commit message using AI
6. Allow user to edit message
7. Create commit
8. Push to remote

## License

MIT
