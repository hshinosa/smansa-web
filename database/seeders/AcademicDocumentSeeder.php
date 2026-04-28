<?php

namespace Database\Seeders;

use App\Models\AcademicDocument;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class AcademicDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            [
                'title' => 'Data Serapan PTN 2024',
                'slug' => 'data-serapan-ptn-2024',
                'category' => 'Serapan PTN',
                'year' => 2024,
                'description' => 'Data penerimaan siswa SMAN 1 Baleendah di berbagai PTN tahun 2024',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Hasil TKA Semester Ganjil 2024',
                'slug' => 'hasil-tka-semester-ganjil-2024',
                'category' => 'Hasil TKA',
                'year' => 2024,
                'description' => 'Hasil Tes Kemampuan Akademik semester ganjil tahun ajaran 2024/2025',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Prestasi Akademik 2023',
                'slug' => 'prestasi-akademik-2023',
                'category' => 'Prestasi Akademik',
                'year' => 2023,
                'description' => 'Ringkasan prestasi akademik siswa SMAN 1 Baleendah tahun 2023',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        $pdfContent = '%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 150
>>
stream
BT
/F1 24 Tf
100 700 Td
(DOKUMEN PRESTASI AKADEMIK) Tj
0 -30 Td
/F1 12 Tf
(SMAN 1 Baleendah) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000315 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
515
%%EOF';

        foreach ($documents as $docData) {
            $doc = AcademicDocument::create($docData);

            $tempPath = storage_path('app/temp_'.$doc->slug.'.pdf');
            File::put($tempPath, $pdfContent);

            $doc->addMedia($tempPath)
                ->usingFileName($doc->slug.'.pdf')
                ->toMediaCollection('documents');

            File::delete($tempPath);

            $this->command->info("Created: {$doc->title}");
        }

        $this->command->info('Academic documents seeded successfully!');
    }
}
