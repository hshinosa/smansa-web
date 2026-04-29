import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { FileText, Download, Calendar, ChevronRight } from 'lucide-react';

import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import SEOHead from '@/Components/SEOHead';
import ResponsiveImage, { HeroImage } from '@/Components/ResponsiveImage';
import { TYPOGRAPHY } from '@/Utils/typography';
import { getNavigationData } from '@/Utils/navigationData';
import { usePage } from '@inertiajs/react';

export default function PrestasiAkademikPage({ documents = [], heroContent }) {
    const { siteSettings } = usePage().props;
    const navigationData = getNavigationData(siteSettings);
    const heroImage = siteSettings?.general?.hero_image || '/images/hero-bg-sman1baleendah.jpeg';
    
    const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);
    
    const groupedDocs = documents.reduce((acc, doc) => {
        if (!acc[doc.year]) {
            acc[doc.year] = [];
        }
        acc[doc.year].push(doc);
        return acc;
    }, {});
    
    const years = Object.keys(groupedDocs).sort((a, b) => b - a);

    return (
        <div className="bg-secondary min-h-screen font-sans text-gray-800">
            <SEOHead 
                title="Prestasi Akademik - SMAN 1 Baleendah"
                description="Data serapan PTN dan hasil ujian siswa SMAN 1 Baleendah"
            />

            <Navbar
                logoSman1={navigationData.logoSman1}
                profilLinks={navigationData.profilLinks}
                akademikLinks={navigationData.akademikLinks}
                programStudiLinks={navigationData.programStudiLinks}
            />

            <main className="pt-20">
                <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <HeroImage src={heroContent?.background_image_url || heroImage} media={heroContent?.backgroundImage} alt="Background Prestasi Akademik" />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                    <div className="relative z-10 container mx-auto px-4 text-center text-white">
                        <h1 className={`${TYPOGRAPHY.heroTitle} mb-4 drop-shadow-lg`}>
                            Prestasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Akademik</span>
                        </h1>
                        <p className={`${TYPOGRAPHY.heroText} max-w-2xl mx-auto opacity-90`}>
                            Data serapan PTN dan hasil ujian siswa SMAN 1 Baleendah
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {documents.length === 0 ? (
                            <div className="text-center py-20">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Belum ada dokumen prestasi akademik.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <aside className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-24">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-primary" />
                                            Dokumen
                                        </h3>
                                        
                                        <nav className="space-y-4">
                                            {years.map(year => (
                                                <div key={year}>
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {year}
                                                    </div>
                                                    <div className="space-y-1 ml-6">
                                                        {groupedDocs[year].map(doc => (
                                                            <button
                                                                key={doc.id}
                                                                onClick={() => setSelectedDoc(doc)}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                                                    selectedDoc?.id === doc.id
                                                                        ? 'bg-primary text-white font-medium'
                                                                        : 'text-gray-600 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                                                                        selectedDoc?.id === doc.id ? 'text-white' : 'text-gray-400'
                                                                    }`} />
                                                                    <span className="line-clamp-2">{doc.title}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </nav>
                                    </div>
                                </aside>

                                <div className="lg:col-span-3">
                                    {selectedDoc ? (
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                            <div className="p-6 border-b border-gray-100">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                    {selectedDoc.title}
                                                </h2>
                                                {selectedDoc.description && (
                                                    <p className="text-gray-600 mb-4">{selectedDoc.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {selectedDoc.year}
                                                    </span>
                                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                                        {selectedDoc.category}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative bg-gray-100" style={{ height: '800px' }}>
                                                <object
                                                    data={`${selectedDoc.pdf_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                                                    type="application/pdf"
                                                    className="w-full h-full"
                                                    aria-label={selectedDoc.title}
                                                >
                                                    <embed
                                                        src={`${selectedDoc.pdf_url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                                                        type="application/pdf"
                                                        className="w-full h-full"
                                                    />
                                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                                        <FileText className="w-16 h-16 text-gray-400 mb-4" />
                                                        <p className="text-gray-600 mb-4">
                                                            Browser Anda tidak mendukung preview PDF.
                                                        </p>
                                                        <a
                                                            href={selectedDoc.pdf_url}
                                                            download
                                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-darker transition-colors"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                            Download PDF
                                                        </a>
                                                    </div>
                                                </object>
                                            </div>

                                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                                <a
                                                    href={selectedDoc.pdf_url}
                                                    download
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-darker transition-colors shadow-lg shadow-primary/25"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    Download PDF
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Pilih dokumen dari sidebar untuk melihat</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
