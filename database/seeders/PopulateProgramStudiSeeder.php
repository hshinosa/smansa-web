<?php

namespace Database\Seeders;

use App\Models\ProgramStudiSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class PopulateProgramStudiSeeder extends Seeder
{
    public function run()
    {
        $programs = ['mipa', 'ips', 'bahasa'];

        foreach ($programs as $programName) {
            $this->seedProgram($programName);
        }
    }

    private function seedProgram($programName)
    {
        $data = $this->getDataForProgram($programName);

        foreach ($data as $sectionKey => $content) {
            // Create or Update Setting
            $setting = ProgramStudiSetting::updateOrCreate(
                [
                    'program_name' => $programName,
                    'section_key' => $sectionKey,
                ],
                ['content' => $content]
            );

            // Handle Media Attachments
            $this->attachMedia($setting, $sectionKey, $content);
        }

        $this->command->info("Program Studi {$programName} populated.");
    }

    private function attachMedia($setting, $sectionKey, $content)
    {
        $imagePath = null;
        $collection = null;
        $smansaPath = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/FOTO GURU/SMANSA.jpeg');
        $programThumbnailPaths = [
            'mipa' => base_path('data_smansa/SERAGAM SEKOLAH SMAN 1 BALEENDAH/IMG_2473.png'),
            'ips' => base_path('data_smansa/SERAGAM SEKOLAH SMAN 1 BALEENDAH/IMG_2519.png'),
            'bahasa' => base_path('data_smansa/SERAGAM SEKOLAH SMAN 1 BALEENDAH/IMG_2526.png'),
        ];

        if ($sectionKey === 'hero') {
            $imagePath = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/FOTO GURU/SMANSA.jpeg');
            $collection = 'hero_background_image';

            // Also attach thumbnail_card (Student photo)
            $thumbnailPath = $programThumbnailPaths[$setting->program_name] ?? null;
            if ($thumbnailPath && File::exists($thumbnailPath)) {
                $setting->clearMediaCollection('thumbnail_card');
                $setting->addMedia($thumbnailPath)
                    ->preservingOriginal()
                    ->toMediaCollection('thumbnail_card');
            }
        } elseif ($sectionKey === 'facilities') {
            // Main Facility Image - USE SMANSA.jpeg
            $imagePath = $smansaPath;
            $collection = 'facilities_main_image';

            // Attach nested item images - USE SMANSA.jpeg
            if (isset($content['items']) && is_array($content['items'])) {
                foreach ($content['items'] as $index => $item) {
                    if (File::exists($smansaPath)) {
                        $itemCollection = "facilities_item_{$index}_image";
                        $setting->clearMediaCollection($itemCollection);
                        $setting->addMedia($smansaPath)
                            ->preservingOriginal()
                            ->toMediaCollection($itemCollection);
                    }
                }
            }
        }

        if ($imagePath && $collection && File::exists($imagePath)) {
            $setting->clearMediaCollection($collection);
            $setting->addMedia($imagePath)
                ->preservingOriginal()
                ->toMediaCollection($collection);
        }
    }

    private function getDataForProgram($programName)
    {
        switch ($programName) {
            case 'mipa':
                return [
                    'hero' => [
                        'title' => 'Matematika & Ilmu Pengetahuan Alam',
                        'description' => 'Membangun logika berpikir analitis dan pemahaman mendalam tentang alam semesta. Mempersiapkan saintis masa depan yang inovatif.',
                    ],
                    'core_subjects' => [
                        'title' => 'Mata Pelajaran Peminatan',
                        'description' => 'Kurikulum mendalam dengan fokus pada penguatan sains dan teknologi.',
                        'items' => [
                            ['title' => 'Matematika Peminatan', 'description' => 'Kalkulus, Trigonometri, dan Aljabar Lanjut untuk membangun logika berpikir tingkat tinggi.', 'icon_name' => 'Calculator'],
                            ['title' => 'Fisika', 'description' => 'Mekanika, Termodinamika, dan Fisika Modern sebagai dasar pemahaman fenomena alam.', 'icon_name' => 'Atom'],
                            ['title' => 'Kimia', 'description' => 'Kimia Organik, Stoikiometri, dan Larutan untuk memahami komposisi dan reaksi materi.', 'icon_name' => 'FlaskConical'],
                            ['title' => 'Biologi', 'description' => 'Genetika, Ekologi, dan Anatomi Fisiologi untuk memahami kehidupan dan organisme.', 'icon_name' => 'Dna'],
                        ],
                    ],
                    'facilities' => [
                        'title' => 'Fasilitas Riset & Praktikum',
                        'description' => 'Laboratorium lengkap berstandar nasional untuk mendukung praktikum siswa.',
                        'main_title' => 'Laboratorium Terpadu',
                        'main_description' => 'Pusat praktikum Fisika, Kimia, dan Biologi dengan peralatan modern untuk eksperimen ilmiah.',
                        'items' => [
                            ['title' => 'Laboratorium Komputer & CBT'],
                            ['title' => 'Green House & Apotek Hidup'],
                            ['title' => 'Teleskop Astronomi'],
                            ['title' => 'Perpustakaan Digital Sains'],
                        ],
                    ],
                    'career_paths' => [
                        'title' => 'Prospek Masa Depan',
                        'description' => 'Lulusan MIPA memiliki peluang luas di bidang sains, teknik, dan kesehatan.',
                        'items' => [
                            ['title' => 'Kedokteran & Kesehatan', 'description' => 'Dokter, Apoteker, Ahli Gizi, dan tenaga medis profesional.', 'icon_name' => 'Stethoscope'],
                            ['title' => 'Teknik & Rekayasa', 'description' => 'Teknik Sipil, Industri, Elektro, dan Informatika.', 'icon_name' => 'HardHat'],
                            ['title' => 'Sains Murni', 'description' => 'Peneliti, Ahli Biologi, Kimiawan, dan Fisikawan.', 'icon_name' => 'Microscope'],
                            ['title' => 'Teknologi Informasi', 'description' => 'Data Scientist, Software Engineer, dan AI Specialist.', 'icon_name' => 'Cpu'],
                        ],
                    ],
                ];

            case 'ips':
                return [
                    'hero' => [
                        'title' => 'Ilmu Pengetahuan Sosial',
                        'description' => 'Mempelajari dinamika masyarakat, ekonomi, dan sejarah. Membentuk pemimpin masa depan yang peka terhadap isu sosial.',
                    ],
                    'core_subjects' => [
                        'title' => 'Mata Pelajaran Peminatan',
                        'description' => 'Fokus pada pemahaman fenomena sosial dan interaksi antar manusia.',
                        'items' => [
                            ['title' => 'Ekonomi', 'description' => 'Akuntansi, Manajemen, dan Teori Ekonomi untuk memahami dinamika pasar.', 'icon_name' => 'TrendingUp'],
                            ['title' => 'Sosiologi', 'description' => 'Interaksi Sosial, Konflik, dan Perubahan Masyarakat secara mendalam.', 'icon_name' => 'Users'],
                            ['title' => 'Geografi', 'description' => 'Pemetaan, Lingkungan Hidup, dan Kependudukan dalam konteks global.', 'icon_name' => 'Globe'],
                            ['title' => 'Sejarah Peminatan', 'description' => 'Sejarah Dunia dan Pergerakan Nasional untuk memahami masa lalu.', 'icon_name' => 'BookOpen'],
                        ],
                    ],
                    'facilities' => [
                        'title' => 'Fasilitas Penunjang',
                        'description' => 'Ruang belajar interaktif untuk diskusi dan simulasi sosial.',
                        'main_title' => 'Ruang Multimedia Sosial',
                        'main_description' => 'Dilengkapi proyektor dan sound system untuk pemutaran dokumenter sejarah dan simulasi sidang PBB.',
                        'items' => [
                            ['title' => 'Laboratorium IPS & Peta'],
                            ['title' => 'Corner Bursa Efek Mini'],
                            ['title' => 'Studio Podcast Sosial'],
                            ['title' => 'Ruang Diskusi & Debat'],
                        ],
                    ],
                    'career_paths' => [
                        'title' => 'Prospek Karir',
                        'description' => 'Membuka jalan menuju karir di bidang bisnis, hukum, dan pemerintahan.',
                        'items' => [
                            ['title' => 'Ekonomi & Bisnis', 'description' => 'Akuntan, Manajer, Entrepreneur, dan Analis Keuangan.', 'icon_name' => 'Briefcase'],
                            ['title' => 'Hukum & Politik', 'description' => 'Pengacara, Diplomat, Politisi, dan Analis Kebijakan.', 'icon_name' => 'Scale'],
                            ['title' => 'Media & Komunikasi', 'description' => 'Jurnalis, Public Relations, dan Content Strategist.', 'icon_name' => 'Newspaper'],
                            ['title' => 'Psikologi & Sosial', 'description' => 'Psikolog, Peneliti Sosial, dan Konsultan SDM.', 'icon_name' => 'Brain'],
                        ],
                    ],
                ];

            case 'bahasa':
                return [
                    'hero' => [
                        'title' => 'Bahasa & Budaya',
                        'description' => 'Mengeksplorasi kekayaan bahasa dan budaya dunia. Jembatan komunikasi global dan pelestarian kearifan lokal.',
                    ],
                    'core_subjects' => [
                        'title' => 'Mata Pelajaran Peminatan',
                        'description' => 'Penguasaan bahasa asing dan pemahaman lintas budaya.',
                        'items' => [
                            ['title' => 'Bahasa & Sastra Inggris', 'description' => 'Literature, Academic Writing, dan TOEFL Preparation untuk komunikasi global.', 'icon_name' => 'Languages'],
                            ['title' => 'Bahasa & Sastra Indonesia', 'description' => 'Kajian Prosa, Puisi, dan Jurnalistik untuk memperkuat literasi nasional.', 'icon_name' => 'BookOpen'],
                            ['title' => 'Bahasa Asing Pilihan', 'description' => 'Bahasa Jepang, Jerman, atau Perancis sebagai bekal karir internasional.', 'icon_name' => 'Globe'],
                            ['title' => 'Antropologi', 'description' => 'Kajian Budaya dan Etnografi untuk memahami keragaman peradaban manusia.', 'icon_name' => 'Landmark'],
                        ],
                    ],
                    'facilities' => [
                        'title' => 'Laboratorium Bahasa',
                        'description' => 'Sarana modern untuk melatih kemampuan menyimak dan berbicara.',
                        'main_title' => 'Language Center',
                        'main_description' => 'Laboratorium bahasa multimedia dengan headset dan software interaktif untuk latihan listening dan speaking.',
                        'items' => [
                            ['title' => 'Pojok Literasi & Budaya'],
                            ['title' => 'Panggung Teater Mini'],
                            ['title' => 'Studio Rekaman Bahasa'],
                            ['title' => 'Koleksi Sastra Perpustakaan'],
                        ],
                    ],
                    'career_paths' => [
                        'title' => 'Peluang Global',
                        'description' => 'Keahlian bahasa membuka pintu karir internasional.',
                        'items' => [
                            ['title' => 'Komunikasi & Media', 'description' => 'Penerjemah, Content Writer, Editor, dan Jurnalis Internasional.', 'icon_name' => 'Newspaper'],
                            ['title' => 'Pariwisata & Hospitaliti', 'description' => 'Tour Guide, Staff Hotel Internasional, dan Event Organizer.', 'icon_name' => 'Plane'],
                            ['title' => 'Hubungan Internasional', 'description' => 'Diplomat, Staff NGO, dan Konsultan Lintas Budaya.', 'icon_name' => 'Globe'],
                            ['title' => 'Seni & Kreatif', 'description' => 'Penulis Skenario, Kurator Seni, dan Desainer Konten.', 'icon_name' => 'Palette'],
                        ],
                    ],
                ];

            default:
                return [];
        }
    }
}
