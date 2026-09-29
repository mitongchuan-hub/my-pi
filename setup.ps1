# my-pi 新机器一键安装脚本
# 用法: 克隆本仓库后，在仓库目录里执行  .\setup.ps1
# 作用: 安装 pi 本体、把定制文件放入 pi 配置目录、打中文补丁
# 注意: 个人文件(settings/auth/models/lab-qwen)需从旧机拷贝，见末尾提示

$ErrorActionPreference = "Stop"
$dst = Join-Path $env:USERPROFILE ".pi\agent"

Write-Host "== 1/4 安装 pi 本体 ==" -ForegroundColor Cyan
if (-not (Get-Command pi -ErrorAction SilentlyContinue)) {
    npm i -g @earendil-works/pi-coding-agent
} else {
    Write-Host "pi 已安装，跳过"
}

Write-Host "== 2/4 部署定制文件到 $dst ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force $dst | Out-Null
# 自定义扩展 + 记忆 + 补丁脚本
Copy-Item .\extensions\* (Join-Path $dst "extensions") -Recurse -Force
Copy-Item .\manual-memory.md $dst -Force
Copy-Item .\patch-*.js $dst -Force
# 个人 provider 扩展（xinshu / lab-qwen，若本机已有则覆盖）
if (Test-Path .\provider\xinshu.ts) {
    Copy-Item .\provider\xinshu.ts (Join-Path $dst "extensions\xinshu.ts") -Force
}

Write-Host "== 3/4 打中文补丁（命令 + 快捷键说明）==" -ForegroundColor Cyan
node (Join-Path $dst "patch-slash-commands-zh.js")
node (Join-Path $dst "patch-keybindings-zh.js")

Write-Host "== 4/4 完成 ==" -ForegroundColor Cyan
Write-Host ""
Write-Host "接下来请手动处理（这些含个人配置/密钥，不在仓库里）:" -ForegroundColor Yellow
Write-Host "  1. 从旧机拷贝以下文件到 $dst :"
Write-Host "       settings.json  auth.json  models.json  models-store.json"
Write-Host "       extensions\lab-qwen.ts"
Write-Host "  2. 启动 pi，/login 配置模型认证"
Write-Host "  3. /reload 或重启 pi 使扩展与补丁生效"
Write-Host ""
Write-Host "全部完成 🎉" -ForegroundColor Green
