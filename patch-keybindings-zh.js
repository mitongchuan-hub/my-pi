/**
 * 给 pi 内置快捷键说明（/hotkeys 显示）追加中文
 * 用法: node patch-keybindings-zh.js   （可重复执行，幂等）
 * 格式: "English｜中文"
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(
  process.env.APPDATA,
  'npm/node_modules/@earendil-works/pi-coding-agent/dist/core/keybindings.js'
);

const ZH = {
  "Cancel or abort": "取消/中断",
  "Clear editor": "清空编辑器",
  "Exit when editor is empty": "编辑器为空时退出",
  "Suspend to background": "挂起到后台",
  "Cycle thinking level": "切换思考档位",
  "Cycle to next model": "切换到下一个模型",
  "Cycle to previous model": "切换到上一个模型",
  "Open model selector": "打开模型选择器",
  "Toggle tool output": "展开/收起工具输出",
  "Toggle thinking blocks": "显示/隐藏思考块",
  "Toggle named session filter": "切换已命名会话筛选",
  "Open external editor": "打开外部编辑器",
  "Copy message to clipboard": "复制消息到剪贴板",
  "Queue follow-up message": "排队后续消息",
  "Restore queued messages": "取回排队的消息",
  "Paste image from clipboard (text fallback)": "从剪贴板粘贴图片（降级为文本）",
  "Start a new session": "开始新会话",
  "Open session tree": "打开会话树",
  "Fork current session": "从当前会话分叉",
  "Resume a session": "恢复一个会话",
  "Fold tree branch or move up": "折叠树分支或上移",
  "Unfold tree branch or move down": "展开树分支或下移",
  "Edit tree label": "编辑树标签",
  "Toggle tree label timestamps": "显示/隐藏树标签时间戳",
  "Toggle session path display": "显示/隐藏会话路径",
  "Toggle session sort mode": "切换会话排序方式",
  "Rename session": "重命名会话",
  "Delete session": "删除会话",
  "Delete session when query is empty": "查询为空时删除会话",
  "Save model selection": "保存模型选择",
  "Enable all models": "启用全部模型",
  "Clear all models": "清除全部模型",
  "Toggle all models for provider": "启用/禁用某服务商全部模型",
  "Move model up in order": "模型上移",
  "Move model down in order": "模型下移",
  "Tree filter: default view": "树筛选：默认视图",
  "Tree filter: hide tool results": "树筛选：隐藏工具结果",
  "Tree filter: user messages only": "树筛选：仅用户消息",
  "Tree filter: labeled entries only": "树筛选：仅有标签项",
  "Tree filter: show all entries": "树筛选：显示全部",
  "Tree filter: cycle forward": "树筛选：切换下一项",
  "Tree filter: cycle backward": "树筛选：切换上一项",
};

let content = fs.readFileSync(FILE, 'utf8');
let patched = 0, skipped = 0, missing = 0;
for (const [en, zh] of Object.entries(ZH)) {
  const re = new RegExp(`(description:\\s*")${en.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(")`);
  if (!re.test(content)) { missing++; continue; }
  if (new RegExp(`${en.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}｜`).test(content)) { skipped++; continue; }
  content = content.replace(re, `$1${en}｜${zh}$2`);
  patched++;
}
fs.writeFileSync(FILE, content, 'utf8');

// 验证
const all = [...content.matchAll(/description:\s*"([^"]*)"/g)].map(m => m[1]);
const withZh = all.filter(s => /[\u4e00-\u9fff]/.test(s));
console.log(`补丁 ${patched} 条 | 已存在 ${skipped} 条 | 未找到 ${missing} 条`);
console.log(`文件内 description 共 ${all.length} 条，含中文 ${withZh} 条`);
