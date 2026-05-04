import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function SEOHead({
    title = "SMAN 1 Baleendah",
    description = "Website resmi SMAN 1 Baleendah - Sekolah Menengah Atas unggulan di Bandung dengan program peminatan MIPA, IPS, dan Bahasa. Dapatkan informasi PPDB, program akademik, ekstrakurikuler, dan prestasi siswa.",
    keywords = "SMAN 1 Baleendah, SMA Baleendah, sekolah Bandung, PPDB Bandung, SMA negeri Bandung, pendidikan Baleendah, peminatan IPA IPS Bahasa",
    image = "/images/logo-sekolah.png",
    url,
    type = "website",
    author = "SMAN 1 Baleendah",
    publishedTime,
    modifiedTime,
    canonical,
}) {
    const { props } = usePage();
    const generalSettings = props.siteSettings?.general || {};
    const socialSettings = props.siteSettings?.social_media || {};
    
    const siteUrl = generalSettings.site_url || "https://sman1baleendah.sch.id";
    const siteName = generalSettings.site_name || "SMAN 1 Baleendah";
    const defaultDesc = generalSettings.site_description || "Website resmi SMAN 1 Baleendah - Sekolah Menengah Atas unggulan di Bandung dengan program peminatan MIPA, IPS, dan Bahasa. Dapatkan informasi PPDB, program akademik, ekstrakurikuler, dan prestasi siswa.";
    
    const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
    const canonicalUrl = canonical || fullUrl;
    
    const defaultLogo = generalSettings.site_logo ? 
        (generalSettings.site_logo.startsWith('http') ? generalSettings.site_logo : `/storage/${generalSettings.site_logo}`) : 
        "/images/logo-sekolah.png";
        
    const defaultHero = generalSettings.hero_image ? 
        (generalSettings.hero_image.startsWith('http') ? generalSettings.hero_image : `/storage/${generalSettings.hero_image}`) : 
        "/images/hero-bg-sman1baleendah.jpeg";

    const finalTitle = title !== "SMAN 1 Baleendah" ? `${title} - ${siteName}` : siteName;
    const finalDescription = description !== "Website resmi SMAN 1 Baleendah - Sekolah Menengah Atas unggulan di Bandung dengan program peminatan MIPA, IPS, dan Bahasa. Dapatkan informasi PPDB, program akademik, ekstrakurikuler, dan prestasi siswa." 
        ? description 
        : defaultDesc;
    
    const fullImageUrl = image && typeof image === 'string' 
        ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
        : `${siteUrl}${defaultHero}`;
    
    const socialLinks = [];
    if (socialSettings.facebook) socialLinks.push(socialSettings.facebook);
    if (socialSettings.instagram) socialLinks.push(socialSettings.instagram);
    if (socialSettings.youtube) socialLinks.push(socialSettings.youtube);
    if (socialSettings.twitter) socialLinks.push(socialSettings.twitter);
    if (socialSettings.linkedin) socialLinks.push(socialSettings.linkedin);
    
    // Generate schema.org structured data
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": siteName,
        "alternateName": "SMA Negeri 1 Baleendah",
        "url": siteUrl,
        "logo": `${siteUrl}${defaultLogo}`,
        "image": fullImageUrl,
        "description": finalDescription,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": generalSettings.address || "Jl. R.A.A. Wiranatakoesoemah No.30, Baleendah",
            "addressLocality": "Baleendah",
            "addressRegion": "Jawa Barat",
            "postalCode": "40375",
            "addressCountry": "ID"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Admissions",
            "telephone": generalSettings.phone || "+62-22-5940262",
            "email": generalSettings.email || "info@sman1baleendah.sch.id"
        },
        "sameAs": socialLinks.length > 0 ? socialLinks : [
            "https://www.facebook.com/SMAN1Baleendah",
            "https://www.instagram.com/sman1baleendah",
            "https://www.youtube.com/@sman1baleendah"
        ]
    };
    
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteName,
        "url": siteUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${siteUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };
    
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
        }]
    };

    // Inject structured data using useEffect to avoid Head component issues
    useEffect(() => {
        // Remove existing structured data
        document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
        
        // Inject new structured data
        const scripts = [
            organizationSchema,
            websiteSchema,
            breadcrumbSchema
        ];
        
        scripts.forEach(schema => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        });
        
        return () => {
            document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
        };
    }, []);

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            
            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />
            
            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:image:alt" content={finalTitle} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="id_ID" />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={fullImageUrl} />
            <meta name="twitter:site" content="@sman1baleendah" />
            
            {/* Mobile Meta Tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="theme-color" content="#1e40af" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            
            {/* Favicons & App Icons */}
            <link rel="icon" type="image/png" href="/images/logo-sman1baleendah-32x32.png" sizes="32x32" />
            <link rel="icon" type="image/png" href={defaultLogo} sizes="192x192" />
            <link rel="apple-touch-icon" href={defaultLogo} />
            <link rel="manifest" href="/site.webmanifest" />
            
            {/* Resource Hints */}
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
            <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Head>
    );
}
