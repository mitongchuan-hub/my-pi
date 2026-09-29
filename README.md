# my-pi — 我的 pi 个人定制层（纯源码仓库）

把 pi（@earendil-works/pi-coding-agent）配成我习惯的样子。pi 本体用 npm 装（官方底座）。

本仓库**只是源码存档**：所有定制（扩展、provider、记忆、中文补丁）都以**本地文件**形式加载到
`~/.pi/agent/`。扩展按**功能分子目录**组织（pi 原生规则：`extensions/<功能>/index.ts`，一层为限），
**不加入 `settings.json` 的 `packages`，pi 启动时不会 clone / 更新 / 联网同步本仓库**。
更新定制 = 在仓库里改文件、提交推送，需要时再手动运行同步步骤。

## 目录说明

```
├── extensions/                 # 所有代码类功能，一个功能一个子目录
│   ├── trash/index.ts          # 会话回收站：/trash /trashlist /trashrestore /trashpurge
│   ├── memory/
│   │   ├── index.ts            # 记忆扩展：/memory /remember
│   │   └── manual-memory.md    # 长期记忆数据（与代码同目录）
│   └── xinshu/index.ts         # xinshu provider（gpt-6-astra、1.1M 上下文等定制）
├── scripts/                    # 维护脚本（中文补丁，升级 pi 后重跑）
│   ├── patch-slash-commands-zh.js
│   └── patch-keybindings-zh.js
├── setup.ps1                   # 新机器一键安装（Windows）
├── setup.sh                    # 新机器一键安装（macOS / Linux）
└── README.md
```

> 说明：
> - 本地 `~/.pi/agent/extensions/` 还会多一个 `lab-qwen/` 子目录（含个人 API Key，**不入库**）。
> - 技能（skills）、提示模板（prompts）、主题（themes）走 pi 的官方目录（如 `skills/`），不塞进 extensions。
> - 仓库没有 `package.json`，不会被误装为远程 pi 包。

## ⚠️ 不入库的文件（需从旧机手动拷贝）

| 文件 | 原因 |
|---|---|
| `settings.json` | 默认 provider/model、shell、主题等个人设置，**故意不传** |
| `models.json` | 自定义 provider/模型（3 个内网 vLLM 端点） |
| `models-store.json` | pi 模型数据缓存 |
| `auth.json` | API 密钥，新机器自行 `/login` |
| `extensions/lab-qwen/index.ts` | 内含个人 API Key |
| `trust.json` | 本机项目信任记录，pi 首次打开项目会重新询问 |

## 新机器使用步骤（三步，跨平台）

通用流程：**装 pi 本体 → 克隆本仓库 → 跑对应系统的一键脚本**。
脚本会部署全部本地文件（含 xinshu provider）、打中文补丁，并提示需手动拷贝的个人文件。
**不要**把本仓库加进 `settings.json` 的 `packages`。

前置条件：已安装 Node.js/npm 和 Git；仓库为公开仓库，不要求 GitHub CLI。

**macOS / Linux**
```bash
# 1. 安装 pi 本体
npm i -g @earendil-works/pi-coding-agent

# 2. 克隆本仓库
git clone https://github.com/mitongchuan-hub/my-pi.git
cd my-pi

# 3. 一键安装
bash setup.sh
```

**Windows（PowerShell）**
```powershell
# 1. 安装 pi 本体
npm i -g @earendil-works/pi-coding-agent

# 2. 克隆本仓库
git clone https://github.com/mitongchuan-hub/my-pi.git
cd my-pi

# 3. 一键安装
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

## 常用自定义命令

| 命令 | 作用 |
|---|---|
| `/trash` | 当前会话移入回收站并自动开新会话 |
| `/trashlist` | 查看回收站 |
| `/trashrestore` | 从回收站恢复一个会话 |
| `/trashpurge` | 清空回收站（不可恢复） |
| `/memory` | 编辑长期记忆 |
| `/remember` | 追加一条长期偏好 |

## 更新（本机 → 仓库）

只同步仓库中允许公开的文件，不要把 `settings.json`、`auth.json`、`models.json`、`models-store.json`、`trust.json` 或 `extensions/lab-qwen/` 加入仓库。

**Windows（PowerShell）**：在仓库目录执行
```powershell
Copy-Item "$env:USERPROFILE\.pi\agent\extensions\trash\index.ts" .\extensions\trash\ -Force
Copy-Item "$env:USERPROFILE\.pi\agent\extensions\memory\*" .\extensions\memory\ -Force
Copy-Item "$env:USERPROFILE\.pi\agent\extensions\xinshu\index.ts" .\extensions\xinshu\ -Force
git status
git add README.md extensions setup.ps1 setup.sh scripts
git diff --cached --check
```

**macOS / Linux**：在仓库目录执行
```bash
cp "$HOME/.pi/agent/extensions/trash/index.ts" ./extensions/trash/
cp -R "$HOME/.pi/agent/extensions/memory/." ./extensions/memory/
cp "$HOME/.pi/agent/extensions/xinshu/index.ts" ./extensions/xinshu/
git status
git add README.md extensions setup.ps1 setup.sh scripts
git diff --cached --check
```

确认暂存区没有个人配置或密钥后，再提交并推送。
（本机与仓库的差异只影响"下次同步/新机部署"，pi 本身一直用本地文件，随时可用。）
