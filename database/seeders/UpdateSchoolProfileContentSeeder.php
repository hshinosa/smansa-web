<?php

namespace Database\Seeders;

use App\Models\SchoolProfileSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class UpdateSchoolProfileContentSeeder extends Seeder
{
    public function run()
    {
        $fotoGuruPath = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/FOTO GURU');

        // 1. HERO HISTORY
        $hero = SchoolProfileSetting::updateOrCreate(
            ['section_key' => 'hero_history'],
            ['content' => json_encode([
                'title' => 'Profil & Sejarah SMAN 1 Baleendah',
                'image_url' => '/images/hero-bg-sman1baleendah.jpeg',
            ])]
        );

        // Migrate Hero Image
        $heroBgPath = $fotoGuruPath.DIRECTORY_SEPARATOR.'SMANSA.jpeg';
        if (File::exists($heroBgPath)) {
            $hero->clearMediaCollection('hero_history_bg');
            $hero->addMedia($heroBgPath)
                ->preservingOriginal()
                ->toMediaCollection('hero_history_bg');
        }

        // 2. HISTORY TIMELINE
        SchoolProfileSetting::updateOrCreate(
            ['section_key' => 'history'],
            ['content' => json_encode([
                'title' => 'Jejak Langkah Kami',
                'description_html' => '<p>Perjalanan panjang SMAN 1 Baleendah dalam mencerdaskan kehidupan bangsa dimulai sejak tahun 1975.</p>',
                'timeline' => [
                    [
                        'year' => '1975',
                        'title' => 'Awal Pendirian',
                        'description' => 'Berdiri sebagai sekolah filial (kelas jauh) untuk memenuhi kebutuhan pendidikan di wilayah Baleendah.',
                        'side' => 'left',
                    ],
                    [
                        'year' => '1980',
                        'title' => 'Penegerian',
                        'description' => 'Resmi berdiri sendiri sebagai SMAN 1 Baleendah dengan SK Menteri Pendidikan, menandai era baru kemandirian.',
                        'side' => 'right',
                    ],
                    [
                        'year' => '2010',
                        'title' => 'Pengembangan Fasilitas',
                        'description' => 'Revitalisasi gedung utama dan pembangunan Masjid sekolah sebagai pusat pembentukan karakter siswa.',
                        'side' => 'left',
                    ],
                    [
                        'year' => 'Sekarang',
                        'title' => 'Era Prestasi',
                        'description' => 'Menjadi Sekolah Penggerak dan meraih predikat Sekolah Adiwiyata Tingkat Provinsi/Nasional.',
                        'side' => 'right',
                    ],
                ],
            ])]
        );

        // 3. FACILITIES - 16 items with distinct images from EKSKUL & ORGANISASI
        $facilities = SchoolProfileSetting::updateOrCreate(
            ['section_key' => 'facilities'],
            ['content' => json_encode([
                'title' => 'Lingkungan Belajar Modern',
                'description' => 'Fasilitas lengkap yang mendukung pengembangan akademik dan karakter siswa.',
                'items' => [
                    ['name' => 'Lab Komputer', 'description' => 'Laboratorium komputer modern dengan perangkat terbaru untuk mendukung pembelajaran teknologi informasi.'],
                    ['name' => 'Perpustakaan', 'description' => 'Perpustakaan lengkap dengan koleksi buku akademik dan non-akademik yang mendukung budaya literasi.'],
                    ['name' => 'Masjid Sekolah', 'description' => 'Masjid yang nyaman sebagai pusat kegiatan keagamaan dan pembentukan karakter siswa.'],
                    ['name' => 'Lapangan Olahraga', 'description' => 'Lapangan olahraga luas untuk berbagai kegiatan jasmani dan ekstrakurikuler.'],
                    ['name' => 'Ruang Kelas Modern', 'description' => 'Ruang kelas ber-AC dengan fasilitas multimedia untuk proses belajar mengajar yang efektif.'],
                    ['name' => 'Laboratorium IPA', 'description' => 'Lab sains lengkap untuk praktikum Fisika, Kimia, dan Biologi.'],
                    ['name' => 'Laboratorium Bahasa', 'description' => 'Lab bahasa multimedia untuk pengembangan kemampuan berbahasa siswa.'],
                    ['name' => 'Ruang Kepala Sekolah', 'description' => 'Ruang pimpinan yang representatif untuk administrasi dan pertemuan.'],
                    ['name' => 'Ruang Guru', 'description' => 'Ruang kerja guru yang nyaman untuk persiapan mengajar dan diskusi.'],
                    ['name' => 'Kantin Sekolah', 'description' => 'Kantin sehat dengan pilihan makanan berguna untuk siswa.'],
                    ['name' => 'UKS', 'description' => 'Unit Kesehatan Sekolah untuk pelayanan kesehatan siswa dan warga sekolah.'],
                    ['name' => 'Aula Serbaguna', 'description' => 'Aula untuk berbagai kegiatan seperti upacara, seminar, dan pertemuan besar.'],
                    ['name' => 'Ruang OSIS', 'description' => 'Ruang kegiatan organisasi siswa untuk pengembangan kepemimpinan.'],
                    ['name' => 'Taman Sekolah', 'description' => 'Area hijau yang asri untuk menciptakan lingkungan belajar yang nyaman.'],
                    ['name' => 'Parkir Luas', 'description' => 'Area parkir yang memadai untuk kendaraan siswa, guru, dan tamu.'],
                    ['name' => 'Ruang BK', 'description' => 'Ruang Bimbingan Konseling untuk layanan psikologis dan akademik siswa.'],
                ],
            ])]
        );

        // Attach distinct images from EKSKUL & ORGANISASI folder
        $ekskulPath = base_path('data_smansa/SMAN 1 BALEENDAH - 2026/EKSKUL & ORGANISASI');
        $imageFiles = File::glob($ekskulPath . '/*.jpg');
        sort($imageFiles); // Deterministic ordering

        // Take first 16 images for facilities
        $facilityImages = array_slice($imageFiles, 0, 16);

        foreach ($facilityImages as $index => $imagePath) {
            if (File::exists($imagePath)) {
                $collectionName = "facilities_item_{$index}";
                $facilities->clearMediaCollection($collectionName);
                $facilities->addMedia($imagePath)->preservingOriginal()->toMediaCollection($collectionName);
            }
        }
    }
}
