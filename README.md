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
    "defaultBranch": "main"
  },
  "commit": {
    "language": "zh"  // "zh" for Chinese, "en" for English
  },
  "filter": {
    "ignoreWhitespace": true,
    "ignoreComments": true,
    "ignoreBuildArtifacts": true,
    "mergeCancelingOps": true,
    "maxListItems": 7
  },
  "confirm": {
    "level": "interactive"
  }
}
```

### Config Options

| Field | Description |
|-------|-------------|
| `ai.apiKey` | Your OpenAI API key (or compatible API) |
| `ai.baseURL` | API base URL (default: OpenAI) |
| `ai.model` | Model name (default: gpt-4o-mini) |
| `git.defaultBranch` | Your default branch name (default: main) |
| `commit.language` | Commit message language: `zh` (Chinese) or `en` (English) |

## Commit Message Format

```
<type>: <description>

- 1. <change item 1>
- 2. <change item 2>
- 3. <change item 3>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test changes
- `chore` - Build/config changes

### Example (Chinese)

```
feat: 添加用户认证模块

- 1. 新增登录页面和表单验证
- 2. 添加 JWT token 生成逻辑
- 3. 集成 OAuth2 第三方登录
```

### Example (English)

```
feat: add user authentication module

- 1. Add login page with form validation
- 2. Add JWT token generation logic
- 3. Integrate OAuth2 third-party login
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
