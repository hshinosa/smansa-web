<?php

use App\Http\Middleware\CookieSecurity;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\InputSanitization;
use App\Http\Middleware\LogRequest;
use App\Http\Middleware\PerformanceOptimization;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            InputSanitization::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            SecurityHeaders::class,
            CookieSecurity::class,
            PerformanceOptimization::class,
            LogRequest::class,
        ]);

        // Exclude API routes and health check from CSRF protection
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'health',
        ]);

        $middleware->statefulApi();

        // Trust all proxies (Cloudflare, Nginx, etc.)
        $middleware->trustProxies(at: '*', headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PROTO);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Prevent information disclosure in production
        $exceptions->render(function (Throwable $e, $request) {
            // Let custom exceptions handle their own rendering
            if (method_exists($e, 'render')) {
                return $e->render($request);
            }

            // For production: hide sensitive error details
            if (! config('app.debug')) {
                $statusCode = method_exists($e, 'getStatusCode')
                    ? $e->getStatusCode()
                    : 500;

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'error' => [
                            'code' => 'SERVER_ERROR',
                            'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
                        ],
                    ], $statusCode);
                }

                // For web requests - avoid redirect loops by using Inertia error page
                // redirect()->back() with no Referer causes infinite loops
                if ($request->hasHeader('X-Inertia')) {
                    return redirect()->back()->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
                }

                return response('Terjadi kesalahan pada server. Silakan coba lagi.', $statusCode);
            }

            // In development: let Laravel show detailed errors
            return null;
        });
    })->create();
