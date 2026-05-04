import { Link, usePage } from '@inertiajs/react';

export default function AnnouncementMarquee() {
    const { siteSettings } = usePage().props;
    const announcement = siteSettings?.announcement;

    if (!announcement?.enabled || !announcement?.text) return null;

    const bgColor = announcement.bg_color || '#1e40af';
    const textColor = announcement.text_color || '#ffffff';
    const linkUrl = announcement.link_url;
    const linkText = announcement.link_text || 'Lihat Selengkapnya';

    const content = (
        <>
            <span className="text-sm font-medium">{announcement.text}</span>
            {linkUrl && (
                <span className="text-sm font-bold underline underline-offset-2 ml-2">{linkText} →</span>
            )}
        </>
    );

    const repeatedContent = (
        <>
            <span className="inline-flex items-center px-8">{content}</span>
            <span className="inline-flex items-center px-8">{content}</span>
            <span className="inline-flex items-center px-8">{content}</span>
        </>
    );

    return (
        <>
            <div
                className="fixed top-24 left-0 right-0 z-40 overflow-hidden py-2.5"
                style={{ backgroundColor: bgColor, color: textColor }}
            >
                {linkUrl ? (
                    <Link href={linkUrl} className="block animate-marquee whitespace-nowrap flex items-center gap-0 hover:opacity-90 transition-opacity">
                        {repeatedContent}
                    </Link>
                ) : (
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-0">
                        {repeatedContent}
                    </div>
                )}
            </div>
            <div className="h-10" />
        </>
    );
}
