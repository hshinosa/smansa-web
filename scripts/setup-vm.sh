#!/bin/bash
# setup-vm.sh
# Setup VM untuk separated storage

set -euo pipefail

die() {
    echo "❌ ERROR: $*" >&2
    exit 1
}

require_cmd() {
    local cmd="$1"
    command -v "$cmd" >/dev/null 2>&1 || die "Required command not found: $cmd"
}

echo "🖥️  Setup VM for SMAN 1 Baleendah"
echo "=================================="
echo ""

# Configuration
STORAGE_BASE="${STORAGE_BASE:-/var/data/smansa}"
APP_DIR="${APP_DIR:-/var/www/smansa}"

echo "📁 Creating directories..."
echo "   Storage: $STORAGE_BASE"
echo "   App:     $APP_DIR"

# Create storage directories
sudo mkdir -p "$STORAGE_BASE"/{media,uploads,documents,backups,temp}
sudo mkdir -p "$STORAGE_BASE/media"/{conversions,responsive}

# Set permissions
sudo chmod -R 755 "$STORAGE_BASE"

# Docker user usually runs as 1000:1000 or 33:33 (www-data)
# Adjust ownership based on Docker setup
if id -u 1000 &>/dev/null; then
    sudo chown -R 1000:1000 "$STORAGE_BASE"
elif id -u www-data &>/dev/null; then
    sudo chown -R www-data:www-data "$STORAGE_BASE"
else
    sudo chown -R "$USER:$USER" "$STORAGE_BASE"
fi

echo "   ✓ Directories created"
echo ""

# Create app directory if not exists
if [[ ! -d "$APP_DIR" ]]; then
    echo "📂 Creating app directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown "$USER:$USER" "$APP_DIR"
    echo "   ✓ App directory created"
else
    echo "   ℹ️  App directory already exists"
fi

echo ""
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "   Installing Docker..."
    require_cmd curl
    tmp_docker_install="$(mktemp)"
    trap 'rm -f "$tmp_docker_install"' EXIT
    curl -fsSL https://get.docker.com -o "$tmp_docker_install"
    sudo sh "$tmp_docker_install"
    sudo usermod -aG docker "$USER"
    echo "   ✓ Docker installed"
else
    echo "   ✓ Docker already installed"
fi

echo ""
echo "🐳 Checking Docker Compose plugin..."
if docker compose version >/dev/null 2>&1; then
    echo "   ✓ Docker Compose plugin available"
else
    echo "   Docker Compose plugin is missing; attempting install..."
    if command -v apt-get >/dev/null 2>&1; then
        if sudo apt-get update && sudo apt-get install -y docker-compose-plugin; then
            :
        else
            echo "   ⚠️  apt-get install docker-compose-plugin failed; trying user-level plugin fallback..."
        fi
    fi

    if ! docker compose version >/dev/null 2>&1 && command -v curl >/dev/null 2>&1; then
        compose_version="v2.39.2"
        compose_plugin_dir="$HOME/.docker/cli-plugins"
        compose_plugin_path="$compose_plugin_dir/docker-compose"

        mkdir -p "$compose_plugin_dir"
        curl -fsSL "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)" -o "$compose_plugin_path"
        chmod +x "$compose_plugin_path"
    fi

    if docker compose version >/dev/null 2>&1; then
        echo "   ✓ Docker Compose plugin installed"
    else
        die "'docker compose' is not available. Install the Docker Compose plugin (package: docker-compose-plugin) or place the plugin binary at ~/.docker/cli-plugins/docker-compose, then rerun this script."
    fi
fi

echo ""
echo "📋 Summary:"
echo "   Storage path: $STORAGE_BASE"
echo "   App path:     $APP_DIR"
echo "   User:         $USER"
echo ""
echo "✅ VM setup complete!"
echo ""
echo "Next steps:"
echo "   1. Clone/pull code: cd $APP_DIR && git pull"
echo "   2. Generate .env.storage lewat: ./scripts/setup-separated-storage.sh"
echo "   3. Jalankan: docker compose up -d"
echo "   4. Restore data: ./scripts/restore-from-backup.sh backups/<file>.tar.gz"
echo ""
