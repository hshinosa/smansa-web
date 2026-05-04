<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Post;
use App\Services\ImageService;
use Inertia\Inertia;

/**
 * Controller for public gallery page
 * Refactored from routes/web.php closure
 */
class GaleriController extends Controller
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Display the gallery page
     */
    public function index()
    {
        $manualGalleries = Gallery::with('media')
            ->latest()
            ->get()
            ->map(function ($gallery) {
                $data = $gallery->toArray();
                $media = $this->imageService->getFirstMediaData($gallery, 'images');
                if ($media) {
                    $data['image'] = $media;
                }

                $data['sourceType'] = 'gallery';

                return $data;
            });

        $kegiatanPosts = Post::with(['media'])
            ->where('status', 'published')
            ->where('published_at', '<=', now())
            ->whereRaw('LOWER(category) = ?', ['kegiatan'])
            ->latest('published_at')
            ->get()
            ->map(function ($post) {
                return $this->imageService->transformKegiatanPostToGalleryItem($post);
            })
            ->filter()
            ->values();

        $galleries = $manualGalleries
            ->concat($kegiatanPosts)
            ->sortByDesc(function ($item) {
                return $item['date'] ?? $item['created_at'] ?? null;
            })
            ->values();
        
        return Inertia::render('GaleriPage', [
            'galleries' => $galleries
        ]);
    }
}
