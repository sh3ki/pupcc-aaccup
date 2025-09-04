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

interface BorContent {
    hero_image?: string;
    hero_title: string;
    hero_subtitle: string;
    section_title: string;
    bor_document?: string;
    footer_section_title: string;
    footer_image?: string;
}

interface Props {
    borContent: BorContent;
}

function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [lastScrollY, setLastScrollY] = useState(0);

    const elementRef = useRef<HTMLDivElement>(null);

    const checkVisibility = useCallback(() => {
        if (!elementRef.current) return;

        const rect = elementRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;

        // Element is visible when it enters the viewport
        const elementVisible = elementTop < windowHeight && (elementTop + elementHeight) > 0;

        // Determine scroll direction
        const currentScrollY = window.scrollY;
        const newScrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        setScrollDirection(newScrollDirection);
        setLastScrollY(currentScrollY);

        if (elementVisible && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);
        }
    }, [hasAnimated, lastScrollY]);

    useEffect(() => {
        // Check visibility on mount
        checkVisibility();

        // Add scroll listener
        window.addEventListener('scroll', checkVisibility);
        window.addEventListener('resize', checkVisibility);

        return () => {
            window.removeEventListener('scroll', checkVisibility);
            window.removeEventListener('resize', checkVisibility);
        };
    }, [checkVisibility]);

    return { isVisible, elementRef, scrollDirection };
}

export default function Bor({ borContent }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [zoom, setZoom] = useState(0.8);
    const [rotate, setRotate] = useState(0);

    const heroAnimation = useScrollAnimation();
    const documentAnimation = useScrollAnimation();
    const footerAnimation = useScrollAnimation();

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleTotalPagesChange = (total: number) => {
        setTotalPages(total);
    };

    const handleZoomChange = (newZoom: number) => {
        const clampedZoom = Math.max(0.1, Math.min(3, newZoom));
        setZoom(clampedZoom);
    };

    const handleRotate = () => {
        setRotate((prev) => (prev + 90) % 360);
    };

    return (
        <>
            <Head title="BOR - Board of Regents" />
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <Header />

                {/* Hero Section */}
                <section 
                    ref={heroAnimation.elementRef}
                    className={`relative min-h-[70vh] flex items-center justify-center py-20 px-4 transition-all duration-1000 ${
                        heroAnimation.isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                        background: borContent.hero_image
                            ? `linear-gradient(135deg, rgba(127, 4, 4, 0.85) 0%, rgba(77, 20, 20, 0.85) 50%, rgba(196, 107, 2, 0.85) 100%), url(${borContent.hero_image})`
                            : `linear-gradient(135deg, ${COLORS.primaryMaroon} 0%, ${COLORS.darkMaroon} 50%, ${COLORS.burntOrange} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                    }}
                >
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="relative z-10 text-center text-white max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-wide drop-shadow-lg">
                            {borContent.hero_title}
                        </h1>
                        <p className="text-xl md:text-2xl leading-relaxed opacity-90 drop-shadow-md">
                            {borContent.hero_subtitle}
                        </p>
                    </div>
                </section>

                {/* Document Section */}
                {borContent.bor_document && (
                    <section 
                        ref={documentAnimation.elementRef}
                        className={`py-20 px-4 bg-white transition-all duration-1000 delay-300 ${
                            documentAnimation.isVisible 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-8'
                        }`}
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                    {borContent.section_title}
                                </h2>
                                <div className="w-24 h-1 mx-auto" style={{ backgroundColor: COLORS.burntOrange }}></div>
                            </div>

                            {isPDF(borContent.bor_document) ? (
                                <div className="bg-gray-50 rounded-lg shadow-2xl overflow-hidden">
                                    {/* PDF Controls */}
                                    <div className="bg-gray-800 text-white p-4 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage <= 1}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleZoomChange(zoom - 0.1)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                                            >
                                                Zoom Out
                                            </button>
                                            <span className="text-sm">{Math.round(zoom * 100)}%</span>
                                            <button
                                                onClick={() => handleZoomChange(zoom + 0.1)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                                            >
                                                Zoom In
                                            </button>
                                            <button
                                                onClick={handleRotate}
                                                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                                            >
                                                Rotate
                                            </button>
                                        </div>
                                    </div>

                                    {/* PDF Viewer */}
                                    <div className="h-[800px]">
                                        <PdfViewer
                                            url={borContent.bor_document}
                                            currentPage={currentPage}
                                            onTotalPagesChange={handleTotalPagesChange}
                                            zoom={zoom}
                                            rotate={rotate}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                            ) : isImage(borContent.bor_document) ? (
                                <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl mx-auto">
                                    <img
                                        src={borContent.bor_document}
                                        alt="BOR Document"
                                        className="w-full h-auto"
                                    />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-600 mb-4">Document available for download:</p>
                                    <a
                                        href={borContent.bor_document}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-6 py-3 text-white rounded-lg transition-colors"
                                        style={{ backgroundColor: COLORS.primaryMaroon }}
                                    >
                                        Download BOR Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Footer Section */}
                <section 
                    ref={footerAnimation.elementRef}
                    className={`py-20 px-4 transition-all duration-1000 delay-600 ${
                        footerAnimation.isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                        background: borContent.footer_image
                            ? `linear-gradient(135deg, rgba(127, 4, 4, 0.9) 0%, rgba(196, 107, 2, 0.9) 100%), url(${borContent.footer_image})`
                            : `linear-gradient(135deg, ${COLORS.primaryMaroon} 0%, ${COLORS.burntOrange} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
                            {borContent.footer_section_title}
                        </h2>
                        <div className="w-24 h-1 mx-auto" style={{ backgroundColor: COLORS.softYellow }}></div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
