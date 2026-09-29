# my-pi — 我的 pi 个人定制层 + 自有 provider 包

把 pi（@earendil-works/pi-coding-agent）配成我习惯的样子。pi 本体用 npm 装。
本仓库既是**配置层**（扩展、记忆、中文补丁），也是一个**pi 包**（`provider/xinshu.ts`，xinshu 模型 provider），由 `settings.json` 的 `packages` 字段指向本仓库安装。

## 目录说明

| 路径 | 内容 |
|---|---|
| `provider/xinshu.ts` | xinshu 模型 provider 扩展（含我的定制：gpt-6-astra、1.05M 上下文、max 档位），作为 pi 包安装 |
| `package.json` | pi 包清单（`pi.extensions: ["./provider"]`），让 pi 识别本仓库为包 |
| `extensions/session-trash.ts` | 自写扩展：`/trash` `/trashlist` `/trashrestore` `/trashpurge` 会话归档/恢复命令 |
| `extensions/manual-memory.ts` | 记忆扩展 |
| `manual-memory.md` | 长期记忆（用户偏好） |
| `patch-slash-commands-zh.js` | 给内置 / 命令说明加中文的补丁脚本（可重复执行） |
| `patch-keybindings-zh.js` | 给内置快捷键说明（/hotkeys）加中文的补丁脚本（可重复执行） |

> 说明：你自己的扩展（session-trash / manual-memory / lab-qwen）始终从 `~/.pi/agent/extensions/` 加载，
> 不走包机制；pi 包的清单只暴露 `./provider`，两者不重叠、不会重复注册。

## ⚠️ 不入库的文件（需从旧机手动拷贝）

| 文件 | 原因 |
|---|---|
| `settings.json` | 含 `packages`（指向本仓库）+ 默认 provider/model 等个人设置，**故意不传** |
| `models.json` | 自定义 provider/模型（3 个内网 vLLM 端点） |
| `models-store.json` | pi 模型数据缓存 |
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
#    - models.json            → $dst\models.json
#    - models-store.json      → $dst\models-store.json

# 4. settings.json 的 packages 字段已指向本仓库，pi 启动会自动装 provider/xinshu.ts
#    （若未自动，用 pi 包管理器按 settings.json 的 packages 安装）

# 5. 给内置命令 + 快捷键加中文说明（pi 升级后也要重跑）
node $dst\patch-slash-commands-zh.js
node $dst\patch-keybindings-zh.js

# 6. 重启 pi，/login 配置模型认证，开始使用
```

## 常用自定义命令

| 命令 | 作用 |
|---|---|
| `/trash` | 当前会话移入回收站并自动开新会话 |
| `/trashlist` | 查看回收站 |
| `/trashrestore` | 从回收站恢复一个会话 |
| `/trashpurge` | 清空回收站（不可恢复） |

## 更新（本机 → 仓库）

```powershell
# 在仓库目录下同步（注意：不要把 settings.json / auth.json / lab-qwen.ts 带进来）
robocopy ..\.pi\agent . extensions manual-memory.md /E /XO
git status   # 确认没有把含密钥/个人设置的文件带进来
git add -A; git commit -m "sync"; git push
```
