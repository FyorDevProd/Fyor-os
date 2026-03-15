# =================================================================
# FYOR OS Windows Installer Script (PowerShell)
# =================================================================

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  🚀 Welcome to FYOR OS Windows Installer" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Cek Admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "❌ Error: Script ini harus dijalankan sebagai Administrator." -ForegroundColor Red
    exit
}

# 2. Cek Node.js
Write-Host "⏳ Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js tidak ditemukan." -ForegroundColor Red
    Write-Host "Silakan unduh dan instal Node.js v20+ dari https://nodejs.org/ sebelum melanjutkan." -ForegroundColor Yellow
    exit
}

# 3. Setup Direktori
$installDir = "C:\www\wwwroot\fyoros"
Write-Host "⏳ Setting up FYOR OS directory at $installDir..." -ForegroundColor Yellow

if (Test-Path $installDir) {
    Write-Host "⚠️ Directory $installDir already exists. Moving to backup..." -ForegroundColor Yellow
    Move-Item $installDir "$installDir`_backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
}

New-Item -ItemType Directory -Path $installDir -Force | Out-Null
Set-Location $installDir

# 4. Download Source Code
$repoUrl = "https://github.com/FyorDevProd/Fyor-os.git"
Write-Host "⏳ Downloading FYOR OS source code from GitHub..." -ForegroundColor Yellow

try {
    git clone $repoUrl .
} catch {
    Write-Host "❌ Git tidak ditemukan atau gagal melakukan clone." -ForegroundColor Red
    Write-Host "Mencoba mengunduh file ZIP..." -ForegroundColor Yellow
    $zipUrl = "https://github.com/FyorDevProd/Fyor-os/archive/refs/heads/main.zip"
    Invoke-WebRequest -Uri $zipUrl -OutFile "fyor-os.zip"
    Expand-Archive -Path "fyor-os.zip" -DestinationPath "." -Force
    # Move files from subfolder if needed
    $subFolder = Get-ChildItem -Directory | Where-Object { $_.Name -like "Fyor-os-main*" }
    if ($subFolder) {
        Move-Item "$($subFolder.FullName)\*" . -Force
        Remove-Item $subFolder.FullName -Recurse -Force
    }
    Remove-Item "fyor-os.zip"
}

# 5. Install Dependencies & Build
Write-Host "⏳ Installing dependencies (this may take a while)..." -ForegroundColor Yellow
npm install

Write-Host "⏳ Building application..." -ForegroundColor Yellow
npm run build

# 6. Install PM2 & Start
Write-Host "⏳ Installing PM2..." -ForegroundColor Yellow
npm install -g pm2

Write-Host "⏳ Starting FYOR OS..." -ForegroundColor Yellow
pm2 start npm --name "fyor-os" -- start
pm2 save

# 7. Selesai
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" }).IPAddress[0]

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  ✅ FYOR OS Installation Completed Successfully!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  🌐 Access your control panel at: http://$ip:3000" -ForegroundColor Green
Write-Host "  ⚙️  To view logs, run: pm2 logs fyor-os" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
