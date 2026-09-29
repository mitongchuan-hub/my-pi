# mitongchuan-hub — 我的 pi 个人环境包

把 pi（@earendil-works/pi-coding-agent）配置成我习惯的样子，拉下来即可用。

## 目录说明

| 路径 | 内容 |
|---|---|
| `extensions/` | 自写扩展：session-trash（会话归档四命令）、lab-qwen、manual-memory |
| `manual-memory.md` | 长期记忆（用户偏好） |
| `settings.json` | pi 全局设置 |
| `models.json` / `models-store.json` | 模型配置（无密钥，apiKey 均为 EMPTY，走 auth.json） |
| `trust.json` | 项目信任记录 |
| `patch-slash-commands-zh.js` | 给内置 / 命令说明加中文的补丁脚本（可重复执行） |

## ⚠️ 不含什么

- **pi 本体**——用 `npm i -g @earendil-works/pi-coding-agent` 装最新版
- pi 包（如 pi-xinshu）——`settings.json` 的 `packages` 字段已声明，pi 启动时自动从 GitHub 安装
- `auth.json`（API 密钥）——**刻意排除**，新机器需自行 `/login` 或手动从旧机拷贝
- `skills/`、`skill-install/`（第三方技能，按需另装）
- `runtimes/`（技能运行时，pi 会按需自动下载）
- `sessions/`（对话历史）

## 新机器使用步骤

```powershell
# 1. 安装 pi（如果不用本仓库的 bin/）
npm i -g @earendil-works/pi-coding-agent

# 2. 把本仓库内容复制到 pi 配置目录（已有文件会被覆盖，建议先备份）
$dst = Join-Path $env:USERPROFILE ".pi\agent"
Copy-Item -Recurse -Force .\* $dst

# 3. 给内置命令加中文说明（pi 升级后也要重跑）
node $dst\patch-slash-commands-zh.js

# 4. 配置模型认证（密钥不在此仓库）
pi   # 进入后执行 /login <provider>

# 5. 重启 pi 生效
```

## 常用自定义命令

| 命令 | 作用 |
|---|---|
| `/trash` | 当前会话移入回收站并自动开新会话 |
| `/trashlist` | 查看回收站 |
| `/trashrestore` | 恢复某个归档会话 |
| `/trashpurge` | 清空回收站 |

## 更新

本机改完 `~\.pi\agent` 后：

```powershell
# 同步回仓库并推送（在仓库目录下）
robocopy ..\.pi\agent . extensions manual-memory.md settings.json models.json models-store.json trust.json /E /XO
git add -A; git commit -m "sync"; git push
```
