# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SMAN 1 Baleendah school website - a Laravel 12 + React (Inertia.js) application with AI chatbot capabilities using RAG (Retrieval Augmented Generation). The site serves both public visitors and admin users for content management.

**Tech Stack**: Laravel 12 (PHP 8.2+), React 18.2, Inertia.js, PostgreSQL 15, Redis 7, Tailwind CSS, Docker

## Development Commands

### Starting Development Environment

```bash
# Full development stack (server + queue + logs + vite)
composer dev

# Or manually with Docker
docker-compose up -d

# Individual services
php artisan serve              # Dev server on :8000
php artisan queue:listen       # Queue worker
php artisan pail              # Real-time logs
npm run dev                   # Vite dev server
```

### Testing

```bash
# Run all PHPUnit tests
composer test
# Or: php artisan test

# Run specific test file
php artisan test tests/Feature/ChatCacheTest.php

# Run specific test method
php artisan test --filter testChatCacheWorks

# E2E tests with Playwright
npm run test:e2e
```

### Database

```bash
# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh database with seeders
php artisan migrate:fresh --seed

# Create new migration
php artisan make:migration create_table_name
```

### Code Quality

```bash
# Laravel Pint (code formatting)
./vendor/bin/pint

# Run Pint on specific file
./vendor/bin/pint app/Services/RagService.php
```

### Cache Management

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Asset Building

```bash
# Development build with HMR
npm run dev

# Production build (minified, optimized)
npm run build
```

## Architecture

### Service Layer Pattern

The application uses a service layer for complex business logic. Key services in `app/Services/`:

- **RagService** - Core AI/RAG functionality for the chatbot. Handles document embeddings, semantic search, and LLM interactions with context retrieval.
- **ChatCacheService** - Caches chat responses to reduce AI API costs and improve response times.
- **ImageService** - Handles image processing, WebP conversion, and responsive image generation using Spatie Media Library.
- **DatabaseContentRagSyncService** - Syncs database content (posts, pages, etc.) to the RAG knowledge base.
- **ContentCreationService** - AI-powered content generation for admin features.
- **InputSanitizationService** - Sanitizes user input to prevent XSS attacks using HTMLPurifier.
- **EmbeddingService** - Generates text embeddings for semantic search.
- **GroqService** - Integration with Groq API for fast LLM inference.

### Controller Organization

- `app/Http/Controllers/Public/` - Public-facing pages (landing, news, gallery, etc.)
- `app/Http/Controllers/Admin/` - Admin panel controllers (CRUD operations)
- `app/Http/Controllers/Api/` - API endpoints (chatbot, etc.)

### Frontend Structure

React components in `resources/js/`:
- `Pages/` - Inertia.js page components (one per route)
- `Pages/Admin/` - Admin panel pages
- `Components/` - Reusable React components
- `Components/ui/` - UI primitives (buttons, modals, etc.)
- `Layouts/` - Layout components (AdminLayout, PublicLayout)

### Background Jobs

Queue jobs in `app/Jobs/`:
- **ProcessInstagramPost** - Processes scraped Instagram posts
- **ProcessRagDocument** - Processes documents for RAG indexing
- **RunInstagramScraperJob** - Runs Instagram scraper

Queue connection: Redis (production) or sync (local development)

### Inertia.js Pattern

This app uses Inertia.js for SPA-like experience without building an API:
- Controllers return `Inertia::render('PageName', $data)`
- React components receive props from Laravel
- Form submissions use Inertia's form helpers
- Route helper via Ziggy: `route('route.name')`

### Media Library

Uses Spatie Media Library for file uploads:
- Models use `HasMedia` trait and `registerMediaConversions()`
- Automatic WebP conversion with responsive sizes (mobile, tablet, desktop, large)
- Quality settings: 75 (default), 70 (large), 65 (thumb)
- Media stored in `storage/app/public/` with UUID-based directories

### AI/RAG System

The chatbot uses RAG (Retrieval Augmented Generation):
1. Documents are chunked and embedded (EmbeddingService)
2. User queries are embedded and matched against knowledge base (semantic search)
3. Relevant context is retrieved and passed to LLM (RagService)
4. Responses are cached (ChatCacheService)

AI configuration stored in `ai_settings` table and `.env`:
- `AI_MODEL_BASE_URL` - OpenAI-compatible API endpoint
- `AI_MODEL_API_KEY` - API key
- `OLLAMA_BASE_URL` - Local Ollama instance for embeddings

## Testing Approach

- **Feature tests** - Test HTTP endpoints, database interactions, and business logic
- **Unit tests** - Test individual service methods
- **E2E tests** - Playwright tests for critical user flows
- Tests use SQLite in-memory database (configured in `phpunit.xml`)
- Security tests cover XSS, CSRF, input sanitization, and CSP

## Docker Environment

Multiple compose files for different environments:
- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production configuration
- `docker-compose.storage.yml` - Separate storage service

Services:
- **app** - PHP-FPM application container
- **nginx** - Web server
- **db** - PostgreSQL database
- **redis** - Cache and session store
- **scheduler** - Cron jobs (Laravel scheduler)
- **queue** - Queue worker

## Important Patterns

### Security

- All user input is sanitized via `InputSanitizationService` before storage
- CSP (Content Security Policy) headers configured
- CSRF protection enabled on all forms
- Admin routes protected by authentication middleware

### Image Optimization

Recent focus on WebP optimization:
- Hero images use `<link rel="preload">` for LCP optimization
- Below-fold images use `loading="lazy"`
- WebP quality: 75 (default), 70 (large), 65 (thumb)
- Responsive srcset generated automatically

### Route Organization

Routes in `routes/web.php`:
- Public routes at root level
- Admin routes under `/admin` prefix with auth middleware
- API routes in `routes/api.php` (chatbot, health checks)

## Environment Variables

Key variables in `.env`:
- `APP_ENV` - Environment (local, production)
- `DB_CONNECTION=pgsql` - PostgreSQL database
- `REDIS_HOST` - Redis for cache/sessions
- `AI_MODEL_BASE_URL` - AI API endpoint
- `AI_MODEL_API_KEY` - AI API key
- `OLLAMA_BASE_URL` - Local Ollama instance

## Common Tasks

### Adding a New Public Page

1. Create controller in `app/Http/Controllers/Public/`
2. Create Inertia page component in `resources/js/Pages/`
3. Add route in `routes/web.php`
4. Add navigation link if needed

### Adding a New Admin Feature

1. Create model with migration
2. Create admin controller in `app/Http/Controllers/Admin/`
3. Create admin page in `resources/js/Pages/Admin/`
4. Add routes under `/admin` prefix with auth middleware
5. Add navigation item to admin sidebar

### Working with Media

Models that need file uploads:
1. Use `HasMedia` trait
2. Implement `registerMediaConversions()` for responsive images
3. Use `$model->addMedia($file)->toMediaCollection('collection-name')`
4. Access via `$model->getFirstMediaUrl('collection-name', 'conversion-name')`

### Modifying RAG Knowledge Base

1. Update content in database (posts, pages, etc.)
2. Run `DatabaseContentRagSyncService` to sync to RAG
3. Or manually process documents via `ProcessRagDocument` job
