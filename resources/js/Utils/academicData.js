// FILE: resources/js/Utils/academicData.js
// Academic data and metadata utilities

export const programStudyData = {
    mipa: {
        title: 'MIPA',
        subtitle: 'Matematika & Ilmu Pengetahuan Alam',
        description: 'Program Matematika dan Ilmu Pengetahuan Alam',
        gradient: 'from-blue-400 to-cyan-300',
        heroFallback: 'Membangun logika berpikir analitis dan pemahaman mendalam tentang alam semesta melalui penguasaan sains, teknologi, dan metode ilmiah.',
        defaultSubjectIcon: 'Calculator',
        defaultCareerIcon: 'Stethoscope',
        facilitiesFallback: { title: 'Fasilitas Riset & Praktikum', mainTitle: 'Laboratorium Kimia & Fisika' },
        careerFallback: { title: 'Membuka Jalan Menuju Karir Masa Depan' },
        seoKeywords: 'peminatan MIPA, IPA, matematika, fisika, kimia, biologi, jurusan IPA, SMAN 1 Baleendah',
    },
    ips: {
        title: 'IPS',
        subtitle: 'Ilmu Pengetahuan Sosial',
        description: 'Program Ilmu Pengetahuan Sosial',
        gradient: 'from-emerald-400 to-teal-300',
        heroFallback: 'Mempelajari dinamika masyarakat, ekonomi, dan sejarah untuk membentuk pemimpin masa depan yang peka terhadap isu sosial.',
        defaultSubjectIcon: 'Users',
        defaultCareerIcon: 'Briefcase',
        facilitiesFallback: { title: 'Fasilitas Penunjang', mainTitle: 'Perpustakaan & Ruang Diskusi' },
        careerFallback: { title: 'Membuka Jalan Menuju Karir Profesional' },
        seoKeywords: 'peminatan IPS, ekonomi, sosiologi, geografi, sejarah, jurusan IPS, SMAN 1 Baleendah',
    },
    bahasa: {
        title: 'Bahasa',
        subtitle: 'Bahasa & Ilmu Budaya',
        description: 'Program Bahasa',
        gradient: 'from-violet-400 to-purple-300',
        heroFallback: 'Mengeksplorasi kekayaan bahasa dan budaya dunia sebagai jembatan komunikasi global dan pelestarian kearifan lokal.',
        defaultSubjectIcon: 'BookOpen',
        defaultCareerIcon: 'Globe',
        facilitiesFallback: { title: 'Laboratorium Bahasa', mainTitle: 'Language Center' },
        careerFallback: { title: 'Membuka Jalan Menuju Karir Global' },
        seoKeywords: 'peminatan Bahasa, bahasa Indonesia, bahasa Inggris, sastra, linguistik, SMAN 1 Baleendah',
    },
};

export const getPageMetadata = (pageName, customMeta = {}) => {
    const defaultMeta = {
        title: 'SMAN 1 Baleendah',
        description: 'Website resmi SMAN 1 Baleendah',
        keywords: 'SMAN 1 Baleendah, SMA, Pendidikan',
    };

    const pageMeta = {
        kurikulum: {
            title: 'Kurikulum - SMAN 1 Baleendah',
            description: 'Kurikulum dan program pembelajaran SMAN 1 Baleendah',
            keywords: 'kurikulum, program pembelajaran, SMAN 1 Baleendah',
        },
        mipa: {
            title: 'Program MIPA - SMAN 1 Baleendah',
            description: 'Program Matematika dan Ilmu Pengetahuan Alam SMAN 1 Baleendah',
            keywords: 'MIPA, matematika, IPA, SMAN 1 Baleendah',
        },
        ips: {
            title: 'Program IPS - SMAN 1 Baleendah',
            description: 'Program Ilmu Pengetahuan Sosial SMAN 1 Baleendah',
            keywords: 'IPS, sosial, SMAN 1 Baleendah',
        },
        bahasa: {
            title: 'Program Bahasa - SMAN 1 Baleendah',
            description: 'Program Bahasa SMAN 1 Baleendah',
            keywords: 'bahasa, linguistik, SMAN 1 Baleendah',
        },
        ekstrakurikuler: {
            title: 'Ekstrakurikuler - SMAN 1 Baleendah',
            description: 'Kegiatan ekstrakurikuler SMAN 1 Baleendah',
            keywords: 'ekstrakurikuler, kegiatan, SMAN 1 Baleendah',
        },
    };

    return {
        ...defaultMeta,
        ...pageMeta,
        ...(pageMeta[pageName] || {}),
        ...customMeta,
    };
};
