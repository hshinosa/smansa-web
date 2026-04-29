import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen, Calculator, Microscope, FlaskConical, Atom, Dna, Globe,
    Languages, Palette, Music, Activity, Code, Brain, TrendingUp,
    Scale, Users, Landmark, Briefcase, Stethoscope, GraduationCap,
    Building, Cpu, Newspaper, HardHat, Plane, ImageIcon
} from 'lucide-react';

import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import SEOHead from '@/Components/SEOHead';
import ResponsiveImage, { HeroImage } from '@/Components/ResponsiveImage';
import { TYPOGRAPHY } from '@/Utils/typography';
import { getNavigationData } from '@/Utils/navigationData';
import { programStudyData, getPageMetadata } from '@/Utils/academicData';

const iconMap = {
    BookOpen, Calculator, Microscope, FlaskConical, Atom, Dna, Globe,
    Languages, Palette, Music, Activity, Code, Brain, TrendingUp,
    Scale, Users, Landmark, Briefcase, Stethoscope, GraduationCap,
    Building, Cpu, Newspaper, HardHat, Plane,
};

const formatImagePath = (path) => {
    if (!path) return null;
    if (typeof path !== 'string') return null;
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
};

export default function ProgramStudiPage({ content, programName }) {
    const { siteSettings } = usePage().props;
    const siteName = siteSettings?.general?.site_name || 'SMAN 1 Baleendah';
    const globalHeroImage = siteSettings?.general?.hero_image || '/images/hero-bg-sman1baleendah.jpeg';
    const navigationData = getNavigationData(siteSettings);
    const pageMetadata = getPageMetadata(siteName);

    const programData = programStudyData[programName] || programStudyData.mipa;
    const { hero, core_subjects, facilities, career_paths } = content || {};

    // Use hero background from controller (program-specific) or fall back to global
    const heroBackgroundSrc = hero?.background_image?.original_url
        || (typeof hero?.background_image === 'string' ? formatImagePath(hero.background_image) : null)
        || formatImagePath(globalHeroImage);

    const DefaultSubjectIcon = iconMap[programData.defaultSubjectIcon] || Calculator;
    const DefaultCareerIcon = iconMap[programData.defaultCareerIcon] || Stethoscope;

    return (
        <div className="bg-white font-sans text-gray-800">
            <SEOHead
                title={hero?.title || pageMetadata?.[programName]?.title}
                description={hero?.description || pageMetadata?.[programName]?.description}
                keywords={programData.seoKeywords}
                image={heroBackgroundSrc}
            />

            <Navbar
                logoSman1={navigationData.logoSman1}
                profilLinks={navigationData.profilLinks}
                akademikLinks={navigationData.akademikLinks}
                programStudiLinks={navigationData.programStudiLinks}
            />

            <main id="main-content" className="pt-20" tabIndex="-1">

            {/* HERO */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <HeroImage src={heroBackgroundSrc} alt={programData.subtitle} />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className={`${TYPOGRAPHY.heroTitle} mb-4 drop-shadow-lg`}>
                        Program Studi <span className={`text-transparent bg-clip-text bg-gradient-to-r ${programData.gradient}`}>{programData.subtitle}</span>
                    </h1>
                    <p className={`${TYPOGRAPHY.heroText} max-w-2xl mx-auto opacity-90`}>
                        {hero?.description || programData.heroFallback}
                    </p>
                </div>
            </section>

            {/* CORE SUBJECTS */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>
                            {core_subjects?.title || "Mata Pelajaran"} <span className="text-primary">Inti</span>
                        </h2>
                        <p className={TYPOGRAPHY.bodyText}>
                            {core_subjects?.description || "Kurikulum mendalam yang dirancang untuk membangun fondasi pengetahuan dan keterampilan."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {core_subjects?.items?.length > 0 ? (
                            core_subjects.items.map((item, idx) => {
                                const IconComponent = iconMap[item.icon_name] || DefaultSubjectIcon;
                                return (
                                    <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6" aria-hidden="true">
                                            <IconComponent className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <ImageIcon className="w-12 h-12 text-gray-300 mb-4" aria-hidden="true" />
                                <p className="text-gray-500 font-medium">Belum ada data mata pelajaran</p>
                                <p className="text-sm text-gray-400 mt-1">Data akan ditambahkan melalui panel admin</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* FACILITIES */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>
                            {facilities?.title || programData.facilitiesFallback.title}
                        </h2>
                        {facilities?.description && (
                            <p className={`${TYPOGRAPHY.bodyText} max-w-3xl`}>{facilities.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
                        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-sm h-[300px] sm:h-[400px] lg:h-full">
                            <ResponsiveImage
                                media={typeof facilities?.main_image === 'object' ? facilities.main_image : null}
                                src={typeof facilities?.main_image === 'string' ? formatImagePath(facilities.main_image) : null}
                                alt={facilities?.main_title || programData.facilitiesFallback.mainTitle}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
                                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-3 inline-block">Utama</span>
                                <h3 className="text-xl sm:text-2xl font-bold text-white font-serif">{facilities?.main_title || programData.facilitiesFallback.mainTitle}</h3>
                                {facilities?.main_description && (
                                    <p className="text-white/80 text-sm mt-2 max-w-lg">{facilities.main_description}</p>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1 relative rounded-3xl overflow-hidden bg-gray-100 lg:h-full pause-hover">
                            <div className="lg:hidden flex gap-4 p-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                                {facilities?.items?.length > 0 ? (
                                    facilities.items.map((item, idx) => (
                                        <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm h-48 w-64 flex-shrink-0 snap-center">
                                            <ResponsiveImage src={item.image} alt={item.title || `Fasilitas ${idx + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
                                                <p className="text-white font-bold text-sm">{item.title}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center w-full py-12 text-gray-400 text-sm">Belum ada data fasilitas</div>
                                )}
                            </div>

                            <div className="hidden lg:block absolute inset-0 overflow-hidden">
                                {facilities?.items?.length > 0 ? (
                                    <div className="animate-scroll-vertical flex flex-col gap-4 p-4">
                                        {[...facilities.items, ...facilities.items].map((item, idx) => (
                                            <div key={idx} className="relative rounded-2xl overflow-hidden shadow-sm h-48 flex-shrink-0">
                                                <ResponsiveImage src={item.image} alt={item.title || `Fasilitas ${idx + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
                                                    <p className="text-white font-bold text-sm">{item.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">Belum ada data</div>
                                )}
                            </div>
                            <div className="hidden lg:block absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/20 to-transparent z-10 pointer-events-none" aria-hidden="true"></div>
                            <div className="hidden lg:block absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/20 to-transparent z-10 pointer-events-none" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROSPEK KARIR */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <h2 className={`${TYPOGRAPHY.sectionHeading} mb-6`}>
                            {career_paths?.title || programData.careerFallback.title}
                        </h2>
                        <p className={`${TYPOGRAPHY.bodyText} mb-10`}>
                            {career_paths?.description || `Lulusan Program ${programData.title} ${siteName} memiliki rekam jejak sukses menembus perguruan tinggi negeri favorit dan berkarir di bidang strategis.`}
                        </p>

                        <div className="space-y-4">
                            {career_paths?.items?.length > 0 ? (
                                career_paths.items.map((item, idx) => {
                                    const IconComponent = iconMap[item.icon_name] || DefaultCareerIcon;
                                    return (
                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                            <div className="p-3 bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                                <IconComponent className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <ImageIcon className="w-12 h-12 text-gray-300 mb-4" aria-hidden="true" />
                                    <p className="text-gray-500 font-medium">Belum ada data prospek karir</p>
                                    <p className="text-sm text-gray-400 mt-1">Data akan ditambahkan melalui panel admin</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary relative overflow-hidden rounded-3xl mx-4 mb-16">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" aria-hidden="true"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" aria-hidden="true"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Siap Menjadi Bagian dari <br/> Keluarga Besar {siteName}?
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                        Dapatkan informasi lengkap mengenai pendaftaran peserta didik baru, jadwal, dan persyaratan yang dibutuhkan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/informasi-spmb" className="px-8 py-4 bg-accent-yellow text-gray-900 font-bold rounded-xl shadow-lg">
                            Daftar Sekarang
                        </Link>
                        <Link href="/kontak" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl">
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </section>

            </main>
            <Footer
                logoSman1={navigationData.logoSman1}
                googleMapsEmbedUrl={navigationData.googleMapsEmbedUrl}
                socialMediaLinks={navigationData.socialMediaLinks}
            />
        </div>
    );
}
