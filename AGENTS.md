# AGENTS.md

**Generated:** 2026-04-22  
**Stack:** Laravel 12 + React 18 + Inertia.js + PostgreSQL 15 + Python Scraper

## CRITICAL COMMANDS

### Development (MUST USE)
```bash
# Full stack - server + queue + logs + vite (PREFERRED)
composer dev

# Individual services (if needed)
php artisan serve              # :8000
php artisan queue:listen --tries=1
php artisan pail --timeout=0
npm run dev
```

### Testing
```bash
# PHPUnit (uses SQLite in-memory)
composer test
php artisan test --filter TestName

# E2E (auto-starts server on :8000)
npm run test:e2e
```

### Code Quality
```bash
./vendor/bin/pint              # Laravel Pint formatter
./vendor/bin/pint path/to/file.php
```

## ARCHITECTURE GOTCHAS

### Service Layer (MANDATORY)
Business logic MUST go in `app/Services/`, NOT controllers. Key services:
- **RagService** - AI/RAG chatbot (embeddings, semantic search, LLM)
- **ChatCacheService** - Response caching (cost reduction)
- **EmbeddingService** - Text embeddings via HuggingFace TEI
- **GroqService** - LLM inference (Groq API)
- **ImageService** - WebP conversion, responsive images
- **InputSanitizationService** - XSS prevention (HTMLPurifier)
- **DatabaseContentRagSyncService** - Sync DB content to RAG

### Inertia.js Pattern
- Controllers return `Inertia::render('PageName', $data)` (NOT JSON)
- React components receive props from Laravel
- Forms use `useForm` from `@inertiajs/react`
- Routes via Ziggy: `route('route.name')`
- NO separate API layer for frontend

### Media Library (Spatie)
- Models use `HasMedia` trait + `registerMediaConversions()`
- Path generator: `CustomPathGenerator` uses `md5($media->id)` (NOT UUID!)
- WebP quality: 75 (default), 70 (large), 65 (thumb)
- Regenerate: `php artisan media-library:regenerate --force`

### Queue Jobs
- Connection: Redis (prod) or sync (local)
- Jobs in `app/Jobs/`: ProcessInstagramPost, ProcessRagDocument, RunInstagramScraperJob
- Queue worker: `php artisan queue:listen --tries=1` (included in `composer dev`)

### AI/RAG System
1. Documents chunked and embedded (EmbeddingService)
2. User queries embedded and matched (pgvector semantic search)
3. Context retrieved and passed to LLM (RagService)
4. Responses cached (ChatCacheService)

Config: `ai_settings` table + `.env` (AI_MODEL_BASE_URL, AI_MODEL_API_KEY, OLLAMA_BASE_URL)

## PYTHON SCRAPER SUBSYSTEM

**Location:** `instagram-scraper/`  
**Isolation:** Shares PostgreSQL ONLY, no Laravel code imports  
**Table Prefix:** ALL tables use `sc_` prefix (avoid collisions)

### Commands
```bash
cd instagram-scraper
source venv/bin/activate  # if using venv
python scraper.py --target sman1baleendah --max-posts 50
```

### Workflow
```
1. [Python] scraper.py → sc_raw_news_feeds (is_processed=false)
2. [Laravel] ProcessInstagramPost job → AI generation
3. [Laravel] Create Post draft, mark processed
4. [Admin] Review & publish
```

### Anti-Ban Rules (CRITICAL)
- Session reuse (session-{username} files)
- Random delays 10-20s between requests
- Max 50 posts per run
- Use burner Instagram accounts

## DOCKER ENVIRONMENT

### Compose Files
- `docker-compose.yml` - Base config
- `docker-compose.dev.yml` - Dev overrides
- `docker-compose.prod.yml` - Production
- `docker-compose.local.yml` - Localhost overrides (fixes session issues)

### Services
- **app** - PHP-FPM (Laravel)
- **nginx** - Web server
- **db** - PostgreSQL 15 + pgvector
- **redis** - Cache/sessions
- **queue** - Queue worker
- **scheduler** - Cron jobs
- **embedding** - HuggingFace TEI (multilingual-e5-small)
- **instagram-scraper** - Python scraper (runs every 6h)

### Localhost Fix
If login fails on localhost:
```bash
docker-compose -f docker-compose.yml -f docker-compose.local.yml up -d
docker-compose exec app php artisan config:clear
```

## FRONTEND CONVENTIONS

### Structure
```
resources/js/
├── Components/     # Reusable UI (use @/ alias)
├── Pages/         # Inertia page components
│   ├── Admin/    # Backend pages
│   └── Public/   # Frontend pages
├── Layouts/       # AdminLayout, PublicLayout
└── Hooks/         # Custom hooks
```

### Patterns
- Functional components only
- Imports: `@/Components/Name` (NOT relative paths)
- Forms: `useForm` from `@inertiajs/react`
- Routing: `Link` from `@inertiajs/react` (NEVER `<a>`)
- Images: Use `ResponsiveImage` or `LazyImage` components
- Styling: Tailwind utilities first

## ROUTE ORGANIZATION

**File:** `routes/web.php`
- Public routes at root level (ungrouped)
- Admin routes: `Route::prefix('admin')->name('admin.')` with auth middleware
- API routes: `routes/api.php` (chatbot, health checks)

## TESTING QUIRKS

### PHPUnit
- Uses SQLite in-memory (configured in `phpunit.xml`)
- Run via `composer test` (clears config first)
- Security tests cover XSS, CSRF, input sanitization, CSP

### Playwright
- Auto-starts server on :8000 (see `playwright.config.js`)
- Tests in `tests/playwright/`
- Run via `npm run test:e2e`

## ENVIRONMENT VARIABLES

Key vars in `.env`:
- `APP_ENV` - local/production (affects session cookies, URLs)
- `DB_CONNECTION=pgsql` - PostgreSQL required
- `REDIS_HOST` - Cache/sessions
- `AI_MODEL_BASE_URL` - OpenAI-compatible API endpoint
- `AI_MODEL_API_KEY` - API key
- `OLLAMA_BASE_URL` - Local Ollama for embeddings
- `EMBEDDING_BASE_URL` - HuggingFace TEI service

## COMMON MISTAKES

### DO NOT
- Put business logic in controllers (use Services)
- Use `as any` or `@ts-ignore` (type safety)
- Commit without explicit request
- Delete failing tests to "pass"
- Use `<a>` tags in React (use Inertia `Link`)
- Import React components with relative paths (use `@/`)
- Run long-running commands in tests (dev servers, watchers)

### DO
- Run `lsp_diagnostics` after EVERY code change
- Use `AiSetting::get('key')` for AI config (cached 1hr)
- Sanitize user input via `InputSanitizationService`
- Use `HasMedia` trait for file uploads
- Follow existing patterns (check similar files first)

## IMAGE OPTIMIZATION

Recent focus on WebP:
- Hero images: `<link rel="preload">` for LCP
- Below-fold: `loading="lazy"`
- Quality: 75 (default), 70 (large), 65 (thumb)
- Responsive srcset auto-generated

## SECURITY

- All user input sanitized via `InputSanitizationService`
- CSP headers configured
- CSRF protection on all forms
- Admin routes protected by auth middleware

## ADDING NEW FEATURES

### Public Page
1. Controller in `app/Http/Controllers/Public/`
2. Inertia page in `resources/js/Pages/`
3. Route in `routes/web.php`
4. Navigation link if needed

### Admin Feature
1. Model + migration
2. Controller in `app/Http/Controllers/Admin/`
3. Page in `resources/js/Pages/Admin/`
4. Routes under `/admin` prefix with auth middleware
5. Sidebar navigation item

### Media Upload
1. Use `HasMedia` trait on model
2. Implement `registerMediaConversions()` for responsive images
3. Upload: `$model->addMedia($file)->toMediaCollection('collection-name')`
4. Access: `$model->getFirstMediaUrl('collection-name', 'conversion-name')`

## CACHE MANAGEMENT

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Production optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## KNOWN ISSUES

### MediaLibrary Path Generator
- Uses `md5($media->id)` for directory paths (NOT UUID!)
- CustomPathGenerator: `app/Services/MediaLibrary/CustomPathGenerator.php`
- Example: Media ID 588 → path `md5(588)` = `daca41214b39c5dc66674d09081940f0/`

### Docker Localhost Login
- APP_ENV=production causes HTTPS URLs on localhost
- Use `docker-compose.local.yml` override to fix
- See memory block `docker-login-fix-plan` for full fix

### Instagram Scraper
- Session files must be preserved (gitignored)
- Random delays are MANDATORY (anti-ban)
- Use burner accounts only
- Max 50 posts per run recommended

## REFERENCES

- **CLAUDE.md** - Detailed architecture and patterns
- **instagram-scraper/AGENTS.md** - Python scraper specifics
- **docs/** - Additional documentation
- **memory blocks** - Session-specific context (commands-workflows, laravel-conventions, etc.)
