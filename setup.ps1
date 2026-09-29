# my-pi setup script for Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -File .\setup.ps1
# Installs pi, deploys safe custom files, and applies the Chinese UI patches.
# Personal files containing configuration or secrets stay outside this repository.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dst = Join-Path $env:USERPROFILE ".pi\agent"
$extensions = Join-Path $dst "extensions"

Write-Host "== 1/4 Install pi =="
if (-not (Get-Command pi -ErrorAction SilentlyContinue)) {
    npm i -g @earendil-works/pi-coding-agent
} else {
    Write-Host "pi is already installed; skipping"
}

Write-Host "== 2/4 Deploy custom files to $dst =="
New-Item -ItemType Directory -Force $extensions | Out-Null
Copy-Item (Join-Path $root "extensions\*") $extensions -Recurse -Force
Copy-Item (Join-Path $root "manual-memory.md") $dst -Force
Copy-Item (Join-Path $root "patch-*.js") $dst -Force
# xinshu provider is loaded as a local extension (not a remote pi package),
# so pi never clones or updates the repository on startup.
Copy-Item (Join-Path $root "provider\xinshu.ts") (Join-Path $extensions "xinshu.ts") -Force

Write-Host "== 3/4 Apply Chinese UI patches =="
node (Join-Path $dst "patch-slash-commands-zh.js")
node (Join-Path $dst "patch-keybindings-zh.js")

Write-Host "== 4/4 Done =="
Write-Host ""
Write-Host "Manual steps for personal files (not stored in this repository):"
Write-Host "  1. Copy these files from the old machine to $dst :"
Write-Host "       settings.json  auth.json  models.json  models-store.json"
Write-Host "       extensions\lab-qwen.ts"
Write-Host "  2. Do NOT add my-pi to settings.json packages (no remote package needed)."
Write-Host "  3. Start pi and use /login to configure authentication."
Write-Host "  4. Run /reload or restart pi."
