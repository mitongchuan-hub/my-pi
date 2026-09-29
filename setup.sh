#!/usr/bin/env bash
# my-pi 新机器一键安装脚本（macOS / Linux）
# 用法: bash setup.sh
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DST="$HOME/.pi/agent"
EXTENSIONS="$DST/extensions"

echo "== 1/4 安装 pi 本体 =="
if ! command -v pi >/dev/null 2>&1; then
  npm i -g @earendil-works/pi-coding-agent
else
  echo "pi 已安装，跳过"
fi

echo "== 2/4 部署定制文件到 $DST =="
mkdir -p "$EXTENSIONS"
cp -R "$ROOT/extensions/." "$EXTENSIONS/"
cp -f "$ROOT/manual-memory.md" "$DST/"
cp -f "$ROOT"/patch-*.js "$DST/"
# xinshu provider 作为本地扩展加载（不是远程 pi 包），
# pi 启动时不会 clone 或更新 my-pi 仓库。
cp -f "$ROOT/provider/xinshu.ts" "$EXTENSIONS/xinshu.ts"

echo "== 3/4 打中文补丁（命令 + 快捷键说明）=="
node "$DST/patch-slash-commands-zh.js"
node "$DST/patch-keybindings-zh.js"

echo "== 4/4 完成 =="
echo
echo "接下来请手动处理（这些含个人配置/密钥，不在仓库里）:"
echo "  1. 从旧机拷贝以下文件到 $DST :"
echo "       settings.json  auth.json  models.json  models-store.json"
echo "       extensions/lab-qwen.ts"
echo "  2. 不要把 my-pi 加入 settings.json 的 packages（不需要远程包）"
echo "  3. 启动 pi，/login 配置模型认证"
echo "  4. /reload 或重启 pi 使扩展与补丁生效"
echo
echo "完成。"
