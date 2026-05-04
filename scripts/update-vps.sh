#!/bin/bash
# =============================================================
# Quick update script for VPS after initial deployment
# Usage: ./scripts/update-vps.sh
# Run this ON THE VPS after git pull
# =============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "🚀 Updating SMAN 1 Baleendah..."
echo ""

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main
echo "   ✅ Code updated"
echo ""

# 2. Rebuild images
echo "🔨 Rebuilding Docker images..."
docker compose build app nginx instagram-scraper
echo "   ✅ Images rebuilt"
echo ""

# 3. Restart services (zero-downtime: start new, stop old)
echo "🔄 Restarting services..."
docker compose up -d --no-deps --force-recreate app nginx queue scheduler instagram-scraper
echo "   ✅ Services restarted"
echo ""

# 4. Wait for app to be healthy
echo "⏳ Waiting for app to be healthy..."
timeout=60
elapsed=0
while ! docker compose exec -T app php -v >/dev/null 2>&1; do
    sleep 2
    elapsed=$((elapsed + 2))
    if [ $elapsed -ge $timeout ]; then
        echo "   ⚠️  App didn't become healthy in ${timeout}s, continuing anyway..."
        break
    fi
done
if [ $elapsed -lt $timeout ]; then
    echo "   ✅ App is healthy"
fi
echo ""

# 5. Run migrations
echo "📦 Running migrations..."
docker compose exec -T app php artisan migrate --force
echo "   ✅ Migrations done"
echo ""

# 6. Clear and rebuild caches
echo "🗑️  Clearing caches..."
docker compose exec -T app php artisan optimize:clear
echo ""
echo "📦 Rebuilding caches..."
docker compose exec -T app php artisan config:cache
docker compose exec -T app php artisan route:cache
docker compose exec -T app php artisan view:cache
docker compose exec -T app php artisan event:cache
echo "   ✅ Caches rebuilt"
echo ""

# 7. Restart queue to pick up new code
echo "🔄 Restarting queue worker..."
docker compose restart queue
echo "   ✅ Queue restarted"
echo ""

# 8. Verify
echo "🔍 Verifying..."
APP_STATUS=$(docker compose ps app --format "{{.Status}}" 2>/dev/null || echo "unknown")
NGINX_STATUS=$(docker compose ps nginx --format "{{.Status}}" 2>/dev/null || echo "unknown")
echo "   App:   $APP_STATUS"
echo "   Nginx: $NGINX_STATUS"
echo ""

# Health check
if curl -sf http://localhost/health >/dev/null 2>&1; then
    echo "   ✅ Health check passed"
elif curl -sf http://localhost >/dev/null 2>&1; then
    echo "   ✅ Site is responding"
else
    echo "   ⚠️  Site not responding yet (may need a moment)"
fi

echo ""
echo "✅ Update complete!"
echo ""
echo "If something went wrong:"
echo "   docker compose logs app --tail=50"
echo "   docker compose logs nginx --tail=50"
