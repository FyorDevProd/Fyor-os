#!/bin/bash

# =================================================================
# FYOR OS Auto-Installer Script
# Supported OS: Ubuntu 20.04/22.04/24.04, Debian 11/12
# =================================================================

set -e

# Warna untuk output terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================================${NC}"
echo -e "${GREEN}  🚀 Welcome to FYOR OS Auto-Installer${NC}"
echo -e "${BLUE}=================================================================${NC}"

# 1. Cek apakah dijalankan sebagai root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Error: Script ini harus dijalankan sebagai root (gunakan sudo).${NC}"
  exit 1
fi

# 2. Deteksi OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    OS=$(uname -s)
fi

echo -e "${YELLOW}⏳ Detected OS: $OS $VER${NC}"

# 3. Update sistem & Install Dependencies berdasarkan OS
case "$OS" in
    ubuntu|debian|raspbian)
        echo -e "${YELLOW}⏳ [1/7] Updating system packages (APT)...${NC}"
        apt-get update -y
        apt-get install -y curl git unzip build-essential ufw certbot python3-certbot-nginx
        
        echo -e "${YELLOW}⏳ [2/7] Installing Node.js (v20 LTS)...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        ;;
    centos|rhel|fedora|almalinux|rocky)
        echo -e "${YELLOW}⏳ [1/7] Updating system packages (YUM/DNF)...${NC}"
        yum update -y
        yum install -y curl git unzip gcc-c++ make certbot python3-certbot-nginx
        
        echo -e "${YELLOW}⏳ [2/7] Installing Node.js (v20 LTS)...${NC}"
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
        
        # Firewall setup for CentOS
        if command -v firewall-cmd >/dev/null; then
            firewall-cmd --permanent --add-port=3000/tcp
            firewall-cmd --permanent --add-port=22/tcp
            firewall-cmd --reload
        fi
        ;;
    *)
        echo -e "${RED}❌ Error: OS $OS tidak didukung oleh script ini secara otomatis.${NC}"
        exit 1
        ;;
esac

# 4. Install PM2 secara global
echo -e "${YELLOW}⏳ [4/7] Installing PM2 (Process Manager)...${NC}"
npm install -g pm2

# 6. Setup Direktori dan Download Source Code
INSTALL_DIR="/www/wwwroot/fyoros"
echo -e "${YELLOW}⏳ [5/7] Setting up FYOR OS directory at ${INSTALL_DIR}...${NC}"

if [ -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}⚠️ Directory $INSTALL_DIR already exists. Backing up...${NC}"
  mv "$INSTALL_DIR" "${INSTALL_DIR}_backup_$(date +%s)"
fi

# GANTI URL DI BAWAH INI DENGAN URL GITHUB REPOSITORY ABANG NANTINYA
REPO_URL="https://github.com/FyorDevProd/Fyor-os.git"

echo -e "${YELLOW}⏳ Downloading FYOR OS source code...${NC}"
# Jika belum ada github, kita buat folder kosong dulu sebagai placeholder
# git clone "$REPO_URL" "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Catatan: Bagian ini diasumsikan kode sudah ada di dalam $INSTALL_DIR
# Karena ini script contoh, kita akan lewati git clone jika REPO_URL belum diubah.
if [[ "$REPO_URL" == *"username-abang"* ]]; then
    echo -e "${RED}⚠️ Peringatan: REPO_URL belum diubah ke repository GitHub asli.${NC}"
    echo -e "${YELLOW}Silakan upload kode FYOR OS ke GitHub, lalu ubah REPO_URL di script ini.${NC}"
else
    git clone "$REPO_URL" .
fi

# 7. Install dan Build
echo -e "${YELLOW}⏳ [6/7] Installing Node.js dependencies & Building App...${NC}"
if [ -f "package.json" ]; then
    npm install
    npm run build

    # 8. Jalankan dengan PM2
    echo -e "${YELLOW}⏳ [7/7] Starting FYOR OS with PM2...${NC}"
    pm2 start npm --name "fyor-os" -- start
    pm2 save
    pm2 startup | grep "sudo" | bash || true
else
    echo -e "${RED}❌ Error: package.json tidak ditemukan. Pastikan source code sudah terdownload dengan benar.${NC}"
fi

# Buka Port 3000 di Firewall
echo -e "${YELLOW}⏳ Configuring Firewall (UFW)...${NC}"
ufw allow 3000/tcp
ufw allow 22/tcp
ufw --force enable

# Dapatkan IP Server
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)

echo -e "${BLUE}=================================================================${NC}"
echo -e "${GREEN}  ✅ FYOR OS Installation Completed Successfully!${NC}"
echo -e "${BLUE}=================================================================${NC}"
echo -e "  🌐 Access your control panel at: ${GREEN}http://$SERVER_IP:3000${NC}"
echo -e "  🔒 Port 3000 has been opened in your firewall."
echo -e "  ⚙️  To view logs, run: ${YELLOW}pm2 logs fyor-os${NC}"
echo -e "${BLUE}=================================================================${NC}"
