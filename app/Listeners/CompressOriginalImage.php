<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Log;
use Intervention\Image\Facades\Image;
use Spatie\MediaLibrary\MediaCollections\Events\MediaHasBeenAdded;

/**
 * Compress original uploaded images to reduce storage usage
 * while maintaining fallback compatibility for older browsers
 */
class CompressOriginalImage
{
    public function handle(MediaHasBeenAdded $event): void
    {
        $media = $event->media;

        if (! str_starts_with($media->mime_type, 'image/')) {
            return;
        }

        if ($media->mime_type === 'image/webp') {
            return;
        }

        try {
            $path = $media->getPath();

            if (! file_exists($path) || ! is_readable($path)) {
                Log::warning('[CompressOriginal] File not accessible', [
                    'media_id' => $media->id,
                    'path' => $path,
                ]);

                return;
            }

            $originalSize = filesize($path);

            if ($originalSize < 200 * 1024) {
                Log::info('[CompressOriginal] File already small, skipping', [
                    'media_id' => $media->id,
                    'size' => $originalSize,
                ]);

                return;
            }

            $image = Image::make($path);
            $width = $image->width();
            $height = $image->height();

            $quality = match (true) {
                $originalSize > 2 * 1024 * 1024 => 70,
                $originalSize > 1 * 1024 * 1024 => 75,
                default => 80,
            };

            $maxDimension = 2000;
            if ($width > $maxDimension || $height > $maxDimension) {
                if ($width > $height) {
                    $image->resize($maxDimension, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    });
                } else {
                    $image->resize(null, $maxDimension, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    });
                }
            }

            $image->save($path, $quality);

            $newSize = filesize($path);
            $savedBytes = $originalSize - $newSize;
            $savedPercent = round(($savedBytes / $originalSize) * 100, 1);

            Log::info('[CompressOriginal] Compression successful', [
                'media_id' => $media->id,
                'original_size' => $originalSize,
                'new_size' => $newSize,
                'saved_bytes' => $savedBytes,
                'saved_percent' => $savedPercent,
                'quality' => $quality,
            ]);

            $media->size = $newSize;
            $media->save();

            unset($image);
            gc_collect_cycles();

        } catch (\Exception $e) {
            Log::error('[CompressOriginal] Compression failed', [
                'media_id' => $media->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
