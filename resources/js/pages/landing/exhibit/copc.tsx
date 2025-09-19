import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

interface CopcContent {
    hero_image?: string;
    hero_title: string;
    hero_subtitle: string;
    section_title: string;
    program1_image?: string;
    program1_title: string;
    program1_document?: string;
    program2_image?: string;
    program2_title: string;
    program2_document?: string;
    program3_image?: string;
    program3_title: string;
    program3_document?: string;
    footer_section_title: string;
    footer_image?: string;
}

interface Props {
    copcContent: CopcContent;
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
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    setHasAnimated(true);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        
        return () => { 
            if (currentRef) observer.unobserve(currentRef); 
        };
    }, [hasAnimated]);
    
    return [ref, isVisible, scrollDirection] as const;
}

export default function Copc({ copcContent }: Props) {
    // State for selected program and document preview
    const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [currentPage] = useState(1);
    const setTotalPages = useState(1)[1];
    const [zoom] = useState(0.9);
    const [rotate] = useState(0);

    // Hero Section Data
    const heroImageUrl = copcContent.hero_image || "https://via.placeholder.com/1600/500/7f0404/ffffff?text=COPC+Hero+Image";
    
    // Footer Section Data  
    const footerImageUrl = copcContent.footer_image || "https://via.placeholder.com/1600/400/7f0404/ffffff?text=Footer+Background";

    // Programs data
    const programs = useMemo(() => [
        {
            id: 1,
            title: copcContent.program1_title,
            image: copcContent.program1_image || "https://via.placeholder.com/600/400/7f0404/ffffff?text=Program+1",
            document: copcContent.program1_document
        },
        {
            id: 2,
            title: copcContent.program2_title,
            image: copcContent.program2_image || "https://via.placeholder.com/600/400/7f0404/ffffff?text=Program+2",
            document: copcContent.program2_document
        },
        {
            id: 3,
            title: copcContent.program3_title,
            image: copcContent.program3_image || "https://via.placeholder.com/600/400/7f0404/ffffff?text=Program+3",
            document: copcContent.program3_document
        }
    ], [copcContent]);

    // Initialize PDF loading when program is selected
    useEffect(() => {
        if (selectedProgram !== null) {
            const program = programs.find(p => p.id === selectedProgram);
            if (program?.document && isPDF(program.document) && !pdfLoaded) {
                setPdfLoaded(true);
            }
        }
    }, [selectedProgram, pdfLoaded, programs]);

    // Document Display Component
    const DocumentDisplay = useCallback(({ document }: { document?: string }) => {
        // Check if we have a real document (not placeholder)
        const hasRealDocument = document && !document.includes('placeholder');
        
        if (!hasRealDocument) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-xl border border-gray-200">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No document uploaded</p>
                        <p className="text-gray-400 text-sm">Upload a document via the admin panel</p>
                    </div>
                </div>
            );
        }

        if (isPDF(document) && pdfLoaded) {
            return (
                <div className="w-full">
                    <div className="w-full max-w-4xl mx-auto rounded-xl border border-gray-200 overflow-hidden" style={{ height: '800px' }}>
                        <PdfViewer
                            url={document}
                            currentPage={currentPage}
                            onTotalPagesChange={setTotalPages}
                            zoom={zoom}
                            rotate={rotate}
                            className="w-full h-full"
                        />
                    </div>
                    <div className="mt-4 text-center">
                        <a
                            href={document}
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
        } else if (isPDF(document) && !pdfLoaded) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-xl border border-gray-200">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#7F0404] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading PDF...</p>
                    </div>
                </div>
            );
        }

        if (isImage(document)) {
            return (
                <div className="w-full max-w-4xl mx-auto bg-gray-50 flex items-center justify-center rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: '400px' }}>
                    <img
                        src={document}
                        alt="Document"
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
                    <p className="text-gray-500 text-sm mb-4">Click to download: {getFileExtension(document).toUpperCase()} file</p>
                    <a
                        href={document}
                        download
                        className="inline-flex items-center px-4 py-2 bg-[#7F0404] text-white rounded hover:bg-[#4D1414] transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Document
                    </a>
                </div>
            </div>
        );
    }, [pdfLoaded, currentPage, setTotalPages, zoom, rotate]);
    
    // Animation hooks for different sections
    const [heroRef, heroVisible] = useScrollAnimation();
    const [programsRef, programsVisible] = useScrollAnimation();
    const [documentRef, documentVisible] = useScrollAnimation();

    // Force animation visibility for document section when program is selected
    const [forceDocumentVisible, setForceDocumentVisible] = useState(false);

    // Effect to trigger document animation when a program is selected
    useEffect(() => {
        if (selectedProgram) {
            // Force document section to be visible
            setForceDocumentVisible(true);
            // Scroll to document section when a program is selected
            setTimeout(() => {
                documentRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        } else {
            setForceDocumentVisible(false);
        }
    }, [selectedProgram, documentRef]);

    // Combined visibility state for document section
    const documentSectionVisible = documentVisible || forceDocumentVisible;

    return (
        <>
            <Head title="COPC" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="exhibit" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section */}
                    <section 
                        ref={heroRef}
                        className={`relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[450px] overflow-hidden transition-all duration-1000 ${
                            heroVisible 
                                ? 'opacity-100 transform translate-y-0' 
                                : 'opacity-0 transform translate-y-8'
                        }`}
                    >
                        <img
                            src={heroImageUrl}
                            alt="COPC Hero"
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
                                {copcContent.hero_title}
                            </h1>
                            <p className={`text-xl sm:text-2xl md:text-3xl text-white/90 max-w-2xl mx-auto transition-all duration-1000 delay-500 ${
                                heroVisible 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-12'
                            }`}>
                                {copcContent.hero_subtitle}
                            </p>
                        </div>
                    </section>

                    {/* Programs Selection Section - Only show when no program is selected */}
                    {!selectedProgram && (
                        <section
                            ref={programsRef}
                            className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                                programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                            }`}
                            style={{ 
                                background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                            }}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primaryMaroon} 2px, transparent 2px)`,
                                    backgroundSize: '50px 50px'
                                }}></div>
                            </div>
                            <div className="w-full max-w-7xl mx-auto relative z-10">
                                <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16" style={{ color: COLORS.primaryMaroon }}>
                                    {copcContent.section_title}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {programs.map((program, idx) => (
                                        <button
                                            key={program.id}
                                            onClick={() => {
                                                setSelectedProgram(program.id);
                                                setPdfLoaded(false);
                                            }}
                                            className={`group block bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                                                programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                            }`}
                                            style={{
                                                borderTopColor: COLORS.primaryMaroon,
                                                transitionDelay: `${idx * 0.12}s`
                                            }}
                                        >
                                            <div className="relative overflow-hidden">
                                                <img
                                                    src={program.image}
                                                    alt={program.title}
                                                    className="w-full h-[260px] object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            <div className="p-8">
                                                <h3 className="text-2xl font-bold mb-4 transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                    {program.title}
                                                </h3>
                                                <span className="inline-block px-6 py-2 rounded-lg font-bold text-white transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: COLORS.primaryMaroon }}>
                                                    View Document
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Document Preview Section - Only show when a program is selected */}
                    {selectedProgram && (
                        <section 
                            ref={documentRef}
                            className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white transition-all duration-1000 ${
                                documentSectionVisible 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-12'
                            }`}
                        >
                            <div className="w-full max-w-4xl mx-auto">
                                {/* Back Button - Outside the card */}
                                <div className="mb-8">
                                    <button
                                        onClick={() => {
                                            setSelectedProgram(null);
                                            setPdfLoaded(false);
                                        }}
                                        className="flex items-center px-6 py-3 bg-[#7F0404] text-white rounded-lg hover:bg-[#6B0303] transition-all duration-300 group font-semibold"
                                    >
                                        <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Programs
                                    </button>
                                </div>
                                
                                {/* Main Card Container */}
                                <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-t-4 transition-all duration-1000 delay-200 ${
                                    documentSectionVisible 
                                        ? 'opacity-100 transform translate-y-0 scale-100' 
                                        : 'opacity-0 transform translate-y-8 scale-95'
                                }`} style={{ borderTopColor: COLORS.primaryMaroon }}>
                                    <div className="p-8 sm:p-12 flex flex-col items-center">
                                        {/* Title Container */}
                                        <div className="w-full mb-8 sm:mb-12">
                                            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center transition-all duration-1000 delay-400 ${
                                                documentSectionVisible 
                                                    ? 'opacity-100 transform translate-y-0' 
                                                    : 'opacity-0 transform translate-y-8'
                                            }`} style={{ color: COLORS.primaryMaroon }}>
                                                {programs.find(p => p.id === selectedProgram)?.title}
                                            </h2>
                                        </div>
                                        {/* Document Display with PDF Support */}
                                        <div className={`w-full flex justify-center items-center transition-all duration-1000 delay-600 ${
                                            documentSectionVisible 
                                                ? 'opacity-100 transform translate-y-0 scale-100' 
                                                : 'opacity-0 transform translate-y-8 scale-95'
                                        }`}>
                                            <DocumentDisplay document={programs.find(p => p.id === selectedProgram)?.document} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer Section */}
                <section className="relative py-16 sm:py-20 lg:py-24 px-0 transition-all duration-1200">
                    <div className="absolute inset-0 w-full h-full">
                        <img
                            src={footerImageUrl}
                            alt={copcContent.footer_section_title}
                            className="w-full h-full object-cover object-center opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                            {copcContent.footer_section_title}
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
