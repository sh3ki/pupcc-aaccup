import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PdfViewer from '@/components/PdfViewer';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

// Helper functions moved outside component to avoid re-creation
const getFileExtension = (url: string) => {
    if (!url) return '';
    return url.split('.').pop()?.toLowerCase() || '';
};

const isPDF = (url: string) => {
    const extension = getFileExtension(url);
    return extension === 'pdf';
};

const isImage = (url: string) => {
    const extension = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
};

interface ChedMemorandumOrderContent {
    hero_image?: string;
    hero_title: string;
    hero_subtitle: string;
    section_title: string;
    memorandum_document?: string;
    footer_section_title: string;
    footer_image?: string;
}

interface Props {
    chedMemorandumOrderContent: ChedMemorandumOrderContent;
}

function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [lastScrollY, setLastScrollY] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setIsVisible(true);
                    setHasAnimated(true);
                } else if (!entry.isIntersecting && hasAnimated) {
                    setTimeout(() => {
                        setIsVisible(false);
                        setHasAnimated(false);
                    }, 100);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );
        
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        
        return () => { 
            if (currentRef) observer.unobserve(currentRef); 
        };
    }, [hasAnimated]);
    
    return [ref, isVisible, scrollDirection] as const;
}

export default function ChedMemorandumOrder({ chedMemorandumOrderContent }: Props) {
    // Use proper placeholder URLs that actually work
    const memorandumUrl = chedMemorandumOrderContent.memorandum_document || "https://via.placeholder.com/900x1200/f3f4f6/6b7280?text=Memorandum+Preview";
    
    // Hero Section Data
    const heroImageUrl = chedMemorandumOrderContent.hero_image || "https://via.placeholder.com/1600x500/7f0404/ffffff?text=CHED+Memorandum+Order+Hero+Image";
    
    // Footer Section Data  
    const footerImageUrl = chedMemorandumOrderContent.footer_image || "https://via.placeholder.com/1600x400/7f0404/ffffff?text=Footer+Background";

    // PDF state - initialize once and persist
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [currentPage] = useState(1);
    const setTotalPages = useState(1)[1];
    const [zoom] = useState(0.9);
    const [rotate] = useState(0);

    // Initialize PDF loading once on component mount
    useEffect(() => {
        if (chedMemorandumOrderContent.memorandum_document && isPDF(chedMemorandumOrderContent.memorandum_document) && !pdfLoaded) {
            setPdfLoaded(true);
        }
    }, [chedMemorandumOrderContent.memorandum_document, pdfLoaded]);

    // Memorandum Display Component - moved outside of animation effects
    const MemorandumDisplay = useCallback(() => {
        // Check if we have a real memorandum (not placeholder)
        const hasRealMemorandum = chedMemorandumOrderContent.memorandum_document && 
                                  !chedMemorandumOrderContent.memorandum_document.includes('placeholder');
        
        if (!hasRealMemorandum) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-xl border border-gray-200">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No memorandum uploaded</p>
                        <p className="text-gray-400 text-sm">Upload a memorandum via the admin panel</p>
                    </div>
                </div>
            );
        }

        if (isPDF(chedMemorandumOrderContent.memorandum_document || '') && pdfLoaded) {
            return (
                <div className="w-full">
                    {/* PDF Display using PdfViewer component - only render when pdfLoaded is true */}
                    <div className="w-full max-w-4xl mx-auto rounded-xl border border-gray-200 overflow-hidden" style={{ height: '800px' }}>
                        <PdfViewer
                            url={chedMemorandumOrderContent.memorandum_document || ''}
                            currentPage={currentPage}
                            onTotalPagesChange={setTotalPages}
                            zoom={zoom}
                            rotate={rotate}
                            className="w-full h-full"
                        />
                    </div>
                    
                    {/* Fallback link if PDF viewer doesn't work */}
                    <div className="mt-4 text-center">
                        <a
                            href={chedMemorandumOrderContent.memorandum_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-[#7F0404] text-white rounded-lg hover:bg-[#5a0303] transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </a>
                    </div>
                </div>
            );
        } else if (isPDF(chedMemorandumOrderContent.memorandum_document || '') && !pdfLoaded) {
            // Show loading state for PDF
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-xl border border-gray-200">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#7F0404] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading PDF...</p>
                    </div>
                </div>
            );
        }

        if (isImage(chedMemorandumOrderContent.memorandum_document || '')) {
            return (
                <div className="w-full max-w-4xl mx-auto bg-gray-50 flex items-center justify-center rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: '400px' }}>
                    <img
                        src={chedMemorandumOrderContent.memorandum_document}
                        alt="Memorandum"
                        className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                        style={{ maxHeight: '800px', width: 'auto' }}
                    />
                </div>
            );
        }

        // For other file types (DOCX, etc.)
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-xl border border-gray-200">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">Document Available</p>
                    <p className="text-gray-500 text-sm mb-4">Click to download: {getFileExtension(memorandumUrl).toUpperCase()} file</p>
                    <a
                        href={memorandumUrl}
                        download
                        className="inline-flex items-center px-4 py-2 bg-[#7F0404] text-white rounded hover:bg-[#4D1414] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Memorandum
                    </a>
                </div>
            </div>
        );
    }, [chedMemorandumOrderContent.memorandum_document, pdfLoaded, currentPage, setTotalPages, zoom, rotate, memorandumUrl]);
    
    // Animation hooks for different sections
    const [heroRef, heroVisible] = useScrollAnimation();
    const [memorandumRef, memorandumVisible] = useScrollAnimation();

    return (
        <>
            <Head title="CHED Memorandum Order" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="exhibit" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section */}
                    <section 
                        ref={heroRef}
                        className={`relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden transition-all duration-1000 ${
                            heroVisible 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform translate-y-8'
                        }`}
                    >
                        <img
                            src={heroImageUrl}
                            alt="Memorandum Hero"
                            className={`w-full h-full object-cover transition-transform duration-1000 ${
                                heroVisible ? 'scale-100' : 'scale-95'
                            } hover:scale-105`}
                            style={{ minHeight: 400, maxHeight: 700 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg transition-all duration-1000 delay-300 ${
                                heroVisible 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-12'
                            }`}>
                                {chedMemorandumOrderContent.hero_title}
                            </h1>
                            <p className={`text-xl sm:text-2xl md:text-3xl text-white/90 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${
                                heroVisible 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-12'
                            }`}>
                                {chedMemorandumOrderContent.hero_subtitle}
                            </p>
                        </div>
                    </section>

                    {/* Memorandum Display */}
                    <section 
                        ref={memorandumRef}
                        className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white transition-all duration-1000 ${
                            memorandumVisible 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform translate-y-12'
                        }`}
                    >
                        <div className="w-full max-w-4xl mx-auto">
                            <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-t-4 transition-all duration-1000 delay-200 ${
                                memorandumVisible 
                                    ? 'opacity-100 transform translate-y-0 scale-100' 
                                    : 'opacity-0 transform translate-y-8 scale-95'
                            }`} style={{ borderTopColor: COLORS.primaryMaroon }}>
                                <div className="p-8 sm:p-12 flex flex-col items-center">
                                    <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 text-center transition-all duration-1000 delay-400 ${
                                        memorandumVisible 
                                            ? 'opacity-100 transform translate-y-0' 
                                            : 'opacity-0 transform translate-y-8'
                                    }`} style={{ color: COLORS.primaryMaroon }}>
                                        {chedMemorandumOrderContent.section_title}
                                    </h2>
                                    {/* Memorandum Display with PDF Support */}
                                    <div className={`w-full flex justify-center items-center transition-all duration-1000 delay-600 ${
                                        memorandumVisible 
                                            ? 'opacity-100 transform translate-y-0 scale-100' 
                                            : 'opacity-0 transform translate-y-8 scale-95'
                                    }`}>
                                        <MemorandumDisplay />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Mula Sayo, Para Sa Bayan Section */}
                <section className="relative py-16 sm:py-20 lg:py-24 px-0 transition-all duration-1200">
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src={footerImageUrl}
                            alt={chedMemorandumOrderContent.footer_section_title}
                            className="w-full h-full object-cover object-center opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                            {chedMemorandumOrderContent.footer_section_title}
                        </h2>
                    </div>
                </section>

                <Footer />
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
            `}</style>
        </>
    );
}
