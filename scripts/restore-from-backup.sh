#!/bin/bash
set -Eeuo pipefail

log() {
    printf '%s\n' "$*"
}

warn() {
    printf '%s\n' "⚠️  $*"
}

error() {
    printf '%s\n' "❌ $*" >&2
}

cleanup() {
    if [ -n "${TEMP_DIR:-}" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

run_compose() {
    docker compose --project-directory "$PROJECT_DIR" -f "$PROJECT_DIR/docker-compose.yml" "$@"
}

container_path_is_writable() {
    local container_name="$1"
    local path="$2"

    docker exec "$container_name" sh -lc "test -w '$path'"
}

trap cleanup EXIT

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
TEMP_DIR="$(mktemp -d)"

if [ ! -f "$BACKUP_FILE" ] && [ -f "$PROJECT_DIR/$BACKUP_FILE" ]; then
    BACKUP_FILE="$PROJECT_DIR/$BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    error "File not found: $BACKUP_FILE"
    exit 1
fi

log "🔄 Restoring from: $BACKUP_FILE"
log ""

tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR" --strip-components=1

source "$PROJECT_DIR/.env" 2>/dev/null || true
DB_CONTAINER="$(run_compose ps -q db 2>/dev/null || true)"
APP_CONTAINER="$(run_compose ps -q app 2>/dev/null || true)"
NGINX_CONTAINER="$(run_compose ps -q nginx 2>/dev/null || true)"
SCRAPER_CONTAINER="$(run_compose ps -q instagram-scraper 2>/dev/null || true)"

if [ -z "$DB_CONTAINER" ]; then
    error "Database container not running. Run 'docker compose up -d' from the repo root first."
    exit 1
fi

restore_failed=0
db_restore_failed=0

if [ ! -f "$TEMP_DIR/database.dump" ]; then
    error "Backup archive is missing database.dump"
    exit 1
fi

log "📦 Restoring database via Docker..."
docker cp "$TEMP_DIR/database.dump" "$DB_CONTAINER":/tmp/database.dump
if ! docker exec "$DB_CONTAINER" pg_restore \
    -U "${DB_USERNAME:-sman1_user}" \
    -d "${DB_DATABASE:-sman1_baleendah}" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    /tmp/database.dump; then
    db_restore_failed=1
    restore_failed=1
    error "Database restore failed. Review the pg_restore output above."
fi
docker exec "$DB_CONTAINER" rm -f /tmp/database.dump
if [ "$db_restore_failed" -eq 0 ]; then
    log "   ✅ Database restored into Docker volume (postgres_data)"
fi

if [ -n "$APP_CONTAINER" ]; then
    log "📷 Restoring storage media via app container..."
    if [ -d "$TEMP_DIR/storage-public" ]; then
        if container_path_is_writable "$APP_CONTAINER" /var/www/storage; then
            docker cp "$TEMP_DIR/storage-public/." "$APP_CONTAINER":/var/www/storage/app/public/
            docker exec -u root "$APP_CONTAINER" sh -lc 'chown -R www-data:www-data /var/www/storage/app/public && chmod -R ug+rwX /var/www/storage/app/public'
            log "   ✅ Storage restored (contents copied directly into storage/app/public)"
        else
            warn "Skipping storage-public restore because /var/www/storage is not writable in the running container (likely local bind-mounted mode)."
        fi
    fi

    log "📸 Restoring instagram downloads via scraper container..."
    if [ -d "$TEMP_DIR/instagram-downloads" ]; then
        if [ -n "$SCRAPER_CONTAINER" ]; then
            docker exec -u root "$SCRAPER_CONTAINER" sh -lc 'rm -rf /var/www/instagram-scraper/downloads && mkdir -p /var/www/instagram-scraper/downloads'
            docker cp "$TEMP_DIR/instagram-downloads/." "$SCRAPER_CONTAINER":/var/www/instagram-scraper/downloads/
            docker exec -u root "$SCRAPER_CONTAINER" sh -lc 'chown -R www-data:www-data /var/www/instagram-scraper/downloads && chmod -R ug+rwX /var/www/instagram-scraper/downloads'
            log "   ✅ Instagram downloads restored"
        else
            warn "Instagram scraper container not running; skipping instagram downloads restore."
        fi
    fi

    log "🖼️  Restoring public images via app container..."
    if [ -d "$TEMP_DIR/public-images" ]; then
        if container_path_is_writable "$APP_CONTAINER" /var/www/public; then
            docker exec -u root "$APP_CONTAINER" sh -lc 'rm -rf /var/www/public/images && mkdir -p /var/www/public/images'
            docker cp "$TEMP_DIR/public-images/." "$APP_CONTAINER":/var/www/public/images/
            docker exec -u root "$APP_CONTAINER" sh -lc 'chown -R www-data:www-data /var/www/public/images && chmod -R ug+rwX /var/www/public/images'
            log "   ✅ Public images restored"
        else
            warn "Skipping public-images restore because /var/www/public is not writable in the running container (likely local bind-mounted mode)."
        fi
    fi
else
    warn "App container not running; skipping file restore into bind mounts."
fi

log ""
log "🔗 Re-linking storage & clearing cache via app container..."
if [ -n "$APP_CONTAINER" ]; then
    docker exec "$APP_CONTAINER" php artisan storage:link 2>/dev/null || true
    docker exec "$APP_CONTAINER" php artisan optimize:clear 2>/dev/null || true
    docker exec "$APP_CONTAINER" php artisan migrate --force 2>/dev/null || true
    if [ -n "$NGINX_CONTAINER" ]; then
        docker exec "$NGINX_CONTAINER" nginx -s reload 2>/dev/null || true
    fi
    log "   ✅ Done"
else
    warn "App container not running, run manually after 'docker compose up -d' from the repo root:"
    log "      docker compose --project-directory \"$PROJECT_DIR\" -f \"$PROJECT_DIR/docker-compose.yml\" exec app php artisan storage:link"
    log "      docker compose --project-directory \"$PROJECT_DIR\" -f \"$PROJECT_DIR/docker-compose.yml\" exec app php artisan optimize:clear"
fi

log ""
if [ "$restore_failed" -eq 0 ]; then
    log "✅ Restore complete!"
else
    error "Restore completed with errors. Fix the failed restore steps above before relying on this backup."
fi
log ""
log "Verify:"
log "  docker compose --project-directory \"$PROJECT_DIR\" -f \"$PROJECT_DIR/docker-compose.yml\" exec app php artisan tinker --execute=\"echo DB::table('posts')->count();\""

if [ "$restore_failed" -ne 0 ]; then
    exit 1
fi
