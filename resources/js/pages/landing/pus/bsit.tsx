import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRef, useEffect, useState, useMemo, memo } from 'react';
import { DocumentNavigation } from '@/components/DocumentNavigation';
import { DocumentCardGrid } from '@/components/DocumentCardGrid';
import PdfViewer from '@/components/PdfViewer';
import VideoViewer, { VideoPlayerRef } from '@/components/VideoViewer';
import { VideoNavigation } from '@/components/VideoNavigation';
import PDFThumbnail from '@/components/PDFThumbnail';
import OptimizedImage from '@/components/OptimizedImage';
import { useScrollAnimation as useOptimizedScrollAnimation, getAnimationClasses } from '@/hooks/useOptimizedIntersection';
import { preloadProgramResources } from '@/utils/resourcePreloader';

const COLORS = {
    primaryMaroon: '#7F0404',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    darkMaroon: '#4D1414',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface GraduateItem {
    name: string;
    video: string;
    video_type: 'youtube' | 'upload';
}

// Document management types - match admin structure
type Parameter = { 
    id: number; 
    name: string; 
    code?: string; 
    approved_count?: number; 
    category_approved_counts?: Record<string, number> 
};

type Area = { 
    id: number; 
    name: string; 
    code?: string; 
    parameters?: Parameter[];
    approved_count?: number;
};

type Program = { 
    id: number; 
    name: string; 
    code?: string; 
    areas: Area[];
    approved_count?: number;
};

interface AccreditationArea {
    title: string;
    image: string;
    id?: number;
    name?: string;
    code?: string;
    parameters?: Parameter[];
    approved_count?: number;
}

type DocumentItem = {
    id: number;
    filename: string;
    url: string;
    uploaded_at: string;
    user_name?: string;
    approved_by?: string;
    approved_at?: string;
    updated_at?: string;
    parameter_id?: number;
    category?: string;
};

interface BsitContent {
    hero_image: string;
    hero_title: string;
    hero_subtitle: string;
    overview_section_title: string;
    program_description: string;
    program_image: string;
    objectives_section_title: string;
    objectives_data: string[];
    avp_section_title: string;
    program_video: string;
    program_video_type: 'youtube' | 'upload';
    action_section_title: string;
    action_images: string[];
    graduates_section_title: string;
    graduates_data: GraduateItem[];
    accreditation_section_title: string;
    accreditation_areas: AccreditationArea[];
    mula_sayo_title: string;
    mula_sayo_image: string;
}

interface Props {
    bsitContent: BsitContent;
    accreditationAreas?: AccreditationArea[];
    // Match admin panel structure
    sidebar?: Program[];
}

// Memoized components for better performance
const OptimizedActionImage = memo(({ img, idx, isVisible }: { img: string; idx: number; isVisible: boolean }) => (
    <div 
        className={`group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
        style={{ transitionDelay: `${idx * 0.1}s` }}
    >
        <OptimizedImage 
            src={img}
            alt={`Action Image ${idx + 1}`}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
            lazy={idx > 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
    </div>
));
OptimizedActionImage.displayName = 'OptimizedActionImage';

const OptimizedGraduateCard = memo(({ graduate, index, isVisible }: { 
    graduate: GraduateItem; 
    index: number; 
    isVisible: boolean; 
}) => (
    <div 
        className={`group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
        style={{ transitionDelay: `${index * 0.2}s` }}
    >
        <div className="flex flex-col items-center">
            <div className="w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-2 group-hover:shadow-xl transition-shadow duration-300" style={{ height: 280 }}>
                {graduate.video_type === 'youtube' ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${graduate.video}`}
                        title={graduate.name}
                        frameBorder={0}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        loading={index > 2 ? "lazy" : "eager"}
                    ></iframe>
                ) : (
                    <video
                        src={typeof graduate.video === 'string' ? graduate.video : ''}
                        controls
                        className="w-full h-full object-cover"
                        preload={index > 2 ? "none" : "metadata"}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
            <span className="font-semibold text-lg transition-colors duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                {graduate.name}
            </span>
        </div>
    </div>
));
OptimizedGraduateCard.displayName = 'OptimizedGraduateCard';

const OptimizedAccreditationArea = memo(({ area, index, isVisible, availableAreas, onDocumentClick }: { 
    area: AccreditationArea; 
    index: number; 
    isVisible: boolean;
    availableAreas: Area[];
    onDocumentClick: (areaId: number) => void;
}) => {
    const correspondingDocArea = availableAreas.find(docArea => 
        docArea.name?.toLowerCase().includes(area.title?.toLowerCase()?.replace(/area\s+[ivx]+:\s*/i, '')) ||
        area.title?.toLowerCase().includes(docArea.name?.toLowerCase())
    );

    return (
        <div 
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-t-4 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
            style={{ 
                borderTopColor: COLORS.primaryMaroon, 
                transitionDelay: `${index * 0.1}s` 
            }}
        >
            <OptimizedImage 
                src={area.image || '/api/placeholder/300/200'}
                alt={area.title} 
                className="w-full h-28 object-cover transition-transform duration-500 group-hover:scale-110"
                lazy={index > 4}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="p-4 flex flex-col items-center">
                <h3 className="text-base font-bold text-center mb-2 transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                    {area.title}
                </h3>
                
                {correspondingDocArea && (
                    <button 
                        className="px-4 py-1 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ backgroundColor: COLORS.primaryMaroon }}
                        onClick={() => onDocumentClick(correspondingDocArea.id)}
                    >
                        View Documents
                    </button>
                )}
            </div>
        </div>
    );
});
OptimizedAccreditationArea.displayName = 'OptimizedAccreditationArea';

export default function BSITProgramPage({ bsitContent, accreditationAreas, sidebar }: Props) {
    // Debug: Log the accreditation areas data
    console.log('BSIT bsitContent.accreditation_areas:', bsitContent.accreditation_areas);
    console.log('BSIT accreditationAreas prop:', accreditationAreas);
    
    // Preload critical resources on component mount
    useEffect(() => {
        if (bsitContent) {
            preloadProgramResources(bsitContent);
        }
    }, [bsitContent]);
    
    // Scroll direction tracking
    const [scrollDirection, setScrollDirection] = useState('down');
    const [lastScrollY, setLastScrollY] = useState(0);
    
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);
    
    // Use optimized scroll animations
    const overviewAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const objectivesAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const avpAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const actionAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const graduatesAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const areasAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -100px 0px',
        triggerOnce: false
    });

    // Document Management State - exactly like BTLED
    const [documentMode, setDocumentMode] = useState(false);
    const [selected, setSelected] = useState<{ 
        areaId?: number; 
        parameterId?: number; 
        category?: string 
    }>({});
    
    // Document states
    const [approvedDocs, setApprovedDocs] = useState<DocumentItem[]>([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [viewingDocIndex, setViewingDocIndex] = useState<number | null>(null);
    
    // Store fetched data - use sidebar data if available, fallback to accreditationAreas
    const [fetchedAreas, setFetchedAreas] = useState<Area[]>([]);

    // PDF Navigation state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [fitMode, setFitMode] = useState<'width' | 'height' | null>(null);
    const [rotate, setRotate] = useState(0);
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(0.9);
    const [gridOpen, setGridOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Video Navigation state  
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoPlayerRef = useRef<VideoPlayerRef>(null);

    // Helper: category list
    const categoryList = [
        { value: 'system', label: 'System' },
        { value: 'implementation', label: 'Implementation' },
        { value: 'outcomes', label: 'Outcomes' },
    ];

    // Use sidebar data if available, otherwise fallback to fetched data
    // Since we only have BSIT program, get the first (and only) program from sidebar
    const bsitProgram = sidebar?.[0];
    const availableAreas = useMemo(() => {
        // Prioritize bsitProgram areas (from backend)
        if (bsitProgram?.areas && bsitProgram.areas.length > 0) {
            return bsitProgram.areas;
        }
        // Then use fetched areas
        if (fetchedAreas && fetchedAreas.length > 0) {
            return fetchedAreas;
        }
        // Finally fall back to accreditationAreas, convert to Area type
        if (accreditationAreas && accreditationAreas.length > 0) {
            return accreditationAreas.map(area => ({
                id: area.id || 0,
                name: area.name || area.title,
                code: area.code,
                parameters: area.parameters,
                approved_count: area.approved_count
            }));
        }
        return [];
    }, [bsitProgram?.areas, fetchedAreas, accreditationAreas]);
    
    const selectedArea = availableAreas.find(a => a.id === selected.areaId);

    // Remove the parameter fetching logic - use sidebar data directly like admin
    // No separate parameter fetching needed

    // Fetch approved documents - EXACTLY like admin panel
    useEffect(() => {
        // Only fetch when all three are selected: area, parameter, and category
        if (selected.areaId && selected.parameterId && selected.category) {
            setLoadingDocs(true);
            
            // Use same URL pattern as admin: /programs/bsit/documents with query params
            fetch(`/programs/bsit/documents?area_id=${selected.areaId}&parameter_id=${selected.parameterId}&category=${selected.category}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setApprovedDocs(data.documents || []);
                        setViewerIndex(0);
                    } else {
                        setApprovedDocs([]);
                    }
                    setLoadingDocs(false);
                    setViewingDocIndex(null); // Reset document viewing
                })
                .catch(error => {
                    console.error('Error fetching documents:', error);
                    setApprovedDocs([]);
                    setLoadingDocs(false);
                });
        } else {
            // Clear documents when navigation changes
            setApprovedDocs([]);
            setViewerIndex(0);
        }
    }, [selected.areaId, selected.parameterId, selected.category]);

    // Sync bsitProgram areas to state when sidebar data loads - like admin
    useEffect(() => {
        if (bsitProgram?.areas && bsitProgram.areas.length > 0) {
            setFetchedAreas(bsitProgram.areas);
        } else if (accreditationAreas && accreditationAreas.length > 0) {
            setFetchedAreas(
                accreditationAreas.map(area => ({
                    id: area.id || 0,
                    name: area.name || area.title,
                    code: area.code,
                    parameters: area.parameters,
                    approved_count: area.approved_count
                }))
            );
        }
    }, [bsitProgram?.areas, accreditationAreas]);    // Navigation functions - like admin
    const filteredDocs = useMemo(() => {
        let docs = approvedDocs;
        // Filter by current parameter and category if both are selected
        if (selected.parameterId && selected.category) {
            docs = docs.filter(doc =>
                doc.parameter_id === selected.parameterId &&
                doc.category === selected.category
            );
        }
        return docs;
    }, [approvedDocs, selected.parameterId, selected.category]);

    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === approvedDocs[viewerIndex]?.id);
    const currentDoc = filteredDocs[filteredViewerIndex >= 0 ? filteredViewerIndex : 0];

    // Reset viewingDocIndex when navigation changes - like admin
    useEffect(() => {
        setViewingDocIndex(null);
        setCurrentPage(1);
        setTotalPages(1);
        setRotate(0);
        setZoom(0.9);
        setFitMode(null);
    }, [selected.areaId, selected.parameterId, selected.category]);

    // Document viewer handlers
    const handleDownload = () => {
        if (!currentDoc) return;
        const link = document.createElement('a');
        link.href = currentDoc.url;
        link.download = currentDoc.filename;
        link.click();
    };

    const handleRotate = (dir: 'left' | 'right') => {
        setRotate(r => (dir === 'left' ? (r - 90 + 360) % 360 : (r + 90) % 360));
    };

    const toggleFitMode = () => {
        setFitMode(f => {
            if (f === null) {
                setZoom(1.0);
                return 'width';
            } else if (f === 'width') {
                setZoom(0.5);
                return 'height';
            } else {
                setZoom(0.9);
                return null;
            }
        });
    };

    const handleZoom = (dir: 'in' | 'out') => {
        setZoom(z => {
            const newZoom = dir === 'in' ? Math.min(z + 0.1, 1.0) : Math.max(z - 0.1, 0.5);
            
            if (Math.abs(newZoom - 1.0) < 0.01) {
                setFitMode('width');
            } else if (Math.abs(newZoom - 0.5) < 0.01) {
                setFitMode('height');
            } else {
                setFitMode(null);
            }
            
            return newZoom;
        });
    };

    // Reset states when navigation changes
    useEffect(() => {
        setViewingDocIndex(null);
        setCurrentPage(1);
        setTotalPages(1);
        setRotate(0);
        setZoom(0.9);
        setFitMode(null);
    }, [selected.areaId, selected.parameterId, selected.category]);

    return (
        <>
            <Head title="Bachelor of Science in Information Technology (BSIT) - PUP Calapan Campus">
                {/* Critical resource hints for better performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link rel="dns-prefetch" href="//api.placeholder" />
                
                {/* Preload critical images */}
                {bsitContent?.hero_image && (
                    <link 
                        rel="preload" 
                        as="image" 
                        href={bsitContent.hero_image}
                        fetchPriority="high"
                    />
                )}
                {bsitContent?.program_image && (
                    <link 
                        rel="preload" 
                        as="image" 
                        href={bsitContent.program_image}
                        fetchPriority="high"
                    />
                )}
            </Head>
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="bsit-program" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <OptimizedImage
                            src={bsitContent.hero_image || '/api/placeholder/1600/600'}
                            alt={bsitContent.hero_title}
                            className="w-full h-full object-cover"
                            priority={true}
                            lazy={false}
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white animate-fade-in-up mb-4 drop-shadow-lg">
                                {bsitContent.hero_title}
                            </h1>
                            {bsitContent.hero_subtitle && (
                                <p className="text-lg sm:text-xl text-white/90 max-w-3xl px-4 drop-shadow-lg">
                                    {bsitContent.hero_subtitle}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Overview */}
                    <section
                        ref={overviewAnimation.ref}
                        className={`transition-all duration-1200 ${getAnimationClasses(overviewAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')}`}
                        style={{ 
                            background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                        }}
                    >
                        <div className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primaryMaroon} 2px, transparent 2px)`,
                                    backgroundSize: '50px 50px'
                                }}></div>
                            </div>
                            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-bold mb-6 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                        {bsitContent.overview_section_title}
                                    </h2>
                                    <p className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed">{bsitContent.program_description}</p>
                                </div>
                                <div className="flex-1">
                                    <OptimizedImage 
                                        src={bsitContent.program_image || '/api/placeholder/500/400'} 
                                        alt="BSIT Overview" 
                                        className="rounded-2xl shadow-lg w-full object-cover transition-transform duration-500 hover:scale-105"
                                        priority={true}
                                        lazy={false}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Objectives */}
                    <section
                        ref={objectivesAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 ${getAnimationClasses(objectivesAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')}`}
                    >
                        <div className="w-full max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.objectives_section_title}
                            </h2>
                            <ol className="list-decimal ml-6 space-y-3 text-lg text-gray-800">
                                {bsitContent.objectives_data && bsitContent.objectives_data.length > 0 ? (
                                    bsitContent.objectives_data.map((obj: string, idx: number) => (
                                        <li key={idx} className="leading-relaxed">{obj}</li>
                                    ))
                                ) : (
                                    <li>No objectives available</li>
                                )}
                            </ol>
                        </div>
                    </section>

                    {/* AVP Section */}
                    <section 
                        ref={avpAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white transition-all duration-1200 ${getAnimationClasses(avpAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')}`}
                    >
                        <div className="w-full max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.avp_section_title}
                            </h2>
                            <div className="w-full max-w-4xl mx-auto mb-4">
                                {bsitContent.program_video_type === 'youtube' ? (
                                    <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mx-auto group hover:shadow-xl transition-shadow duration-300" style={{ maxWidth: 800, height: 450 }}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${bsitContent.program_video}`}
                                            title="Program AVP"
                                            frameBorder={0}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <VideoNavigation
                                        currentVideo={{
                                            id: 2,
                                            filename: `bsit_program_avp.${bsitContent.program_video?.split('.').pop() || 'mp4'}`,
                                            url: bsitContent.program_video?.startsWith('http') || bsitContent.program_video?.startsWith('/storage/') 
                                                ? bsitContent.program_video 
                                                : `/storage/${bsitContent.program_video}`,
                                            uploaded_at: new Date().toISOString()
                                        }}
                                        onInfo={() => {
                                            console.log('BSIT Program AVP Video Info');
                                        }}
                                        onDownload={() => {
                                            const videoUrl = bsitContent.program_video?.startsWith('http') || bsitContent.program_video?.startsWith('/storage/') 
                                                ? bsitContent.program_video 
                                                : `/storage/${bsitContent.program_video}`;
                                            const link = document.createElement('a');
                                            link.href = videoUrl;
                                            link.download = `bsit_program_avp.${bsitContent.program_video?.split('.').pop() || 'mp4'}`;
                                            link.click();
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </section>                    {/* Program in Action */}
                    <section 
                        ref={actionAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative ${getAnimationClasses(actionAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')}`}
                        style={{ backgroundColor: '#f8fafc' }}
                    >
                        {/* Geometric Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-5" style={{ backgroundColor: COLORS.primaryMaroon }}></div>
                            <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 rounded-full opacity-5" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        </div>
                        
                        <div className="w-full max-w-6xl mx-auto relative z-10">
                            <h2 className="text-3xl text-center font-bold mb-6 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.action_section_title}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {bsitContent.action_images && bsitContent.action_images.length > 0 ? (
                                    bsitContent.action_images.map((img: string, idx: number) => (
                                        <OptimizedActionImage 
                                            key={idx} 
                                            img={img} 
                                            idx={idx} 
                                            isVisible={actionAnimation.isVisible}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 md:col-span-4 text-center text-gray-500">
                                        No action images available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Notable Graduates */}
                    <section 
                        ref={graduatesAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white transition-all duration-1200 relative ${getAnimationClasses(graduatesAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')}`}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(127, 4, 4, 0.05) 25%), 
                                                linear-gradient(-45deg, transparent 25%, rgba(196, 107, 2, 0.05) 25%),
                                                linear-gradient(45deg, transparent 75%, rgba(127, 4, 4, 0.05) 75%), 
                                                linear-gradient(-45deg, transparent 75%, rgba(196, 107, 2, 0.05) 75%)`,
                                backgroundSize: '40px 40px',
                                backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
                            }}></div>
                        </div>
                        
                        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
                            <h2 className="text-3xl font-bold mb-6 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.graduates_section_title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bsitContent.graduates_data && bsitContent.graduates_data.length > 0 ? (
                                    bsitContent.graduates_data.map((grad: GraduateItem, idx: number) => (
                                        <OptimizedGraduateCard
                                            key={idx}
                                            graduate={grad}
                                            index={idx}
                                            isVisible={graduatesAnimation.isVisible}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-gray-500">
                                        No graduates available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Accreditation Areas */}
                    <section
                        ref={areasAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative ${
                            getAnimationClasses(areasAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')
                        }`}
                        style={{ backgroundColor: '#f8fafc' }}
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-10" style={{ backgroundColor: COLORS.softYellow }}></div>
                        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full opacity-10" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        
                        <div className="w-full max-w-7xl mx-auto relative z-10">
                            <h2 className="text-3xl font-bold mb-8 text-center transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.accreditation_section_title}
                            </h2>
                            
                            {/* Toggle Button */}
                            <div className="flex justify-center mb-8">
                                <button
                                    onClick={() => setDocumentMode(!documentMode)}
                                    className="px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                    style={{ backgroundColor: documentMode ? COLORS.burntOrange : COLORS.primaryMaroon }}
                                >
                                    {documentMode ? 'View Areas Overview' : 'Access Documents'}
                                </button>
                            </div>
                            
                            {/* Show regular area cards when not in document mode */}
                            {!documentMode && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {/* First show content-based accreditation areas with images */}
                                    {bsitContent.accreditation_areas && bsitContent.accreditation_areas.length > 0 ? (
                                        bsitContent.accreditation_areas.map((area: AccreditationArea, idx: number) => (
                                            <OptimizedAccreditationArea
                                                key={`content-${idx}`}
                                                area={area}
                                                index={idx}
                                                isVisible={areasAnimation.isVisible}
                                                availableAreas={availableAreas}
                                                onDocumentClick={(areaId) => {
                                                    setDocumentMode(true);
                                                    setSelected({ areaId });
                                                }}
                                            />
                                        ))
                                    ) : availableAreas && availableAreas.length > 0 ? (
                                        availableAreas.map((area: Area, idx: number) => (
                                            <OptimizedAccreditationArea
                                                key={`area-${idx}`}
                                                area={{
                                                    title: area.name,
                                                    image: '/api/placeholder/300/200',
                                                    id: area.id,
                                                    name: area.name,
                                                    code: area.code,
                                                    parameters: area.parameters,
                                                    approved_count: area.approved_count
                                                }}
                                                index={idx}
                                                isVisible={areasAnimation.isVisible}
                                                availableAreas={availableAreas}
                                                onDocumentClick={(areaId) => {
                                                    setDocumentMode(true);
                                                    setSelected({ areaId });
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center text-gray-500">
                                            No accreditation areas available
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Document Management Interface */}
                            {documentMode && (
                                <div className="w-full">
                                    {/* Back button */}
                                    <div className="mb-6">
                                        <button
                                            className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                            style={{ backgroundColor: COLORS.burntOrange, color: 'white' }}
                                            onClick={() => {
                                                setDocumentMode(false);
                                                setSelected({});
                                                setViewingDocIndex(null);
                                            }}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back to Areas
                                        </button>
                                    </div>

                                    {/* Area selection */}
                                    {!selected.areaId && (
                                        <DocumentCardGrid
                                            items={availableAreas}
                                            getKey={area => area.id || 0}
                                            onCardClick={area => {
                                                setSelected({ areaId: area.id });
                                            }}
                                            renderCardContent={(area) => (
                                                <div className="p-5 flex flex-col h-full">
                                                    <div className="flex items-start mb-3">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                            style={{ backgroundColor: '#f1f5f9' }}>
                                                            <svg className="w-5 h-5" style={{ color: COLORS.primaryMaroon }} fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <h2 className="text-base font-bold" style={{ color: COLORS.primaryMaroon }}>
                                                            {area.name}
                                                        </h2>
                                                    </div>
                                                    <div className="flex-grow"></div>
                                                    <div className="mt-auto">
                                                        <div className="text-gray-600 mb-4">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-sm">Parameters:</span>
                                                                <span className="font-semibold">{area.parameters?.length || 0}</span>
                                                            </div>

                                                        </div>
                                                        <div className="pt-3 border-t border-gray-100 flex justify-end">
                                                            <div className="flex items-center text-xs font-medium group" style={{ color: COLORS.primaryMaroon }}>
                                                                <span>View Parameters</span>
                                                                <svg className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" 
                                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    )}

                                    {/* Parameter selection */}
                                    {selected.areaId && !selected.parameterId && (
                                        <div>
                                            
                                            
                                            {loadingDocs ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primaryMaroon }}></div>
                                                    <span className="ml-3 text-gray-600">Loading parameters...</span>
                                                </div>
                                            ) : selectedArea?.parameters && selectedArea.parameters.length > 0 ? (
                                                <DocumentCardGrid
                                                    items={selectedArea.parameters}
                                                    getKey={param => param.id}
                                                    gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
                                                    onCardClick={param => {
                                                        setSelected({ 
                                                            areaId: selected.areaId, 
                                                            parameterId: param.id 
                                                        });
                                                    }}
                                                    renderCardContent={(param) => {
                                                        // Get the area image from bsitContent.accreditation_areas or fallback
                                                        const areaImage = (() => {
                                                            if (bsitContent.accreditation_areas && bsitContent.accreditation_areas.length > 0) {
                                                                const matchingArea = bsitContent.accreditation_areas.find(area => 
                                                                    area.title?.toLowerCase().includes(selectedArea?.name?.toLowerCase() || '') ||
                                                                    selectedArea?.name?.toLowerCase().includes(area.title?.toLowerCase() || '')
                                                                );
                                                                return matchingArea?.image || '/api/placeholder/300/200';
                                                            }
                                                            return '/api/placeholder/300/200';
                                                        })();

                                                        return (
                                                            <>
                                                                <img 
                                                                    src={areaImage}
                                                                    alt={param.name} 
                                                                    className="w-full h-28 object-cover" 
                                                                    style={{ minHeight: 112, maxHeight: 112 }} 
                                                                />
                                                                <div className="p-4 flex flex-col items-center flex-grow">
                                                                    <h3 className="text-base font-bold text-center mb-2" style={{ color: COLORS.primaryMaroon }}>
                                                                        {param.code ? `${param.code} - ` : ''}
                                                                        {param.name}
                                                                    </h3>
                                                                    
                                                                    {/* Keep Categories and Approved Documents visible */}
                                                                    <div className="text-gray-600 mb-4 w-full">
                                                                        <div className="flex justify-between items-center mb-3">
                                                                          
                                                                        </div>
                                                                      
                                                                    </div>
                                                                    
                                                                    {/* Button identical to Areas button */}
                                                                    <button 
                                                                        className="px-4 py-1 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105 mt-auto"
                                                                        style={{ backgroundColor: COLORS.primaryMaroon }}
                                                                    >
                                                                        View Categories
                                                                    </button>
                                                                </div>
                                                            </>
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-center py-12 text-gray-500">
                                                    No parameters found for this area.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Category selection - Show when parameter is selected but no category */}
                                    {selected.areaId && selected.parameterId && !selected.category && (
                                        <div>
                                          
                                            <DocumentCardGrid
                                                items={categoryList}
                                                getKey={cat => cat.value}
                                                gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                                                onCardClick={cat => {
                                                    setSelected({
                                                        areaId: selected.areaId,
                                                        parameterId: selected.parameterId,
                                                        category: cat.value
                                                    });
                                                }}
                                                renderCardContent={(cat) => {
                                                    // Get the area image from bsitContent.accreditation_areas or fallback
                                                    const areaImage = (() => {
                                                        if (bsitContent.accreditation_areas && bsitContent.accreditation_areas.length > 0) {
                                                            const matchingArea = bsitContent.accreditation_areas.find(area => 
                                                                area.title?.toLowerCase().includes(selectedArea?.name?.toLowerCase() || '') ||
                                                                selectedArea?.name?.toLowerCase().includes(area.title?.toLowerCase() || '')
                                                            );
                                                            return matchingArea?.image || '/api/placeholder/300/200';
                                                        }
                                                        return '/api/placeholder/300/200';
                                                    })();

                                                    return (
                                                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
                                                            style={{ borderTopColor: COLORS.primaryMaroon, transitionDelay: `${cat.value.length * 0.1}s` }}>
                                                            <img 
                                                                src={areaImage}
                                                                alt={cat.label} 
                                                                className="w-full h-28 object-cover" 
                                                                style={{ minHeight: 112, maxHeight: 112 }} 
                                                            />
                                                            <div className="p-4 flex flex-col items-center">
                                                                <h3 className="text-base font-bold text-center mb-2" style={{ color: COLORS.primaryMaroon }}>
                                                                    {cat.label}
                                                                </h3>
                                                                

                                                                
                                                                {/* Button identical to Areas button */}
                                                                <button 
                                                                    className="px-4 py-1 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
                                                                    style={{ backgroundColor: COLORS.primaryMaroon }}
                                                                >
                                                                    View Documents
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Document viewer */}
                                    {selected.areaId && selected.parameterId && selected.category && (
                                        <div>
                                           

                                            {/* Document Navigation */}
                                            {viewingDocIndex !== null && filteredDocs[filteredViewerIndex] && (
                                                <div className="w-full flex flex-col items-center pb-4">
                                                    <div className="w-full max-w-4xl mx-auto">
                                                        <DocumentNavigation
                                                            currentDocument={currentDoc}
                                                            currentPage={currentPage}
                                                            totalPages={totalPages}
                                                            onPageChange={setCurrentPage}
                                                            onDownload={handleDownload}
                                                            onPrint={() => {
                                                                if (!currentDoc) return;
                                                                const win = window.open(currentDoc.url, '_blank');
                                                                if (win) win.print();
                                                            }}
                                                            onRotate={handleRotate}
                                                            onFitMode={toggleFitMode}
                                                            onZoom={handleZoom}
                                                            onInfo={() => setInfoOpen(true)}
                                                            onGrid={() => setGridOpen(true)}
                                                            onFullscreen={() => {
                                                                if (!isFullscreen) {
                                                                    document.documentElement.requestFullscreen?.();
                                                                } else {
                                                                    document.exitFullscreen?.();
                                                                }
                                                            }}
                                                            fitMode={fitMode}
                                                            rotate={rotate}
                                                            zoom={zoom}
                                                            isFullscreen={isFullscreen}
                                                            infoOpen={infoOpen}
                                                            setInfoOpen={setInfoOpen}
                                                            gridOpen={gridOpen}
                                                            setGridOpen={setGridOpen}
                                                        />
                                                    </div>
                                                    
                                                    {/* Document viewer */}
                                                    {(() => {
                                                        const doc = filteredDocs[filteredViewerIndex];
                                                        if (!doc) return null;
                                                        const ext = (doc.filename.split('.').pop() || '').toLowerCase();
                                                        
                                                        if (ext === 'pdf') {
                                                            return (
                                                                <div className="w-full max-w-4xl mx-auto rounded-b-lg overflow-hidden" style={{ height: '72vh' }}>
                                                                    <PdfViewer
                                                                        url={doc.url}
                                                                        currentPage={currentPage}
                                                                        onTotalPagesChange={setTotalPages}
                                                                        zoom={zoom}
                                                                        rotate={rotate}
                                                                        className="w-full h-full"
                                                                    />
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        if (['jpg', 'jpeg', 'png'].includes(ext)) {
                                                            return (
                                                                <div className="w-full max-w-4xl mx-auto bg-gray-50 flex items-center justify-center" style={{ height: '72vh' }}>
                                                                    <img src={doc.url} alt={doc.filename} className="max-h-full max-w-full object-contain" />
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
                                                            return (
                                                                <div className="w-full max-w-4xl mx-auto" style={{ height: '72vh' }}>
                                                                    <VideoViewer
                                                                        ref={videoPlayerRef}
                                                                        url={doc.url}
                                                                        onTimeUpdate={(current, total) => {
                                                                            setCurrentTime(current);
                                                                            setDuration(total);
                                                                        }}
                                                                        className="w-full h-full"
                                                                    />
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <div className="w-full max-w-4xl mx-auto bg-gray-50 text-gray-500 flex items-center justify-center" style={{ height: '40vh' }}>
                                                                No preview available for this file type.
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Document Grid */}
                                            {viewingDocIndex === null && (
                                                <div>
                                                    {loadingDocs ? (
                                                        <div className="flex items-center justify-center py-12">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.primaryMaroon }}></div>
                                                            <span className="ml-3 text-gray-600">Loading documents...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                            {filteredDocs.length === 0 ? (
                                                                <div className="col-span-full text-gray-400 text-center">
                                                                    No approved documents for this category.
                                                                </div>
                                                            ) : (
                                                                filteredDocs.map((doc) => {
                                                                    const ext = doc.filename.split('.').pop()?.toLowerCase() || '';
                                                                    return (
                                                                        <div
                                                                            key={doc.id}
                                                                            className="bg-white rounded-xl shadow-md border-t-4 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-lg transition"
                                                                            style={{
                                                                                borderTopColor: COLORS.primaryMaroon,
                                                                                aspectRatio: '8.5/13',
                                                                                maxWidth: 230,
                                                                                minHeight: 380,
                                                                            }}
                                                                            onClick={() => {
                                                                                const realIdx = approvedDocs.findIndex(d => d.id === doc.id);
                                                                                setViewerIndex(realIdx);
                                                                                setViewingDocIndex(realIdx);
                                                                            }}
                                                                        >
                                                                            <div className="w-full flex-1 flex items-center justify-center bg-gray-50 p-2 overflow-hidden">
                                                                                {['pdf'].includes(ext) ? (
                                                                                    <PDFThumbnail
                                                                                        url={doc.url}
                                                                                        className="w-full h-68 border-none rounded bg-white overflow-x-hidden"
                                                                                        scale={0.5}
                                                                                    />
                                                                                ) : ['jpg', 'jpeg', 'png'].includes(ext) ? (
                                                                                    <img
                                                                                        src={doc.url}
                                                                                        alt={doc.filename}
                                                                                        className="max-h-68 max-w-full rounded object-contain mx-auto w-auto h-auto overflow-x-hidden"
                                                                                        style={{ width: '100%', objectFit: 'contain', height: '17rem', overflowX: 'hidden' }}
                                                                                    />
                                                                                ) : ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext) ? (
                                                                                    <video
                                                                                        src={doc.url}
                                                                                        controls
                                                                                        className="w-full h-56 rounded bg-black"
                                                                                        style={{ objectFit: 'contain', height: '17rem' }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-68 flex items-center justify-center px-5 text-center bg-gray-100 rounded text-gray-400 text-xs">
                                                                                        No preview available for this file type.
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="w-full px-4 py-2 flex flex-col items-center border-t border-gray-100">
                                                                                <div className="text-[11px] text-gray-600 text-left w-full">
                                                                                    <div className="truncate"><span className="font-semibold">Uploaded by:</span> {doc.user_name || '—'}</div>
                                                                                    <div className="truncate"><span className="font-semibold">Uploaded at:</span> {doc.uploaded_at || '—'}</div>
                                                                                    <div className="truncate"><span className="font-semibold">Approved by:</span> {doc.approved_by || '—'}</div>
                                                                                    <div className="truncate"><span className="font-semibold">Approved at:</span> {doc.approved_at || doc.updated_at || '—'}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0 transition-all duration-1200">
                        <div className="absolute inset-0 w-full h-full">
                            <OptimizedImage
                                src={bsitContent.mula_sayo_image || '/api/placeholder/1600/400'}
                                alt={bsitContent.mula_sayo_title}
                                className="w-full h-full object-cover object-center opacity-70"
                                lazy={true}
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up transition-all duration-300 hover:scale-102">
                                {bsitContent.mula_sayo_title}
                            </h2>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
            `}</style>
        </>
    );
}
