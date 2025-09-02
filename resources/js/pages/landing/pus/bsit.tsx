import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRef, useEffect, useState, useMemo } from 'react';
import { DocumentCardGrid } from '@/components/DocumentCardGrid';
import PdfViewer from '@/components/PdfViewer';
import VideoViewer, { VideoPlayerRef } from '@/components/VideoViewer';

// Document Management Types
interface Parameter {
    id: number;
    name: string;
    code: string;
    approved_count?: number;
}

interface Area {
    id: number;
    name: string;
    code: string;
    parameters?: Parameter[];
    approved_count?: number;
}

interface Program {
    id: number;
    name: string;
    code: string;
    areas?: Area[];
}

interface DocumentItem {
    id: number;
    filename: string;
    filepath: string;
    url: string;
    description?: string;
    mimetype: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    checker: {
        id: number;
        name: string;
        email: string;
    };
}

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

interface AccreditationArea {
    id?: number;
    title: string;
    name?: string;
    code?: string;
    image: string;
    parameters?: Parameter[];
    approved_count?: number;
}

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
    sidebar?: Program[];
}

// Scroll animation hook
function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = ref.current;
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
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [hasAnimated]);
    return [ref, isVisible] as const;
}

export default function BSITProgramPage({ bsitContent, accreditationAreas, sidebar }: Props) {
    const [overviewRef, overviewVisible] = useScrollAnimation();
    const [objectivesRef, objectivesVisible] = useScrollAnimation();
    const [areasRef, areasVisible] = useScrollAnimation();

    // Document Management State
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
    const [search, setSearch] = useState('');
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
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
    const selectedParameter = selectedArea?.parameters?.find(param => param.id === selected.parameterId);

    // Fetch parameters when area is selected
    useEffect(() => {
        if (selected.areaId && !selected.parameterId) {
            const currentArea = availableAreas.find(a => a.id === selected.areaId);
            
            // Only fetch if parameters are not already available
            if (!currentArea?.parameters || currentArea.parameters.length === 0) {
                setLoadingDocs(true);
                
                // Fetch parameters from backend
                fetch(`/programs/bsit/documents?type=parameters&area_id=${selected.areaId}`)
                    .then(response => response.json())
                    .then(data => {
                        setFetchedParameters(data.parameters || []);
                        setFetchedAreas(prev => {
                            const existing = prev.find(a => a.id === selected.areaId);
                            if (existing) {
                                return prev.map(a => a.id === selected.areaId ? { ...a, parameters: data.parameters || [] } : a);
                            } else {
                                const areaFromProps = accreditationAreas?.find(a => a.id === selected.areaId);
                                if (areaFromProps) {
                                    const newArea: Area = {
                                        id: areaFromProps.id || 0,
                                        name: areaFromProps.name || areaFromProps.title,
                                        code: areaFromProps.code,
                                        parameters: data.parameters || [],
                                        approved_count: areaFromProps.approved_count
                                    };
                                    return [...prev, newArea];
                                }
                                return prev;
                            }
                        });
                        setLoadingDocs(false);
                    })
                    .catch(error => {
                        console.error('Error fetching parameters:', error);
                        setLoadingDocs(false);
                    });
            }
        }
    }, [selected.areaId, selected.parameterId, availableAreas, accreditationAreas]);

    // Fetch approved documents
    useEffect(() => {
        if (selected.areaId && selected.parameterId && selected.category) {
            setLoadingDocs(true);
            
            // Fetch documents from backend
            fetch(`/programs/bsit/documents?type=documents&area_id=${selected.areaId}&parameter_id=${selected.parameterId}&category=${selected.category}`)
                .then(response => response.json())
                .then(data => {
                    setApprovedDocs(data.documents || []);
                    setViewerIndex(0);
                    setLoadingDocs(false);
                })
                .catch(error => {
                    console.error('Error fetching documents:', error);
                    setLoadingDocs(false);
                });
            
        } else if (selected.areaId && selected.parameterId) {
            // Fetch all docs for the parameter to get category counts
            setLoadingDocs(true);
            fetch(`/programs/bsit/documents?type=documents&area_id=${selected.areaId}&parameter_id=${selected.parameterId}`)
                .then(response => response.json())
                .then(data => {
                    setApprovedDocs(data.documents || []);
                    setViewerIndex(0);
                    setLoadingDocs(false);
                })
                .catch(error => {
                    console.error('Error fetching parameter documents:', error);
                    setLoadingDocs(false);
                });
        } else {
            setApprovedDocs([]);
            setViewerIndex(0);
        }
    }, [selected.areaId, selected.parameterId, selected.category]);

    // Initial fetch of areas when component loads
    useEffect(() => {
        if (!bsitProgram?.areas && (!accreditationAreas || accreditationAreas.length === 0)) {
            fetch('/programs/bsit/documents?type=areas')
                .then(response => response.json())
                .then(data => {
                    setFetchedAreas(data.areas || []);
                })
                .catch(error => {
                    console.error('Error fetching areas:', error);
                });
        }
    }, [bsitProgram?.areas, accreditationAreas]);

    // Filtered docs for preview
    const filteredDocs = useMemo(() => {
        let docs = approvedDocs;
        if (search) {
            docs = docs.filter(doc => doc.filename.toLowerCase().includes(search.toLowerCase()));
        }
        return docs;
    }, [approvedDocs, search]);

    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === approvedDocs[viewerIndex]?.id);
    const currentDoc = filteredDocs[filteredViewerIndex >= 0 ? filteredViewerIndex : 0];

    // Navigation functions
    const goTo = (idx: number) => {
        if (filteredDocs.length === 0) return;
        const doc = filteredDocs[idx];
        const realIdx = approvedDocs.findIndex(d => d.id === doc.id);
        if (realIdx !== -1) {
            setViewerIndex(realIdx);
            setViewingDocIndex(realIdx);
        }
    };

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredDocs.length > 0) goTo(0);
    };

    return (
        <>
            <Head title="BSIT Program" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="bsit-program" />

                {/* Document Mode Toggle */}
                <div className="fixed top-4 right-4 z-50">
                    <button
                        onClick={() => setDocumentMode(!documentMode)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors text-sm font-medium"
                        type="button"
                    >
                        {documentMode ? 'Exit Documents' : 'View Documents'}
                    </button>
                </div>

                {/* Document Management Mode */}
                {documentMode && (
                    <div className="fixed inset-0 bg-white z-40 overflow-auto">
                        {/* Document Navigation Header */}
                        <div className="sticky top-0 bg-slate-900 text-white p-4 shadow-lg z-50">
                            <div className="container mx-auto">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-lg font-semibold">BSIT Program Documents</h1>
                                    <button
                                        onClick={() => setDocumentMode(false)}
                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded transition-colors text-sm"
                                    >
                                        ✕ Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Document Navigation */}
                        <div className="bg-slate-50 border-b border-slate-200 pb-2">
                            <div className="container mx-auto px-4 py-3">
                                {/* Breadcrumb Navigation */}
                                <div className="flex items-center gap-2 mb-4 text-sm">
                                    <button
                                        onClick={() => setSelected({})}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        All Areas
                                    </button>
                                    {selected.areaId && (
                                        <>
                                            <span className="text-gray-400">›</span>
                                            <button
                                                onClick={() => setSelected({ areaId: selected.areaId })}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {selectedArea?.name}
                                            </button>
                                        </>
                                    )}
                                    {selected.parameterId && (
                                        <>
                                            <span className="text-gray-400">›</span>
                                            <button
                                                onClick={() => setSelected({ areaId: selected.areaId, parameterId: selected.parameterId })}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                {selectedParameter?.name}
                                            </button>
                                        </>
                                    )}
                                    {selected.category && (
                                        <>
                                            <span className="text-gray-400">›</span>
                                            <span className="text-gray-700">
                                                {categoryList.find(c => c.value === selected.category)?.label}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Area Selection */}
                                {!selected.areaId && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Select an Area</h3>
                                        <div className="grid gap-3">
                                            {availableAreas.map((area, idx) => (
                                                <button
                                                    key={area.id || idx}
                                                    onClick={() => setSelected({ areaId: area.id })}
                                                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-900">{area.name}</div>
                                                    {area.code && (
                                                        <div className="text-sm text-gray-500">Code: {area.code}</div>
                                                    )}
                                                    {area.approved_count !== undefined && (
                                                        <div className="text-sm text-blue-600">{area.approved_count} documents</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Parameter Selection */}
                                {selected.areaId && !selected.parameterId && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">{selectedArea?.name} - Parameters</h3>
                                        {loadingDocs ? (
                                            <div className="text-center py-8">
                                                <div className="text-gray-500">Loading parameters...</div>
                                            </div>
                                        ) : selectedArea?.parameters && selectedArea.parameters.length > 0 ? (
                                            <div className="grid gap-3">
                                                {selectedArea.parameters.map((param, idx) => (
                                                    <button
                                                        key={param.id || idx}
                                                        onClick={() => setSelected({ areaId: selected.areaId, parameterId: param.id })}
                                                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <div className="font-medium text-gray-900">{param.name}</div>
                                                        {param.code && (
                                                            <div className="text-sm text-gray-500">Code: {param.code}</div>
                                                        )}
                                                        {param.approved_count !== undefined && (
                                                            <div className="text-sm text-blue-600">{param.approved_count} documents</div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="text-gray-500">No parameters available for this area</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Category Selection */}
                                {selected.areaId && selected.parameterId && !selected.category && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">{selectedParameter?.name} - Categories</h3>
                                        <div className="grid gap-3">
                                            {categoryList.map((category) => (
                                                <button
                                                    key={category.value}
                                                    onClick={() => setSelected({ ...selected, category: category.value })}
                                                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                                >
                                                    <div className="font-medium text-gray-900">{category.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Document Search and Info */}
                                {selected.areaId && selected.parameterId && selected.category && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {categoryList.find(c => c.value === selected.category)?.label} Documents
                                            </h3>
                                            <div className="text-sm text-gray-600">
                                                {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        
                                        {/* Search */}
                                        <form onSubmit={handleSearch} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search documents..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Search
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Document Viewer */}
                        {filteredDocs.length > 0 && viewingDocIndex !== null && (
                            <div className="relative bg-slate-900">
                                {currentDoc?.mimetype?.startsWith('video/') ? (
                                    <VideoViewer
                                        doc={currentDoc}
                                        ref={videoPlayerRef}
                                        isPlaying={isPlaying}
                                        setIsPlaying={setIsPlaying}
                                        volume={volume}
                                        setVolume={setVolume}
                                        isMuted={isMuted}
                                        setIsMuted={setIsMuted}
                                        playbackSpeed={playbackSpeed}
                                        setPlaybackSpeed={setPlaybackSpeed}
                                        currentTime={currentTime}
                                        setCurrentTime={setCurrentTime}
                                        duration={duration}
                                        setDuration={setDuration}
                                        onPrevious={() => filteredViewerIndex > 0 && goTo(filteredViewerIndex - 1)}
                                        onNext={() => filteredViewerIndex < filteredDocs.length - 1 && goTo(filteredViewerIndex + 1)}
                                        onClose={() => setViewingDocIndex(null)}
                                        isFullscreen={isFullscreen}
                                        setIsFullscreen={setIsFullscreen}
                                    />
                                ) : (
                                    <PdfViewer
                                        doc={currentDoc}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        totalPages={totalPages}
                                        setTotalPages={setTotalPages}
                                        zoom={zoom}
                                        fitMode={fitMode}
                                        rotate={rotate}
                                        infoOpen={infoOpen}
                                        setInfoOpen={setInfoOpen}
                                        gridOpen={gridOpen}
                                        setGridOpen={setGridOpen}
                                        isFullscreen={isFullscreen}
                                        setIsFullscreen={setIsFullscreen}
                                        onDownload={handleDownload}
                                        onRotate={handleRotate}
                                        onZoom={handleZoom}
                                        onFitMode={toggleFitMode}
                                        onPrevious={() => filteredViewerIndex > 0 && goTo(filteredViewerIndex - 1)}
                                        onNext={() => filteredViewerIndex < filteredDocs.length - 1 && goTo(filteredViewerIndex + 1)}
                                        onClose={() => setViewingDocIndex(null)}
                                    />
                                )}
                            </div>
                        )}

                        {/* Document Grid */}
                        {selected.areaId && selected.parameterId && selected.category && !loadingDocs && (
                            <div className="container mx-auto px-4 py-6">
                                <DocumentCardGrid
                                    documents={filteredDocs}
                                    onViewDocument={(index) => {
                                        const docIndex = approvedDocs.findIndex(d => d.id === filteredDocs[index].id);
                                        setViewerIndex(docIndex);
                                        setViewingDocIndex(docIndex);
                                    }}
                                    search={search}
                                    selectedArea={selectedArea}
                                    selectedParameter={selectedParameter}
                                    selectedCategory={categoryList.find(c => c.value === selected.category)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content - only show when not in document mode */}
                {!documentMode && (
                    <main className="pt-16 sm:pt-20">
                    {/* Hero */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <img
                            src={bsitContent.hero_image || '/api/placeholder/1600/600'}
                            alt={bsitContent.hero_title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            style={{ minHeight: 400, maxHeight: 700 }}
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
                        ref={overviewRef}
                        className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            overviewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
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
                        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
                            <div className="flex-1">
                                <h2 className="text-4xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                    {bsitContent.overview_section_title}
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-700 mb-4">{bsitContent.program_description}</p>
                            </div>
                            <div className="flex-1">
                                <img 
                                    src={bsitContent.program_image || '/api/placeholder/500/400'} 
                                    alt="BSIT Overview" 
                                    className="rounded-2xl shadow-lg w-full object-cover" 
                                    style={{ minHeight: 260, maxHeight: 400 }} 
                                />
                            </div>
                        </div>
                    </section>

                    {/* Objectives */}
                    <section
                        ref={objectivesRef}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 ${
                            objectivesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                    >
                        <div className="w-full max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.objectives_section_title}
                            </h2>
                            <ol className="list-decimal ml-6 space-y-3 text-lg text-gray-800">
                                {bsitContent.objectives_data && bsitContent.objectives_data.length > 0 ? (
                                    bsitContent.objectives_data.map((obj, idx) => (
                                        <li key={idx}>{obj}</li>
                                    ))
                                ) : (
                                    <li>No objectives available</li>
                                )}
                            </ol>
                        </div>
                    </section>

                    {/* AVP Section */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.avp_section_title}
                            </h2>
                            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mx-auto mb-4" style={{ maxWidth: 800, height: 450 }}>
                                {bsitContent.program_video_type === 'youtube' ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${bsitContent.program_video}`}
                                        title="Program AVP"
                                        frameBorder={0}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                ) : (
                                    <video
                                        src={bsitContent.program_video}
                                        controls
                                        className="w-full h-full"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Program in Action */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12" style={{ backgroundColor: '#f8fafc' }}>
                        <div className="w-full max-w-6xl mx-auto">
                            <h2 className="text-3xl text-center font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.action_section_title}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {bsitContent.action_images && bsitContent.action_images.length > 0 ? (
                                    bsitContent.action_images.map((img: string, idx: number) => (
                                        <div key={idx} className="rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
                                            <img 
                                                src={img || '/api/placeholder/400/300'} 
                                                alt={`Activity ${idx + 1}`} 
                                                className="w-full h-36 object-cover" 
                                                style={{ minHeight: 200, maxHeight: 200 }} 
                                            />
                                        </div>
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
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.graduates_section_title}
                            </h2>
                            <div className="flex flex-col items-center gap-6">
                                {bsitContent.graduates_data && bsitContent.graduates_data.length > 0 ? (
                                    bsitContent.graduates_data.map((grad: GraduateItem, idx: number) => (
                                        <div key={idx} className="w-full flex flex-col items-center">
                                            <div className="w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-2" style={{ maxWidth: 500, height: 280 }}>
                                                {grad.video_type === 'youtube' ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${grad.video}`}
                                                        title={grad.name}
                                                        frameBorder={0}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full"
                                                    ></iframe>
                                                ) : (
                                                    <video
                                                        src={typeof grad.video === 'string' ? grad.video : ''}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                    >
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                            </div>
                                            <span className="font-semibold text-lg" style={{ color: COLORS.primaryMaroon }}>{grad.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">
                                        No graduates available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Accreditation Areas */}
                    <section
                        ref={areasRef}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 ${
                            areasVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                        style={{ backgroundColor: '#f8fafc' }}
                    >
                        <div className="w-full max-w-7xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.accreditation_section_title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {bsitContent.accreditation_areas && bsitContent.accreditation_areas.length > 0 ? (
                                    bsitContent.accreditation_areas.map((area: AccreditationArea, idx: number) => (
                                        <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
                                            style={{ borderTopColor: COLORS.primaryMaroon, transitionDelay: `${idx * 0.1}s` }}>
                                            <img 
                                                src={area.image || '/api/placeholder/300/200'} 
                                                alt={area.title} 
                                                className="w-full h-28 object-cover" 
                                                style={{ minHeight: 112, maxHeight: 112 }} 
                                            />
                                            <div className="p-4 flex flex-col items-center">
                                                <h3 className="text-base font-bold text-center mb-2" style={{ color: COLORS.primaryMaroon }}>{area.title}</h3>
                                                <button className="px-4 py-1 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
                                                    style={{ backgroundColor: COLORS.primaryMaroon }}>
                                                    View Area
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5 text-center text-gray-500">
                                        No accreditation areas available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={bsitContent.mula_sayo_image || '/api/placeholder/1600/400'}
                                alt={bsitContent.mula_sayo_title}
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {bsitContent.mula_sayo_title}
                            </h2>
                        </div>
                    </section>
                </main>
                )}

                <Footer />
            </div>
            <style jsx>{`
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </>
    );
}