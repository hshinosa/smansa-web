#!/bin/bash
# =============================================================
# Backup database + storage for VPS deployment
# Usage: ./scripts/backup-for-vps.sh
# Output: backups/smansa-backup-YYYY-MM-DD.tar.gz
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_NAME="smansa-backup-$DATE"
TEMP_DIR="$BACKUP_DIR/$BACKUP_NAME"

echo "🔄 Starting backup..."
echo "   Project: $PROJECT_DIR"
echo ""

# Create backup directory
mkdir -p "$TEMP_DIR"

# 1. Database dump
echo "📦 Dumping PostgreSQL database..."
source "$PROJECT_DIR/.env" 2>/dev/null || true

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-smansa_web}"
DB_USERNAME="${DB_USERNAME:-postgres}"

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USERNAME" \
    -d "$DB_DATABASE" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    -F c \
    -f "$TEMP_DIR/database.dump"

echo "   ✅ Database dumped ($(du -sh "$TEMP_DIR/database.dump" | cut -f1))"

# 2. Storage media (Spatie media-library files)
echo "📷 Copying storage/app/public (media files)..."
if [ -d "$PROJECT_DIR/storage/app/public" ]; then
    cp -r "$PROJECT_DIR/storage/app/public" "$TEMP_DIR/storage-public"
    echo "   ✅ Storage copied ($(du -sh "$TEMP_DIR/storage-public" | cut -f1))"
else
    echo "   ⚠️  No storage/app/public found"
fi

# 3. Instagram scraper downloads
echo "📸 Copying instagram-scraper/downloads..."
if [ -d "$PROJECT_DIR/instagram-scraper/downloads" ]; then
    cp -r "$PROJECT_DIR/instagram-scraper/downloads" "$TEMP_DIR/instagram-downloads"
    echo "   ✅ Instagram downloads copied ($(du -sh "$TEMP_DIR/instagram-downloads" | cut -f1))"
else
    echo "   ⚠️  No instagram downloads found"
fi

# 4. Public images (hero, kepsek, etc)
echo "🖼️  Copying public/images..."
if [ -d "$PROJECT_DIR/public/images" ]; then
    cp -r "$PROJECT_DIR/public/images" "$TEMP_DIR/public-images"
    echo "   ✅ Public images copied ($(du -sh "$TEMP_DIR/public-images" | cut -f1))"
fi

# 5. Compress
echo ""
echo "🗜️  Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$TEMP_DIR"

FINAL_SIZE=$(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
echo ""
echo "✅ Backup complete!"
echo "   📁 File: backups/$BACKUP_NAME.tar.gz"
echo "   📏 Size: $FINAL_SIZE"
echo ""
echo "📤 Transfer to VPS:"
echo "   scp backups/$BACKUP_NAME.tar.gz user@your-vps:/path/to/project/backups/"
echo ""
echo "🔧 Then on VPS, run:"
echo "   ./scripts/restore-from-backup.sh backups/$BACKUP_NAME.tar.gz"
