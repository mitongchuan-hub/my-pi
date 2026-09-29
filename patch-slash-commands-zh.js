// 给 pi 内置 / 命令说明追加中文（idempotent，可重复执行）
// 用法: node "%USERPROFILE%\.pi\agent\patch-slash-commands-zh.js"
// 何时需要重跑: 每次升级 pi（npm i -g @earendil-works/pi-coding-agent）之后
const fs = require('fs');
const path = require('path');
const os = require('os');

// 跨平台定位 npm 全局包目录
function getGlobalPackageRoot() {
  try {
    const { execSync } = require('child_process');
    const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
    if (root) return root;
  } catch {
    // 继续尝试常见的 npm 全局目录
  }

  const candidates = process.platform === 'win32'
    ? [path.join(os.homedir(), 'AppData', 'Roaming', 'npm', 'node_modules')]
    : [
        path.join(os.homedir(), '.npm-global', 'lib', 'node_modules'),
        '/usr/local/lib/node_modules',
        '/usr/lib/node_modules',
      ];
  const fallback = candidates.find(candidate => fs.existsSync(candidate));
  if (fallback) return fallback;
  throw new Error('无法定位 npm 全局包目录，请确认 Node.js/npm 已安装。');
}

const pkgRoot = getGlobalPackageRoot();
const file = path.join(
  pkgRoot,
  '@earendil-works', 'pi-coding-agent', 'dist', 'core', 'slash-commands.js'
);

const zh = {
  'Open settings menu': '打开设置菜单',
  'Select model (opens selector UI)': '选择模型（打开选择器）',
  'Enable/disable models for Ctrl+P cycling': '启用/禁用 Ctrl+P 循环切换的模型',
  'Export session (HTML default, or specify path: .html/.jsonl)': '导出会话（默认HTML，可指定 .html/.jsonl 路径）',
  'Import and resume a session from a JSONL file': '从 JSONL 文件导入并恢复会话',
  'Share session as a secret GitHub gist': '将会话分享为私密 GitHub gist',
  'Copy last agent message to clipboard': '复制上一条助手消息到剪贴板',
  'Set session display name': '设置会话显示名称',
  'Show session info and stats': '显示会话信息和统计',
  'Show changelog entries': '查看更新日志',
  'Show all keyboard shortcuts': '查看所有快捷键',
  'Create a new fork from a previous user message': '从某条历史用户消息创建分支会话',
  'Duplicate the current session at the current position': '在当前位置复制当前会话',
  'Navigate session tree (switch branches)': '会话树导航（切换分支）',
  'Save project trust decision for future sessions': '保存项目信任决定（影响后续会话）',
  'Configure provider authentication': '配置模型服务商认证',
  'Remove provider authentication': '移除模型服务商认证',
  'Start a new session': '开始新会话',
  'Manually compact the session context': '手动压缩会话上下文',
  'Resume a different session': '恢复/切换到其他会话',
  'Reload keybindings, extensions, skills, prompts, themes, and context files': '重新加载键位、扩展、技能、提示模板、主题和上下文文件',
};
// 模板变量形式的描述单独处理
const TEMPLATE_ZH = [
  ['Quit ${APP_NAME}', 'Quit ${APP_NAME}｜退出程序'],
];

let s = fs.readFileSync(file, 'utf8');
let count = 0;
for (const [from, to] of TEMPLATE_ZH) {
  if (s.includes(to)) { count++; continue; }
  if (s.includes(`description: \`${from}\``)) s = s.replace(`description: \`${from}\``, `description: \`${to}\``);
}
for (const [en, cn] of Object.entries(zh)) {
  const from = `description: "${en}"`;
  const to = `description: "${en}｜${cn}"`;
  if (s.includes(to)) { count++; continue; } // 已打过
  if (s.includes(from)) { s = s.replace(from, to); count++; }
  else console.log('未找到（可能 pi 改了文案）:', en);
}
fs.writeFileSync(file, s, 'utf8');
console.log(`完成：${count}/${Object.keys(zh).length + TEMPLATE_ZH.length} 条命令说明已带中文`);
