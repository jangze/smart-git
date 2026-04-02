# @zdc/smartgit

AI-powered Git assistant CLI tool.

## Features

- AI-generated commit messages
- Automated sync workflow with gate confirmations
- Multi-model support (OpenAI compatible APIs)

## Installation

```bash
npm install -g @zdc/smartgit
```

## Quick Start

```bash
# Configure your API key
smartgit config

# Commit changes with AI-generated message
aigit commit

# Full workflow: sync, commit, and push
aigit push
```

## Commands

| Command | Description |
|---------|-------------|
| `smartgit commit` | Analyze changes and create commit with AI-generated message |
| `smartgit push` | Full workflow: sync, commit, and push changes |

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
  },
  "mr": {
    "enabled": true,           // Enable MR link generation after push
    "platform": "auto"         // "auto" | "github" | "gitlab"
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
| `mr.enabled` | Enable MR/PR link generation after push (default: true) |
| `mr.platform` | Git platform: `auto`, `github`, or `gitlab` |

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

## Merge Request Link

After a successful `aigit push`, the tool will automatically generate and display a Merge Request (or Pull Request) link.

### Supported Platforms

- **GitHub** - Creates PR link with `?expand=1` to auto-expand description
- **GitLab** - Creates MR link with pre-filled source and target branches

### Example Output

```bash
$ smartgit push

✓ Commit created
✓ Changes pushed to remote

┌──────────────────────────────────────────────┐
│  Create Merge Request                        │
│                                              │
│  https://github.com/jangze/smart-git/        │
│  compare/main...feature-auth?expand=1        │
└──────────────────────────────────────────────┘
```

### Configuration

To disable MR link generation:

```json
{
  "mr": {
    "enabled": false
  }
}
```

To specify a platform manually:

```json
{
  "mr": {
    "enabled": true,
    "platform": "github"
  }
}
```

## Workflow

### `smartgit commit`

1. Stage all changes (`git add .`)
2. Generate commit message using AI
3. Allow user to edit message
4. Create commit

### `smartgit push`

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
