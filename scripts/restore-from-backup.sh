#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore-from-backup.sh <backup-file.tar.gz>"
    echo ""
    echo "Restores database + storage into running Docker containers."
    echo "Make sure 'docker compose up -d' is running first."
    exit 1
fi

BACKUP_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TEMP_DIR="$PROJECT_DIR/backups/_restore_temp"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ File not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring from: $BACKUP_FILE"
echo ""

mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR" --strip-components=1

source "$PROJECT_DIR/.env" 2>/dev/null || true
DB_CONTAINER=$(docker compose ps -q db 2>/dev/null)
APP_CONTAINER=$(docker compose ps -q app 2>/dev/null)

if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Database container not running. Run 'docker compose up -d' first."
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "📦 Restoring database via Docker..."
docker cp "$TEMP_DIR/database.dump" "$DB_CONTAINER":/tmp/database.dump
docker exec "$DB_CONTAINER" pg_restore \
    -U "${DB_USERNAME:-sman1_user}" \
    -d "${DB_DATABASE:-sman1_baleendah}" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    /tmp/database.dump 2>/dev/null || true
docker exec "$DB_CONTAINER" rm -f /tmp/database.dump
echo "   ✅ Database restored into Docker volume (postgres_data)"

echo "📷 Restoring storage media..."
if [ -d "$TEMP_DIR/storage-public" ]; then
    rm -rf "$PROJECT_DIR/storage/app/public"
    mv "$TEMP_DIR/storage-public" "$PROJECT_DIR/storage/app/public"
    echo "   ✅ Storage restored (bind mount → containers see it immediately)"
fi

echo "📸 Restoring instagram downloads..."
if [ -d "$TEMP_DIR/instagram-downloads" ]; then
    rm -rf "$PROJECT_DIR/instagram-scraper/downloads"
    mv "$TEMP_DIR/instagram-downloads" "$PROJECT_DIR/instagram-scraper/downloads"
    echo "   ✅ Instagram downloads restored"
fi

echo "🖼️  Restoring public images..."
if [ -d "$TEMP_DIR/public-images" ]; then
    rm -rf "$PROJECT_DIR/public/images"
    mv "$TEMP_DIR/public-images" "$PROJECT_DIR/public/images"
    echo "   ✅ Public images restored"
fi

rm -rf "$TEMP_DIR"

echo ""
echo "🔗 Re-linking storage & clearing cache via app container..."
if [ -n "$APP_CONTAINER" ]; then
    docker exec "$APP_CONTAINER" php artisan storage:link 2>/dev/null || true
    docker exec "$APP_CONTAINER" php artisan optimize:clear 2>/dev/null || true
    docker exec "$APP_CONTAINER" php artisan migrate --force 2>/dev/null || true
    echo "   ✅ Done"
else
    echo "   ⚠️  App container not running, run manually after 'docker compose up -d':"
    echo "      docker compose exec app php artisan storage:link"
    echo "      docker compose exec app php artisan optimize:clear"
fi

echo ""
echo "✅ Restore complete!"
echo ""
echo "Verify:"
echo "  docker compose exec app php artisan tinker --execute=\"echo DB::table('posts')->count();\""
