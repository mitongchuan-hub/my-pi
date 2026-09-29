# my-pi setup script for Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -File .\setup.ps1
# Installs pi, deploys local extensions (feature-per-subdir), and applies the Chinese UI patches.
# Personal files containing configuration or secrets stay outside this repository.
# pi never clones or updates this repository on startup.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dst = Join-Path $env:USERPROFILE ".pi\agent"
$extensions = Join-Path $dst "extensions"
$scripts = Join-Path $dst "scripts"

Write-Host "== 1/4 Install pi =="
if (-not (Get-Command pi -ErrorAction SilentlyContinue)) {
    npm i -g @earendil-works/pi-coding-agent
} else {
    Write-Host "pi is already installed; skipping"
}

Write-Host "== 2/4 Deploy custom files to $dst =="
New-Item -ItemType Directory -Force $extensions | Out-Null
New-Item -ItemType Directory -Force $scripts | Out-Null
# Extensions: one feature per subdirectory (trash/ memory/ xinshu/), each with index.ts.
Copy-Item (Join-Path $root "extensions\*") $extensions -Recurse -Force
# Maintenance scripts (Chinese UI patches).
Copy-Item (Join-Path $root "scripts\*") $scripts -Recurse -Force

Write-Host "== 3/4 Apply Chinese UI patches =="
node (Join-Path $scripts "patch-slash-commands-zh.js")
node (Join-Path $scripts "patch-keybindings-zh.js")

Write-Host "== 4/4 Done =="
Write-Host ""
Write-Host "Manual steps for personal files (not stored in this repository):"
Write-Host "  1. Copy these files from the old machine to $dst :"
Write-Host "       settings.json  auth.json  models.json  models-store.json"
Write-Host "       extensions\lab-qwen\index.ts   (provider with personal API key)"
Write-Host "  2. Do NOT add my-pi to settings.json packages (no remote package needed)."
Write-Host "  3. Start pi and use /login to configure authentication."
Write-Host "  4. Run /reload or restart pi."
