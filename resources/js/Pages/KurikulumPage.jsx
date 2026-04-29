import { 
    BookOpen, 
    Globe, 
    CheckCircle, 
    Users, 
    Monitor,
    Target,
    Activity,
    Repeat,
    Network,
    ChevronRight,
    ImageIcon
} from 'lucide-react';

// Import Components
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import SEOHead from '@/Components/SEOHead';
import ResponsiveImage, { HeroImage } from '@/Components/ResponsiveImage';

// Import utilities
import { TYPOGRAPHY } from '@/Utils/typography';
import { getNavigationData } from '@/Utils/navigationData';
import { getPageMetadata } from '@/Utils/academicData';
import { usePage, Link } from '@inertiajs/react';

export default function KurikulumPage({ curriculumData }) {
    const { siteSettings } = usePage().props;
    const siteName = siteSettings?.general?.site_name || 'SMAN 1 Baleendah';
    const heroImage = siteSettings?.general?.hero_image || '/images/hero-bg-sman1baleendah.jpeg';
    const navigationData = getNavigationData(siteSettings);
    const pageMetadata = getPageMetadata(siteName);
    const {
        hero,
        problem,
        definition,
        principles,
        learning_cycle,
        design_framework,
        competency_dimensions,
        learner_profile,
        infographic_deep_learning,
        infographic_education_2045,
    } = curriculumData || {};

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path !== 'string') return null;
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    const renderHighlightedTitle = (title) => {
        if (!title) return null;
        const words = title.split(' ');
        if (words.length <= 1) return title;
        const lastWord = words.pop();
        return (
            <>
                {words.join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{lastWord}</span>
            </>
        );
    };

    // Map framework items to icons by keyword
    const frameworkIcons = [Users, Network, Globe, Monitor];

    // Check if infographic has a usable image
    const hasInfoImage = (info) => {
        return info?.image?.original_url || info?.image_url;
    };

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800 flex flex-col">
            <SEOHead 
                title={pageMetadata?.kurikulum?.title || 'Kurikulum'}
                description={pageMetadata?.kurikulum?.description || ''}
                keywords="kurikulum, kurikulum merdeka, mata pelajaran, sistem pembelajaran, SMAN 1 Baleendah"
                image="/images/kurikulum-banner.jpg"
            />

            <Navbar
                logoSman1={navigationData.logoSman1}
                profilLinks={navigationData.profilLinks}
                akademikLinks={navigationData.akademikLinks}
                programStudiLinks={navigationData.programStudiLinks}
            />

            <main id="main-content" className="pt-20" tabIndex="-1">

            {/* ═══ 1. HERO ═══ */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <HeroImage src={formatImagePath(heroImage)} media={hero?.image} alt="Background Kurikulum" />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className={`${TYPOGRAPHY.heroTitle} mb-4 drop-shadow-lg`}>
                        {renderHighlightedTitle(hero?.title || 'Pembelajaran Mendalam')}
                    </h1>
                    <p className={`${TYPOGRAPHY.heroText} max-w-2xl mx-auto opacity-90`}>
                        {hero?.subtitle || 'Solusi Menuju Pendidikan Bermutu 2045'}
                    </p>
                </div>
            </section>

            {/* ═══ 2. MASALAH & PISA 2022 — impactful stat cards ═══ */}
            {problem && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>{problem.title}</h2>
                            <p className={TYPOGRAPHY.bodyText}>{problem.description}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {(problem.stats || []).map((stat, idx) => (
                                <div key={idx} className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-sm overflow-hidden">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{stat.label}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                            <span className="text-sm font-medium text-gray-600">LOTS (Level 1-3)</span>
                                            <span className="text-lg font-bold text-gray-900">{stat.lots?.split(' ')[0]}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5">
                                            <span className="text-sm font-medium text-primary">HOTS (Level 4-6)</span>
                                            <span className="text-lg font-bold text-primary">{stat.hots?.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 3. DEFINISI & 4 OLAH — editorial split ═══ */}
            {definition && (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
                            {/* Left: primary card */}
                            <div className="bg-primary rounded-3xl p-10 md:p-14 text-white relative overflow-hidden flex flex-col justify-center shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <BookOpen className="text-accent-yellow w-7 h-7" />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                                        {definition.title}
                                    </h2>
                                    <p className="text-lg leading-relaxed text-blue-100">
                                        {definition.description}
                                    </p>
                                </div>
                            </div>

                            {/* Right: 2x2 grid of 4 olah */}
                            <div className="grid grid-cols-2 gap-4">
                                {(definition.items || []).map((item, idx) => (
                                    <div key={idx} className="rounded-2xl p-6 border border-gray-200 bg-white flex flex-col justify-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 4. PRINSIP 3M — numbered steps ═══ */}
            {principles && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>{principles.title}</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {(principles.items || []).map((item, idx) => (
                                <div key={idx} className="relative">
                                    <div className="text-7xl font-black text-gray-100 leading-none mb-4">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 5. SIKLUS BELAJAR — horizontal flow with arrows ═══ */}
            {learning_cycle && (
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>{learning_cycle.title}</h2>
                        </div>
                        <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
                            {(learning_cycle.steps || []).map((step, idx) => {
                                const stepIcons = [Target, Activity, Repeat];
                                const StepIcon = stepIcons[idx] || Target;
                                const isLast = idx === (learning_cycle.steps || []).length - 1;
                                return (
                                    <div key={idx} className="flex flex-col md:flex-row items-center flex-1">
                                        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex-1 w-full text-center">
                                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <StepIcon className="w-7 h-7 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                            <p className="text-sm text-gray-600">{step.description}</p>
                                        </div>
                                        {!isLast && (
                                            <div className="flex items-center justify-center py-2 md:py-0 md:px-3 flex-shrink-0">
                                                <ChevronRight className="w-6 h-6 text-primary/40 rotate-90 md:rotate-0" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 6. KERANGKA IMPLEMENTASI — icon cards ═══ */}
            {design_framework && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>{design_framework.title}</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(design_framework.items || []).map((item, idx) => {
                                const FrameworkIcon = frameworkIcons[idx] || Network;
                                return (
                                    <div key={idx} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                                            <FrameworkIcon className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 7. DIMENSI KOMPETENSI & PROFIL PELAJAR — dark section (kept) ═══ */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {competency_dimensions && (
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold font-serif mb-8 text-white">
                                    {competency_dimensions.title}
                                </h2>
                                <div className="space-y-4">
                                    {(competency_dimensions.items || []).map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <div className="mt-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-gray-300 leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {learner_profile && (
                            <div className="bg-white/5 rounded-[40px] p-8 md:p-12 border border-white/10">
                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Users className="text-accent-yellow" />
                                    {learner_profile.title}
                                </h3>
                                <div className="space-y-3">
                                    {(learner_profile.items || []).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-gray-200">
                                            <span className="w-2 h-2 bg-accent-yellow rounded-full"></span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══ 8. INFOGRAFIS — with fallback placeholder ═══ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                    {[infographic_deep_learning, infographic_education_2045].filter(Boolean).map((info, idx) => (
                        <div key={idx} className={`grid lg:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
                            <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                                <h2 className={`${TYPOGRAPHY.sectionHeading} mb-4`}>{info.title}</h2>
                                <p className={TYPOGRAPHY.bodyText}>{info.description}</p>
                                {info.source && <p className="text-sm text-gray-500 mt-4">Sumber: {info.source}</p>}
                            </div>
                            <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                                {(info.image || hasInfoImage(info)) ? (
                                    <ResponsiveImage
                                        media={info.image}
                                        src={info.image?.original_url || info.image_url}
                                        alt={info.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 px-8 bg-gray-50 text-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">Infografis belum tersedia</p>
                                        <p className="text-sm text-gray-400 mt-1">Gambar akan ditambahkan melalui panel admin</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-20 bg-primary relative overflow-hidden rounded-3xl mx-4 mb-16">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Siap Menjadi Bagian dari <br/> Keluarga Besar {siteName}?
                    </h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                        Dapatkan informasi lengkap mengenai pendaftaran peserta didik baru, jadwal, dan persyaratan yang dibutuhkan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            href="/informasi-spmb" 
                            className="px-8 py-4 bg-accent-yellow text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
                        >
                            Daftar Sekarang
                        </Link>
                        <Link 
                            href="/kontak" 
                            className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-primary transition-colors"
                        >
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
