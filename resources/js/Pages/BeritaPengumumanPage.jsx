import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Search, 
    Calendar, 
    ChevronRight, 
    TrendingUp, 
    Bell, 
    Newspaper, // Added for fallback
    Tag,
    ArrowRight
} from 'lucide-react';

import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import SEOHead from '@/Components/SEOHead';
import ResponsiveImage, { HeroImage } from '@/Components/ResponsiveImage';
import { TYPOGRAPHY } from '@/Utils/typography';
import { getNavigationData } from '@/Utils/navigationData';
import { usePage } from '@inertiajs/react';

// --- STATIC DATA ---
// Categories filter
const categories = ["Semua", "Berita", "Pengumuman", "Prestasi", "Akademik", "Kegiatan", "Alumni"];

const formatImagePath = (path) => {
    if (!path) return null;
    if (typeof path !== 'string') return null;
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/storage/${path}`;
};

const NewsItem = ({ news }) => {
    // Simplify image data handling
    const imageMedia = typeof news.image === 'object' ? news.image : null;
    const imageSrc = news.featured_image || (typeof news.image === 'string' ? news.image : null);
    
    return (
        <div className="flex flex-col sm:flex-row gap-6 group border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative aspect-square">
                <img
                    src={imageSrc || imageMedia?.original_url || ''}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center hidden absolute inset-0">
                    <Newspaper className="w-10 h-10 text-gray-300" />
                </div>
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-primary shadow-sm">
                    {news.category}
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(news.published_at || news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <Link href={`/berita/${news.slug}`} className="block">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 font-serif">
                        {news.title}
                    </h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {news.excerpt}
                </p>
                <Link href={`/berita/${news.slug}`} className="text-primary text-sm font-semibold hover:underline inline-flex items-center">
                    Baca Selengkapnya <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
            </div>
        </div>
    );
};;

export default function BeritaPengumumanPage({ posts = [], popularPosts = [] }) {
    const { siteSettings } = usePage().props;
    const navigationData = getNavigationData(siteSettings);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [visibleCount, setVisibleCount] = useState(5); // Initially show 5 items
    const ITEMS_PER_LOAD = 5; // Load 5 more each time

    const heroSettings = siteSettings?.hero_posts || {};
    const heroImage = siteSettings?.general?.hero_image || '/images/hero-bg-sman1baleendah.jpeg';

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = activeCategory === 'Semua' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [posts, searchQuery, activeCategory]);

    const heroNews = filteredPosts.slice(0, 4);
    const allLatestNews = filteredPosts.slice(4);
    const latestNews = allLatestNews.slice(0, visibleCount);
    const hasMoreNews = visibleCount < allLatestNews.length;
    const popularNews = popularPosts.length > 0 ? popularPosts : posts.slice(0, 5);
    
    // Load more handler
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_LOAD);
    };
    
    // Reset visible count when filter changes
    React.useEffect(() => {
        setVisibleCount(5);
    }, [searchQuery, activeCategory]);
    
    // Dynamic announcements from DB
    const announcements = posts
        .filter(p => p.category === 'Pengumuman')
        .slice(0, 5)
        .map(p => p.title);

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

    const siteName = siteSettings?.general?.site_name || 'SMAN 1 Baleendah';

    return (
        <div className="bg-secondary font-sans text-gray-800">
            <SEOHead 
                title={`${heroSettings.title || 'Berita & Pengumuman'} - ${siteName}`}
                description={`Berita terbaru, pengumuman, dan informasi penting dari ${siteName}. Update kegiatan, prestasi, dan event sekolah.`}
                keywords={`berita, pengumuman, informasi sekolah, update, event, ${siteName}`}
                image={heroSettings.background_image || "/images/news-banner.jpg"}
            />
            
            <Navbar
                logoSman1={navigationData.logoSman1}
                profilLinks={navigationData.profilLinks}
                akademikLinks={navigationData.akademikLinks}
                programStudiLinks={navigationData.programStudiLinks}
            />

            <main id="main-content" className="pt-20">
            {/* HERO SECTION (Consistent with AcademicCalendarPage) */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <link rel="preload" as="image" href={formatImagePath(heroImage)} fetchpriority="high" />
                
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <HeroImage src={formatImagePath(heroImage)} alt={`Berita ${siteName}`} />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className={`${TYPOGRAPHY.heroTitle} mb-4 drop-shadow-lg`}>
                        {renderHighlightedTitle(heroSettings.title || 'Berita & Pengumuman')}
                    </h1>
                    <p className={`${TYPOGRAPHY.heroText} max-w-2xl mx-auto opacity-90`}>
                        {heroSettings.subtitle || `Dapatkan informasi terkini seputar prestasi siswa, agenda sekolah, dan berita terbaru dari ${siteName}.`}
                    </p>
                </div>
            </section>

            {/* FEATURED NEWS - Bento Grid Layout */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 py-12">
                {heroNews.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {heroNews.map((news) => {
                            const imgSrc = news.featured_image || (typeof news.image === 'object' ? news.image?.original_url : news.image) || '';
                            return (
                                <Link key={news.id} href={`/berita/${news.slug}`} className="group relative aspect-square rounded-xl overflow-hidden shadow-md block">
                                    <img
                                        src={imgSrc}
                                        alt={news.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                                        <span className="inline-block self-start px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded mb-2 border border-white/20">
                                            {news.category}
                                        </span>
                                        <h3 className="text-sm font-bold text-white font-serif leading-snug line-clamp-2">
                                            {news.title}
                                        </h3>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Belum ada berita</h3>
                            <p className="text-gray-500">Silakan kembali lagi nanti untuk informasi terbaru.</p>
                        </div>
                    )}
                </section>

                {/* PART 2: MAIN CONTENT AREA (Strict Grid) */}
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Left Column: Latest News (8 Cols) */}
                        <div className="lg:col-span-8">
                            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                                <h2 className="text-2xl font-bold text-gray-900 font-serif">Berita Terbaru</h2>
                                <div className="flex gap-2">
                                    <select 
                                        value={activeCategory}
                                        onChange={(e) => setActiveCategory(e.target.value)}
                                        aria-label="Filter kategori berita"
                                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                                    >
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="space-y-6">
                                    {latestNews.length > 0 ? (
                                        latestNews.map((news) => (
                                            <NewsItem key={news.id} news={news} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>Tidak ada berita lainnya untuk ditampilkan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Load More Button */}
                            {hasMoreNews && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={handleLoadMore}
                                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-primary hover:text-white hover:border-primary hover:shadow-md transition-all duration-300 flex items-center gap-2"
                                    >
                                        Muat Lebih Banyak
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Sidebar (4 Cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-10">
                            
                            {/* Search Widget */}
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Cari berita..." 
                                    aria-label="Cari berita"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm outline-none transition-all"
                                />
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>

                            {/* Pengumuman Penting Widget (Fixed Style) */}
                            <div className="bg-yellow-50 border-l-4 border-accent-yellow p-6 rounded-r-xl relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-orange-600" />
                                    Pengumuman Penting
                                </h3>
                                {announcements.length > 0 ? (
                                    <ul className="space-y-3">
                                        {announcements.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-800 border-b border-accent-yellow/20 last:border-0 pb-2 last:pb-0">
                                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Belum ada pengumuman.</p>
                                )}
                            </div>

                            {/* Terpopuler Widget */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Terpopuler
                                </h3>
                                <div className="space-y-5">
                                    {popularNews.map((news, idx) => (
                                        <Link key={news.id} href={`/berita/${news.slug}`} className="flex gap-4 group">
                                            <span className="text-3xl font-bold text-gray-300 font-serif group-hover:text-primary transition-colors">
                                                0{idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-gray-800 font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                    {news.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Categories Widget */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" />
                                    Kategori
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                activeCategory === cat
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-primary hover:text-white'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

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
