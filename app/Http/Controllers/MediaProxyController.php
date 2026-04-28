<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaProxyController extends Controller
{
    public function show(string $path): BinaryFileResponse
    {
        $path = trim($path, '/');
        if (str_contains($path, '..')) {
            abort(404);
        }

        $fullPath = storage_path('app/public/'.$path);

        if (! file_exists($fullPath)) {
            abort(404);
        }

        $response = response()->file($fullPath);
        
        if (str_ends_with(strtolower($path), '.pdf')) {
            $response->headers->set('Content-Disposition', 'inline; filename="'.basename($path).'"');
        }
        
        return $response;
    }
}
