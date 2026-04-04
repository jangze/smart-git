import { loadConfig } from '../services/config.js';

export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Config command
    'config.title': '配置 aigit 设置',
    'config.file': '配置文件：~/.aigit/config.json',
    'config.provider': 'AI 提供商:',
    'config.apiKey': '输入 API Key:',
    'config.baseURL': 'API 基础 URL（留空使用默认）:',
    'config.model': '模型名称:',
    'config.defaultBranch': '默认分支名称:',
    'config.language': 'Commit message 语言:',
    'config.mrEnabled': '启用推送后生成合并请求链接？',
    'config.mrPlatform': 'Git 平台:',
    'config.saved': '配置已保存!',

    // Commit command
    'commit.start': '开始 commit 工作流...',
    'commit.success': 'Commit 创建成功!',
    'commit.continuePush': '继续推送变更到远程？',
    'commit.push.start': '开始 push 工作流...',
    'commit.push.success': '变更推送成功!',
    'commit.failed': 'Commit 失败:',
    'commit.noChanges': '没有需要提交的变更',
    'commit.noStagedChanges': '没有已暂存的变更可供分析',
    'commit.generatedMessage': '生成的 commit message:',
    'commit.useThisMessage': '使用此 commit message？',
    'commit.emptyMessage': 'commit message 为空',
    'commit.creating': '创建 commit',
    'commit.dryRun': '[预演] 将创建 commit，message:',
    'commit.created': 'Commit 已创建',

    // Push command
    'push.start': '开始 push 工作流...',
    'push.success': '变更推送成功!',
    'push.failed': 'Push 失败:',

    // Workflow steps
    'workflow.step1': '步骤 1: 暂存变更',
    'workflow.step2': '步骤 2: 生成 commit message',
    'workflow.step3': '步骤 3: 创建 commit',
    'workflow.step4': '步骤 4: 推送变更到远程',
    'workflow.step5': '步骤 5: 生成合并请求链接',

    // Remote branch check
    'workflow.checkingRemote': '检查远程分支 "{branch}"',
    'workflow.remoteBehind': '远程分支有 {count} 个新 commit，本地已落后',
    'workflow.pullRemote': '下载远程更新到本地分支？',
    'workflow.remoteMerged': '远程更新已合并到本地',
    'workflow.remoteUpToDate': '当前分支与远程保持同步',
    'workflow.remoteNotExists': '远程分支尚不存在',

    // Default branch sync check
    'workflow.checkingMaster': '检查 {branch} 同步状态',
    'workflow.masterBehind': '本地 {branch} 落后远程 {count} 个 commit',
    'workflow.pullMaster': '拉取远程 {branch}？',
    'workflow.masterUpdated': '{branch} 已更新',
    'workflow.masterUpToDate': '{branch} 已是最新',

    // Branch includes master check
    'workflow.checkingBranchIncludesMaster': '检查当前分支是否包含最新 {branch}',
    'workflow.branchBehind': '当前分支落后 {branch} {count} 个 commit',
    'workflow.mergeMaster': '合并 {branch} 到当前分支？',
    'workflow.masterMerged': '已将 {branch} 合并到当前分支',
    'workflow.branchIncludesLatest': '当前分支已包含最新 master',

    // Push
    'workflow.pushing': '推送到远程',
    'workflow.push.dryRun': '[预演] 将推送到远程',
    'workflow.pushed': '变更已推送到远程',

    // MR link
    'mr.create': '创建合并请求',
    'mr.box.top': '┌',
    'mr.box.bottom': '└',

    // Interactive menu
    'menu.select': '选择一个操作:',
    'menu.commit': '📝 Commit - 生成 AI commit message',
    'menu.push': '🚀 Push - 完整同步、commit 和 push 工作流',
    'menu.config': '⚙️  Config - 配置 API key 和设置',

    // Common
    'confirm.yes': '是',
    'confirm.no': '否',
  },
  en: {
    // Config command
    'config.title': 'Configure aigit settings',
    'config.file': 'Config file: ~/.aigit/config.json',
    'config.provider': 'AI Provider:',
    'config.apiKey': 'Enter your API Key:',
    'config.baseURL': 'API Base URL (leave empty for default):',
    'config.model': 'Model name:',
    'config.defaultBranch': 'Default branch name:',
    'config.language': 'Commit message language:',
    'config.mrEnabled': 'Enable Merge Request link generation after push?',
    'config.mrPlatform': 'Git platform:',
    'config.saved': 'Configuration saved!',

    // Commit command
    'commit.start': 'Starting commit workflow...',
    'commit.success': 'Commit created successfully!',
    'commit.continuePush': 'Continue to push changes to remote?',
    'commit.push.start': 'Starting push workflow...',
    'commit.push.success': 'Changes pushed successfully!',
    'commit.failed': 'Commit failed:',
    'commit.noChanges': 'No changes to commit',
    'commit.noStagedChanges': 'No staged changes to analyze',
    'commit.generatedMessage': 'Generated commit message:',
    'commit.useThisMessage': 'Use this commit message?',
    'commit.emptyMessage': 'Commit message is empty',
    'commit.creating': 'Creating commit',
    'commit.dryRun': '[Dry Run] Would create commit with message:',
    'commit.created': 'Commit created',

    // Push command
    'push.start': 'Starting push workflow...',
    'push.success': 'Changes pushed successfully!',
    'push.failed': 'Push failed:',

    // Workflow steps
    'workflow.step1': 'Step 1: Staging changes',
    'workflow.step2': 'Step 2: Generating commit message',
    'workflow.step3': 'Step 3: Creating commit',
    'workflow.step4': 'Step 4: Pushing to remote',
    'workflow.step5': 'Step 5: Generate Merge Request link',

    // Remote branch check
    'workflow.checkingRemote': 'Checking remote branch "{branch}"',
    'workflow.remoteBehind': 'Remote branch has {count} new commit(s), local is behind',
    'workflow.pullRemote': 'Download remote updates to local branch?',
    'workflow.remoteMerged': 'Remote updates merged locally',
    'workflow.remoteUpToDate': 'Current branch is up to date with remote',
    'workflow.remoteNotExists': 'Remote branch does not exist yet',

    // Default branch sync check
    'workflow.checkingMaster': 'Checking {branch} sync status',
    'workflow.masterBehind': 'Local {branch} is behind remote by {count} commit(s)',
    'workflow.pullMaster': 'Pull remote {branch}?',
    'workflow.masterUpdated': '{branch} updated',
    'workflow.masterUpToDate': '{branch} is up to date',

    // Branch includes master check
    'workflow.checkingBranchIncludesMaster': 'Checking if current branch includes latest {branch}',
    'workflow.branchBehind': 'Current branch is {count} commit(s) behind {branch}',
    'workflow.mergeMaster': 'Merge {branch} into current branch?',
    'workflow.masterMerged': 'Merged {branch} into current branch',
    'workflow.branchIncludesLatest': 'Current branch includes latest master',

    // Push
    'workflow.pushing': 'Pushing to remote',
    'workflow.push.dryRun': '[Dry Run] Would push to remote',
    'workflow.pushed': 'Changes pushed to remote',

    // MR link
    'mr.create': 'Create Merge Request',

    // Interactive menu
    'menu.select': 'Select an action:',
    'menu.commit': '📝 Commit - Generate AI commit message',
    'menu.push': '🚀 Push - Full sync, commit and push workflow',
    'menu.config': '⚙️  Config - Configure API key and settings',

    // Common
    'confirm.yes': 'Yes',
    'confirm.no': 'No',
  },
};

/**
 * Get translation for a key based on current language config
 */
export function t(key: keyof typeof translations['en'], params?: Record<string, string | number>): string {
  const config = loadConfig();
  const lang = config.commit.language || 'en';
  const langTranslations = translations[lang] || translations.en;

  let text = langTranslations[key] || translations.en[key] || key;

  // Replace parameters like {branch}, {count}
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    }
  }

  return text;
}

/**
 * Get translation for a specific language
 */
export function tWithLang(key: keyof typeof translations['en'], lang: Language, params?: Record<string, string | number>): string {
  const langTranslations = translations[lang] || translations.en;
  let text = langTranslations[key] || translations.en[key] || key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    }
  }

  return text;
}
