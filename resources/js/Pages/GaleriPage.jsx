import React, { useState, useMemo } from 'react';
import { logger } from '@/Utils/logger';
import { Head, usePage } from '@inertiajs/react';
import { Search, ChevronLeft, ChevronRight, X, Play, Image as ImageIcon } from 'lucide-react';

// Import Components
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import Modal from '@/Components/Modal';
import { normalizeUrl } from '@/Utils/imageUtils';
import { getNavigationData } from '@/Utils/navigationData';

// Import typography constants
import { TYPOGRAPHY } from '@/Utils/typography';

const GalleryThumbnail = React.memo(function GalleryThumbnail({ item }) {
    const [imgSrc, setImgSrc] = React.useState('');
    const [hasError, setHasError] = React.useState(false);

    // Determine initial image source
    React.useEffect(() => {
        let source = '';
        const rawUrl = normalizeUrl(item.url) || '';

        if (item.type === 'photo') {
            if (item.image) {
                // Prefer WebP
                if (item.image.conversions && item.image.conversions.webp) {
                    source = normalizeUrl(item.image.conversions.webp);
                } else if (item.image.original_url) {
                    source = normalizeUrl(item.image.original_url);
                }
            }
            if (!source) source = rawUrl;
        } else if (item.type === 'video') {
             // Check YouTube
             const youtubeMatch = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
             if (youtubeMatch) {
                 // Use maxresdefault for better quality, fallback to hqdefault
                 source = `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
             } else {
                 source = rawUrl; // for video tag or fallback img
             }
        }
        setImgSrc(source);
    }, [item]);

    const handleError = () => {
        if (!hasError) {
            logger.warn("Image load failed for:", item.title, "Source:", imgSrc);
            
            // For YouTube thumbnails, try hqdefault as fallback
            if (imgSrc && imgSrc.includes('maxresdefault.jpg')) {
                const hqdefaultSrc = imgSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
                setImgSrc(hqdefaultSrc);
                setHasError(true);
                return;
            }
            
            // Fallback to a guaranteed local image
            setImgSrc('/images/panen-karya-sman1-baleendah.jpg');
            setHasError(true);
        }
    };

    // For photos & YouTube thumbs (rendered as img)
    const isYoutubeThumb = item.type === 'video' && imgSrc && imgSrc.includes('img.youtube.com');

    if (item.type === 'photo' || isYoutubeThumb) {
        return (
            <img 
                src={imgSrc || '/images/panen-karya-sman1-baleendah.jpg'} 
                alt={item.title}
                className="w-full h-full object-cover block"
                loading="lazy"
                onError={handleError}
                style={{ objectPosition: 'center' }}
            />
        );
    }
    
    // For uploaded videos
    if (item.type === 'video') {
        const rawUrl = normalizeUrl(item.url) || '';
        // Safety check: if the URL points to an image file (wrong data type in DB), render as image
        const isImageFile = rawUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);
        
        if (isImageFile) {
             return (
                <img 
                    src={imgSrc || '/images/panen-karya-sman1-baleendah.jpg'} 
                    alt={item.title}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                    onError={handleError}
                    style={{ objectPosition: 'center' }}
                />
            );
        }

        return (
            <video
                src={`${imgSrc}#t=0.1`}
                className="w-full h-full object-cover block"
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => { e.target.currentTime = 0.1; }}
                onError={handleError}
                style={{ objectPosition: 'center' }}
            />
        );
    }

    // Unknown type fallback
    return (
        <img 
            src="/images/panen-karya-sman1-baleendah.jpg"
            alt="Fallback"
            className="w-full h-full object-cover block opacity-50"
            style={{ objectPosition: 'center' }}
        />
    );
});

const GalleryItem = React.memo(function GalleryItem({ item, index, onOpen }) {
    return (
        <div
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => onOpen(item, index)}
        >
            {/* Image Wrapper - Using Padding Hack for 16:9 Aspect Ratio to ensure visibility */}
            <div className="relative w-full pb-[56.25%] overflow-hidden bg-gray-200">
                <div className="absolute inset-0 w-full h-full">
                    <GalleryThumbnail item={item} />
                </div>
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Video Indicator */}
                {item.type === 'video' && (
                    <div className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border border-white/50 group-hover:bg-accent-yellow group-hover:border-accent-yellow transition-colors duration-300 z-10">
                        <Play className="w-5 h-5 text-white group-hover:text-white ml-1" fill="currentColor" />
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-bold uppercase tracking-wider text-[10px] bg-blue-50 px-2 py-1 rounded-md">
                        {item.category || 'Umum'}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">
                        {new Date(item.date || item.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors text-sm">
                    {item.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 font-sans">
                    {item.description}
                </p>
            </div>
        </div>
    );
});

export default function GaleriPage({ galleries = [] }) {
    const { siteSettings } = usePage().props;
    const siteName = siteSettings?.general?.site_name || 'SMAN 1 Baleendah';
    const heroImage = siteSettings?.general?.hero_image || '/images/hero-bg-sman1baleendah.jpeg';
    const navigationData = getNavigationData(siteSettings);
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const heroSettings = siteSettings?.hero_gallery || {};
    
    // Helper to format image path correctly
    const formatImagePath = (path) => normalizeUrl(path);

    // Get unique categories from galleries
    const categories = useMemo(() => {
        const uniqueCats = new Set(
            galleries
                .map(item => item.category)
                .filter(cat => cat && typeof cat === 'string' && cat.trim() !== '')
        );
        return ['Semua', ...Array.from(uniqueCats).sort()];
    }, [galleries]);

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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; 

    // Filter dan search gallery data
    const filteredData = useMemo(() => {
        let data = galleries;
        if (selectedCategory !== 'Semua') {
            data = data.filter(item => item.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            data = data.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        return data;
    }, [selectedCategory, searchQuery, galleries]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openLightbox = (item, index) => {
        setCurrentItem(item);
        setCurrentIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentItem(null);
        document.body.style.overflow = 'unset';
    };

    const navigateLightbox = (direction) => {
        const newIndex = direction === 'next' 
            ? (currentIndex + 1) % filteredData.length
            : (currentIndex - 1 + filteredData.length) % filteredData.length;
        
        setCurrentIndex(newIndex);
        setCurrentItem(filteredData[newIndex]);
    };

    React.useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'Escape': closeLightbox(); break;
                case 'ArrowLeft': if (filteredData.length > 1) navigateLightbox('prev'); break;
                case 'ArrowRight': if (filteredData.length > 1) navigateLightbox('next'); break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, filteredData.length]);

    return (
        <div className="bg-secondary min-h-screen font-sans text-gray-800 flex flex-col">
            <Head title={`Galeri - ${siteName}`} description={`Galeri kehidupan sekolah ${siteName}.`} />

            <Navbar
                logoSman1={navigationData.logoSman1}
                profilLinks={navigationData.profilLinks}
                akademikLinks={navigationData.akademikLinks}
                programStudiLinks={navigationData.programStudiLinks}
            />
            <main id="main-content" className="pt-20" tabIndex="-1">            {/* HERO SECTION */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={formatImagePath(heroImage)} 
                        alt="Background Galeri Sekolah" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <h1 className={`${TYPOGRAPHY.heroTitle} mb-4`}>
                        {renderHighlightedTitle(heroSettings.title || 'Galeri Kegiatan')}
                    </h1>
                    <p className={`${TYPOGRAPHY.heroText} max-w-2xl mx-auto opacity-90`}>
                        {heroSettings.subtitle || `Momen-momen berharga dalam berbagai aktivitas sekolah.`}
                    </p>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="py-12 flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* FILTER & SEARCH */}
                    <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                                        selectedCategory === cat 
                                        ? "bg-primary text-white shadow-md border-primary" 
                                        : "bg-white text-gray-600 hover:text-primary border border-gray-200 hover:border-primary"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder="Cari foto atau video..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm text-sm"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                        </div>
                    </div>

                    {/* GALLERY GRID */}
                    {filteredData.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {paginatedData.map((item, index) => {
                                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                                    return (
                                        <GalleryItem key={item.id} item={item} index={globalIndex} onOpen={openLightbox} />
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-12 gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-full font-bold text-xs transition-all duration-300 ${
                                                currentPage === page
                                                ? "bg-primary text-white shadow-md transform scale-110"
                                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-block p-4 rounded-full bg-white mb-4 shadow-sm">
                                <Search size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Tidak ada galeri ditemukan</h3>
                            <p className="text-gray-500">Coba kata kunci lain atau ubah filter kategori.</p>
                        </div>
                    )}
                </div>
            </section>

           </main> <Footer
                logoSman1={navigationData.logoSman1}
                googleMapsEmbedUrl={navigationData.googleMapsEmbedUrl}
                socialMediaLinks={navigationData.socialMediaLinks}
            />

            {/* DETAIL MODAL */}
            <Modal show={lightboxOpen} onClose={closeLightbox} maxWidth="4xl">
                {currentItem && (
                    <div className="bg-white rounded-2xl overflow-hidden">
                        <div className="relative bg-gray-200 overflow-hidden min-h-[280px] md:min-h-[360px]">
                            {(() => {
                                const url = normalizeUrl(currentItem.url) || '';
                                if (currentItem.type === 'photo') {
                                    const imgSrc = (currentItem.image && currentItem.image.original_url)
                                        ? normalizeUrl(currentItem.image.original_url)
                                        : url;

                                    return (
                                        <img
                                            src={imgSrc}
                                            alt={currentItem.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    );
                                }

                                const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                if (youtubeMatch) {
                                    return (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&modestbranding=1&rel=0`}
                                            className="absolute inset-0 w-full h-full border-0"
                                            allowFullScreen
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            title={currentItem.title}
                                        />
                                    );
                                }

                                return (
                                    <video
                                        src={url}
                                        controls
                                        className="absolute inset-0 w-full h-full object-cover bg-black"
                                        autoPlay
                                        playsInline
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                );
                            })()}

                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-white/90 rounded-full p-2 hover:bg-white transition-colors focus:outline-none z-10 shadow-sm"
                                aria-label="Tutup"
                            >
                                <X size={24} />
                            </button>

                            {currentItem.type === 'photo' && (
                                <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/85 via-black/50 to-transparent"></div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-sm bg-white text-primary">
                                    {currentItem.category || 'Umum'}
                                </span>
                                <h2 className="text-2xl font-bold text-white drop-shadow-sm">{currentItem.title}</h2>
                            </div>

                            {filteredData.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/85 hover:bg-white rounded-full transition-colors shadow-sm z-10"
                                        aria-label="Sebelumnya"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/85 hover:bg-white rounded-full transition-colors shadow-sm z-10"
                                        aria-label="Berikutnya"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-700" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                {currentItem.type === 'video' ? (
                                    <Play className="w-5 h-5 text-primary" fill="currentColor" />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                )}
                                <span className="text-gray-500 text-sm font-medium">
                                    {currentItem.type === 'video' ? 'Video Kegiatan' : 'Foto Kegiatan'}
                                </span>
                            </div>

                            <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                                {currentItem.description || 'Dokumentasi kegiatan sekolah SMAN 1 Baleendah.'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
