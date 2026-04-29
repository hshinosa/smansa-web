import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    ChevronLeft,
    ChevronRight, 
    Facebook, 
    Twitter, 
    Linkedin, 
    Link as LinkIcon,
    ArrowRight,
    Check
} from 'lucide-react';

import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import SEOHead from '@/Components/SEOHead';
import { ContentImage } from '@/Components/ResponsiveImage';
import SanitizedContent from '@/Components/SanitizedContent';
import { getNavigationData } from '@/Utils/navigationData';

export default function BeritaDetailPage({ post, relatedPosts = [] }) {
    const { siteSettings } = usePage().props;
    const siteName = siteSettings?.general?.site_name || 'SMAN 1 Baleendah';
    const navigationData = getNavigationData(siteSettings);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [linkCopied, setLinkCopied] = useState(false);
    
    if (!post) return null;
    
    const postUrl = `https://sman1baleendah.sch.id/berita/${post.slug}`;
    
    const handleShare = (platform) => {
        const encodedUrl = encodeURIComponent(postUrl);
        const encodedTitle = encodeURIComponent(post.title);
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        };
        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    };
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };
    
    // Check if post has gallery images (multiple images from Instagram)
    const hasGallery = post.galleryImages && post.galleryImages.length > 0;
    const galleryImages = hasGallery ? post.galleryImages : [];
    
    // Navigate carousel
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };
    
    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };
    
    // Extract excerpt from content (first 160 characters)
    const getExcerpt = (content) => {
        const textOnly = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        return textOnly.substring(0, 160) + (textOnly.length > 160 ? '...' : '');
    };

    return (
        <div className="bg-white font-sans text-gray-800">
            <SEOHead 
                title={`${post.title} - Berita ${siteName}`}
                description={post.excerpt || getExcerpt(post.content)}
                keywords={`berita, ${post.category || 'pengumuman'}, ${post.title}, ${siteName}, sekolah`}
                image={post.featured_image || null}
                type="article"
                author={post.author?.name || 'Admin'}
                publishedTime={post.published_at || post.created_at}
                modifiedTime={post.updated_at}
                canonical={`https://sman1baleendah.sch.id/berita/${post.slug}`}
            />
            
            <Navbar
                logoSman1={navigationData.logoSman1}
                profilLinks={navigationData.profilLinks}
                akademikLinks={navigationData.akademikLinks}
                programStudiLinks={navigationData.programStudiLinks}
            />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-12">
                        
                        {/* LEFT COLUMN: ARTICLE CONTENT */}
                        <div className="lg:w-2/3">
                            {/* Breadcrumb */}
                            <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
                                <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
                                <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                                <Link href="/berita-pengumuman" className="hover:text-primary transition-colors">Berita</Link>
                                <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0" />
                                <span className="text-primary font-medium">{post.category}</span>
                            </nav>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-serif leading-tight mb-6">
                                {post.title}
                            </h1>

                            {/* Author Block */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-8 mb-8 gap-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4 border border-gray-100 overflow-hidden">
                                        <img src="/images/logo-sman1-baleendah.png" alt="Admin Smansa" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Admin Smansa</p>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <span className="flex items-center mr-3">
                                                <Calendar className="w-3 h-3 mr-1" /> {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center mr-3">
                                                <Clock className="w-3 h-3 mr-1" /> {new Date(post.published_at || post.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Share Buttons */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 mr-2 hidden sm:inline">Bagikan:</span>
                                    <button onClick={() => handleShare('facebook')} aria-label="Bagikan ke Facebook" className="p-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors">
                                        <Facebook className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleShare('twitter')} aria-label="Bagikan ke Twitter" className="p-2 rounded-full bg-gray-50 hover:bg-sky-50 text-gray-600 hover:text-sky-500 transition-colors">
                                        <Twitter className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleShare('linkedin')} aria-label="Bagikan ke LinkedIn" className="p-2 rounded-full bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleCopyLink} aria-label="Salin tautan" className="p-2 rounded-full bg-gray-50 hover:bg-gray-200 text-gray-600 transition-colors relative">
                                        {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <LinkIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Featured Image or Gallery Carousel */}
                            {hasGallery ? (
                                /* Instagram Gallery Carousel */
                                <div className="rounded-2xl overflow-hidden shadow-lg mb-4 relative bg-gray-900">
                                    {/* Main Image - Auto height to show full image */}
                                    <div className="relative flex items-center justify-center min-h-[300px] max-h-[600px]">
                                        <ContentImage 
                                            media={galleryImages[currentImageIndex]}
                                            alt={`${post.title} - Image ${currentImageIndex + 1}`}
                                            className="w-full h-auto max-h-[600px] object-contain"
                                        />
                                        
                                        {/* Navigation Arrows */}
                                        {galleryImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                                                    aria-label="Previous image"
                                                >
                                                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
                                                    aria-label="Next image"
                                                >
                                                    <ChevronRight className="w-6 h-6 text-gray-800" />
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* Image Counter */}
                                        {galleryImages.length > 1 && (
                                            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                {currentImageIndex + 1} / {galleryImages.length}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Thumbnail Navigation */}
                                    {galleryImages.length > 1 && (
                                        <div className="flex gap-2 p-4 bg-gray-900 overflow-x-auto">
                                            {galleryImages.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                        idx === currentImageIndex 
                                                            ? 'border-white scale-105' 
                                                            : 'border-transparent opacity-60 hover:opacity-100'
                                                    }`}
                                                >
                                                    <ContentImage 
                                                        media={img}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Single Featured Image */
                                <div className="rounded-2xl overflow-hidden shadow-lg mb-4">
                                    {post.featuredImage ? (
                                        <ContentImage 
                                            media={post.featuredImage}
                                            alt={post.title}
                                        />
                                    ) : post.featured_image ? (
                                        <ContentImage 
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="w-full h-auto object-cover"
                                        />
                                    ) : null}
                                    {post.caption && (
                                        <p className="text-center text-sm text-gray-500 italic mb-0 mt-2 px-4">
                                            {post.caption}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Article Body */}
                            <article className="prose prose-lg prose-blue max-w-none font-serif text-gray-700 leading-relaxed mb-12">
                                <SanitizedContent html={post.content} />
                            </article>

                            <div className="pt-8 border-t border-gray-100 mb-12">
                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                    {post.category}
                                </span>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: STICKY SIDEBAR (BACA JUGA) */}
                        <div className="lg:w-1/3">
                            <div className="sticky top-32 space-y-8">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 font-serif mb-6 flex items-center justify-between">
                                        Baca Juga
                                        <Link href="/berita-pengumuman" className="text-primary text-sm font-sans font-medium hover:underline flex items-center">
                                            Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
                                        </Link>
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {relatedPosts.map((news) => (
                                            <Link key={news.id} href={`/berita/${news.slug}`} className="group block bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                                                <div className="flex gap-4">
                                                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                                        <ContentImage 
                                                            src={news.featured_image} 
                                                            media={news.featuredImage}
                                                            alt={news.title} 
                                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">
                                                            {news.category}
                                                        </span>
                                                        <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-primary transition-colors line-clamp-3 mb-2">
                                                            {news.title}
                                                        </h4>
                                                        <div className="text-[10px] text-gray-500 flex items-center mt-auto">
                                                            <Calendar className="w-3 h-3 mr-1" /> {new Date(news.published_at || news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {relatedPosts.length === 0 && (
                                            <p className="text-sm text-gray-500 italic">Tidak ada berita terkait.</p>
                                        )}
                                    </div>
                                </div>

                                {/* CTA Widget */}
                                <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                    <h3 className="font-bold text-lg mb-2 relative z-10">Lihat Semua Berita</h3>
                                    <p className="text-blue-100 text-sm mb-4 relative z-10">Temukan berita, pengumuman, dan informasi terbaru lainnya dari sekolah.</p>
                                    <Link href="/berita-pengumuman" className="block w-full py-2 bg-white text-primary font-bold rounded-lg text-sm text-center hover:bg-blue-50 transition-colors relative z-10">
                                        Ke Halaman Berita
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer
                logoSman1={navigationData.logoSman1}
                googleMapsEmbedUrl={navigationData.googleMapsEmbedUrl}
                socialMediaLinks={navigationData.socialMediaLinks}
            />
        </div>
    );
}
