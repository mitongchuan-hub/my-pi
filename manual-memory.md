# 长期记忆

## 沟通
- 语言：中文。
- 每次回复末尾加简短"总结"：核心结论 + 关键行动项，不重复正文。
- 没理解清楚就先问、继续交流，确认后再动手。
- 倾向"能简则简"：仓库/文件能不放就不放，多余的东西主动指出并清理。

## 环境（本机）
- Windows + PowerShell：用 `curl.exe`（非 curl 别名），GitHub 加 `--ssl-no-revoke`；无 `head` 等 Linux 命令。
- PowerShell 内联 `node -e` 含正则/特殊字符易被破坏 → 写成 .js 文件再 `node xxx.js` 执行。
- GitHub 连接失败时走本地代理：`$env:HTTPS_PROXY="http://127.0.0.1:7890"`。
- pi 配置目录：`~/.pi/agent/`；pi 本体用 `npm i -g @earendil-works/pi-coding-agent` 安装。
- 个人仓库：github.com/mitongchuan-hub/my-pi（只放代码性质定制：扩展、补丁脚本、记忆；配置一律手动拷贝）。
