<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class BetterFixGalleryImagesSeeder extends Seeder
{
    public function run(): void
    {
        $galleries = Gallery::all();
        $ekskulPath = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/EKSKUL & ORGANISASI');
        $fotoGuruPath = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/FOTO GURU');

        $availableImages = File::glob($ekskulPath.'/*.{jpg,jpeg,JPG,JPEG}', GLOB_BRACE);
        $imageIndex = 0;

        foreach ($galleries as $gallery) {
            if (empty($availableImages)) {
                $this->command->warn('No images found in EKSKUL folder');
                break;
            }

            $sourcePath = $availableImages[$imageIndex % count($availableImages)];
            $imageIndex++;

            if (File::exists($sourcePath)) {
                $this->command->info("Migrating Gallery: {$gallery->title} -> ".basename($sourcePath));

                $gallery->clearMediaCollection('images');

                $gallery->addMedia($sourcePath)
                    ->preservingOriginal()
                    ->toMediaCollection('images');

                $gallery->save();
            }
        }
    }
}
