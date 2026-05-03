<?php

namespace Database\Seeders;

use App\Models\AcademicDocument;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class PopulatePrestasiDocumentsSeeder extends Seeder
{
    public function run(): void
    {
        $sourceFolder = base_path('data_smansa/PRESTASI');

        if (! File::isDirectory($sourceFolder)) {
            $this->command->error("Source folder not found: {$sourceFolder}");

            return;
        }

        $files = collect(File::glob($sourceFolder.'/*.pdf'))
            ->sort()
            ->values();

        if ($files->isEmpty()) {
            $this->command->error('No PDF files found in prestasi source folder');

            return;
        }

        AcademicDocument::with('media')->get()->each(function (AcademicDocument $document) {
            $document->clearMediaCollection('documents');
            $document->delete();
        });

        foreach ($files as $index => $filePath) {
            $fileName = pathinfo($filePath, PATHINFO_FILENAME);
            $normalized = preg_replace('/\s+/', ' ', str_replace('_', ' ', $fileName));
            $title = Str::title(Str::lower($normalized));
            $title = preg_replace('/\bPts\b/', 'PTS', $title);
            $title = preg_replace('/\bSnbp\b/', 'SNBP', $title);
            $title = preg_replace('/\bSnbt\b/', 'SNBT', $title);

            preg_match('/(20\d{2})/', $title, $yearMatch);
            $year = isset($yearMatch[1]) ? (int) $yearMatch[1] : now()->year;

            $category = match (true) {
                stripos($title, 'SNBP') !== false => 'SNBP',
                stripos($title, 'SNBT') !== false => 'SNBT',
                stripos($title, 'PTS') !== false => 'PTS',
                default => 'Prestasi Akademik',
            };

            $document = AcademicDocument::create([
                'title' => $title,
                'slug' => Str::slug($title),
                'category' => $category,
                'year' => $year,
                'description' => "Dokumen {$title} SMAN 1 Baleendah.",
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            $document->addMedia($filePath)
                ->preservingOriginal()
                ->toMediaCollection('documents');

            $this->command->info("Seeded {$title}");
        }

        $this->command->info('Prestasi documents seeded successfully.');
    }
}
