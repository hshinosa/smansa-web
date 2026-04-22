<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class PopulateGalleriesSeeder extends Seeder
{
    public function run()
    {
        $ekskulFolder = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/EKSKUL & ORGANISASI');

        // Clear existing data
        Gallery::truncate();

        $galleryData = [
            'Upacara Bendera Hari Senin',
            'Kegiatan Belajar di Kelas',
            'Praktikum Laboratorium Komputer',
            'Suasana Perpustakaan Sekolah',
            'Latihan Ekstrakurikuler Basket',
            'Pentas Seni Siswa',
            'Praktikum Laboratorium IPA',
            'Rapat Koordinasi OSIS',
            'Fasilitas Lapangan Olahraga',
            'Kegiatan Kepramukaan',
            'Wisuda Angkatan 2024',
            'Kelas Bahasa Asing',
        ];

        if (! File::isDirectory($ekskulFolder)) {
            $this->command->error("Source folder not found: {$ekskulFolder}");

            return;
        }

        $images = File::glob($ekskulFolder.'/*.jpg');
        if (empty($images)) {
            $this->command->warn('No images found in data_smansa EKSKUL folder');

            return;
        }

        $imageIndex = 0;
        foreach ($galleryData as $title) {
            if ($imageIndex >= count($images)) {
                $imageIndex = 0;
            }

            $sourcePath = $images[$imageIndex];

            $gallery = Gallery::create([
                'title' => $title,
                'description' => "Dokumentasi kegiatan {$title} di SMAN 1 Baleendah.",
                'type' => 'photo',
                'category' => 'Kegiatan',
                'is_featured' => true,
                'url' => 'temp',
            ]);

            if (File::exists($sourcePath)) {
                $gallery->addMedia($sourcePath)
                    ->preservingOriginal()
                    ->toMediaCollection('images');

                $media = $gallery->getFirstMedia('images');
                if ($media) {
                    $gallery->update(['url' => $media->getUrl()]);
                }

                $this->command->info("Created gallery: {$title}");
            }

            $imageIndex++;
        }

        $this->command->info('Galleries populated with '.count($galleryData).' items.');
    }
}
