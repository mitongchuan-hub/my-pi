#!/usr/bin/env bash
# my-pi 新机器一键安装脚本（macOS / Linux）
# 用法: bash setup.sh
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DST="$HOME/.pi/agent"
EXTENSIONS="$DST/extensions"
SCRIPTS="$DST/scripts"

echo "== 1/4 安装 pi 本体 =="
if ! command -v pi >/dev/null 2>&1; then
  npm i -g @earendil-works/pi-coding-agent
else
  echo "pi 已安装，跳过"
fi

echo "== 2/4 部署定制文件到 $DST =="
mkdir -p "$EXTENSIONS" "$SCRIPTS"
# 扩展：一个功能一个子目录（trash/ memory/ xinshu/），各自带 index.ts
cp -R "$ROOT/extensions/." "$EXTENSIONS/"
# 维护脚本（中文补丁）
cp -R "$ROOT/scripts/." "$SCRIPTS/"

echo "== 3/4 打中文补丁（命令 + 快捷键说明）=="
node "$SCRIPTS/patch-slash-commands-zh.js"
node "$SCRIPTS/patch-keybindings-zh.js"

echo "== 4/4 完成 =="
echo
echo "接下来请手动处理（这些含个人配置/密钥，不在仓库里）:"
echo "  1. 从旧机拷贝以下文件到 $DST :"
echo "       settings.json  auth.json  models.json  models-store.json"
echo "       extensions/lab-qwen/index.ts   （含个人 API Key 的 provider）"
echo "  2. 不要把 my-pi 加入 settings.json 的 packages（不需要远程包）"
echo "  3. 启动 pi，/login 配置模型认证"
echo "  4. /reload 或重启 pi 使扩展与补丁生效"
echo
echo "完成。"
