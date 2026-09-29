# my-pi — 我的 pi 个人定制层

把 pi（@earendil-works/pi-coding-agent）配成我习惯的样子。pi 本体用 npm 装，这里只放你的定制：扩展、记忆、模型配置、中文补丁。

## 目录说明

| 路径 | 内容 |
|---|---|
| `extensions/session-trash.ts` | 自写扩展：`/trash` `/trashlist` `/trashrestore` `/trashpurge` 会话归档/恢复命令 |
| `extensions/manual-memory.ts` | 记忆扩展 |
| `manual-memory.md` | 长期记忆（用户偏好） |
| `models.json` | 自定义 provider/模型（3 个内网 vLLM 端点，无密钥） |
| `models-store.json` | pi 模型数据缓存（可由 pi 自动重建，此份仅为备份） |
| `patch-slash-commands-zh.js` | 给内置 / 命令说明加中文的补丁脚本（可重复执行） |

## ⚠️ 不入库的文件（需从旧机手动拷贝）

| 文件 | 原因 |
|---|---|
| `settings.json` | 含 pi 包清单（pi-xinshu）+ 默认 provider/model 等个人设置，**故意不传** |
| `auth.json` | API 密钥，新机器自行 `/login` |
| `extensions/lab-qwen.ts` | 内含个人 API Key |
| `trust.json` | 本机项目信任记录，pi 首次打开项目会重新询问 |

## 新机器使用步骤

```powershell
# 1. 安装 pi 本体
npm i -g @earendil-works/pi-coding-agent

# 2. 把本仓库内容复制到 pi 配置目录（已有文件会被覆盖，建议先备份）
$dst = Join-Path $env:USERPROFILE ".pi\agent"
Copy-Item -Recurse -Force .\* $dst

# 3. 手动补上不入库的个人文件（从旧机拷贝）
#    - settings.json      → $dst\settings.json
#    - auth.json          → $dst\auth.json
#    - extensions\lab-qwen.ts → $dst\extensions\lab-qwen.ts

# 4. 安装 settings.json 里声明的 pi 包（如 pi-xinshu）
#    进入 pi 后用 / 或 pi 包管理器按 settings.json 的 packages 字段安装

# 5. 给内置命令加中文说明（pi 升级后也要重跑）
node $dst\patch-slash-commands-zh.js

# 6. 重启 pi，/login 配置模型认证，开始使用
```

## 常用自定义命令

| 命令 | 作用 |
|---|---|
| `/trash` | 当前会话移入回收站并自动开新会话 |
| `/trashlist` | 查看回收站 |
| `/trashrestore` | 恢复某个归档会话 |
| `/trashpurge` | 清空回收站 |

## 更新（本机 → 仓库）

```powershell
# 在仓库目录下同步（注意：不要把 settings.json / auth.json / lab-qwen.ts 带进来）
robocopy ..\.pi\agent . extensions manual-memory.md models.json models-store.json /E /XO
git status   # 确认没有把含密钥/个人设置的文件带进来
git add -A; git commit -m "sync"; git push
```
