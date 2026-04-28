<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AcademicDocument;
use App\Models\LandingPageSetting;
use App\Services\ImageService;
use Inertia\Inertia;

class PrestasiController extends Controller
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        $documents = AcademicDocument::with('media')
            ->active()
            ->ordered()
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'title' => $doc->title,
                    'slug' => $doc->slug,
                    'category' => $doc->category,
                    'year' => $doc->year,
                    'description' => $doc->description,
                    'pdf_url' => $doc->pdf_url,
                ];
            });

        $heroSetting = LandingPageSetting::where('section_key', 'hero')->with('media')->first();
        $heroContent = [];

        if ($heroSetting) {
            $content = $heroSetting->content ?? [];
            if (is_string($content)) {
                $content = json_decode($content, true) ?? [];
            }
            
            $heroContent = $content;
            
            try {
                $bgMedia = $this->imageService->getFirstMediaData($heroSetting, 'hero_background');
                if ($bgMedia) {
                    $heroContent['backgroundImage'] = $bgMedia;
                    $heroContent['background_image_url'] = $bgMedia['url'] ?? null;
                }
            } catch (\Exception $e) {
                // Ignore media errors
            }
        }

        return Inertia::render('PrestasiAkademikPage', [
            'documents' => $documents,
            'heroContent' => $heroContent,
        ]);
    }
}

