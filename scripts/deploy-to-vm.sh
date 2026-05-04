#!/bin/bash
# deploy-to-vm.sh
# Deploy storage dari lokal ke VM

set -euo pipefail

die() {
    echo "❌ ERROR: $*" >&2
    exit 1
}

require_cmd() {
    local cmd="$1"
    command -v "$cmd" >/dev/null 2>&1 || die "Required command not found: $cmd"
}

expand_path() {
    local input="$1"

    case "$input" in
        "~") printf '%s\n' "$HOME" ;;
        "~/*") printf '%s\n' "$HOME/${input#~/}" ;;
        *) printf '%s\n' "$input" ;;
    esac
}

shell_join() {
    local arg
    local joined=()

    for arg in "$@"; do
        joined+=("$(printf '%q' "$arg")")
    done

    printf '%s ' "${joined[@]}"
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Deploy Storage to VM"
echo "======================="
echo ""

# Load config
if [[ -f "$REPO_ROOT/.env.storage" ]]; then
    # shellcheck disable=SC1090
    source "$REPO_ROOT/.env.storage"
elif [[ -f .env.storage ]]; then
    # shellcheck disable=SC1091
    source .env.storage
fi

# Required / configurable values
VM_HOST="${VM_HOST:-}"
VM_USER="${VM_USER:-}"
VM_STORAGE_PATH="${VM_STORAGE_PATH:-/var/data/smansa}"
SSH_KEY="$(expand_path "${VM_SSH_KEY:-$HOME/.ssh/id_smansa}")"
LOCAL_STORAGE="$(expand_path "${STORAGE_BASE_PATH:-$REPO_ROOT/storage/app/public}")"

if [[ -z "$VM_HOST" || -z "$VM_USER" ]]; then
    echo "❌ ERROR: VM_HOST and VM_USER must be set (via environment or .env.storage)"
    echo ""
    echo "Example:"
    echo "  export VM_HOST=your-server"
    echo "  export VM_USER=deploy"
    exit 1
fi

require_cmd ssh
require_cmd rsync

if [[ ! -f "$SSH_KEY" ]]; then
    die "SSH key not found: $SSH_KEY"
fi

if [[ ! -r "$SSH_KEY" ]]; then
    die "SSH key is not readable: $SSH_KEY"
fi

# Check if running on Windows (Git Bash)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "ℹ️  Windows detected - using relative paths"
    SSH_KEY="${SSH_KEY//\\//}"
fi

REMOTE_TARGET="$VM_USER@$VM_HOST"
SSH_OPTS=(-i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=10 -o ServerAliveInterval=15 -o ServerAliveCountMax=2 -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
RSYNC_SSH_CMD="$(shell_join ssh "${SSH_OPTS[@]}")"

echo "📤 Source (Lokal): $LOCAL_STORAGE"
echo "📥 Target (VM):    $REMOTE_TARGET:$VM_STORAGE_PATH"
echo ""

# Check if local storage exists
if [[ ! -d "$LOCAL_STORAGE" ]]; then
    echo "❌ ERROR: Local storage not found: $LOCAL_STORAGE"
    echo ""
    echo "Pastikan:"
    echo "   1. Storage sudah di-setup dengan: ./scripts/setup-separated-storage.sh"
    echo "   2. Atau path di .env.storage sudah benar"
    exit 1
fi

# Test SSH connection
echo "🔌 Testing SSH connection to VM..."
if ! ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "echo Connected" >/dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to VM"
    echo ""
    echo "Troubleshooting:"
    echo "   1. Pastikan SSH key ada: $SSH_KEY"
    echo "   2. Pastikan VM online: ping $VM_HOST"
    echo "   3. Cek SSH config: ssh -v -i $SSH_KEY $REMOTE_TARGET"
    exit 1
fi
echo "   ✓ SSH connection OK"
echo ""

# Create storage directory on VM
echo "📁 Creating storage directory on VM..."
ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" bash -s -- "$VM_STORAGE_PATH" <<'EOF'
set -euo pipefail

remote_storage_path="$1"
sudo mkdir -p -- "$remote_storage_path"
sudo chmod 755 -- "$remote_storage_path"
EOF
echo "   ✓ Directory ready"
echo ""

# Sync storage data
echo "🔄 Syncing storage data..."
echo "   This may take a while for large storage..."
echo ""

# Using rsync with progress
rsync -avz --progress --protect-args \
    -e "$RSYNC_SSH_CMD" \
    --exclude='*.tmp' \
    --exclude='temp/' \
    "$LOCAL_STORAGE/" \
    "$REMOTE_TARGET:$VM_STORAGE_PATH/"

echo ""
echo "✅ Sync completed!"
echo ""

# Verify on VM
echo "🔍 Verifying on VM..."
ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" bash -s -- "$VM_STORAGE_PATH" <<'EOF'
set -euo pipefail

remote_storage_path="$1"

echo 'Storage contents:'
ls -la -- "$remote_storage_path/"
echo ''
echo 'Size:'
du -sh -- "$remote_storage_path/"
EOF

echo ""
echo "📝 Next steps on VM:"
echo "   1. SSH ke VM: ssh -i $SSH_KEY $REMOTE_TARGET"
echo "   2. Pull latest code: cd /var/www/smansa && git pull"
echo "   3. Start containers: docker compose up -d"
echo "   4. Restore backup if needed: ./scripts/restore-from-backup.sh backups/<file>.tar.gz"
echo ""
