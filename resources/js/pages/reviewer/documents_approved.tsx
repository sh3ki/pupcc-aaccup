import { LuFileCheck2 } from "react-icons/lu";
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState, useRef, useMemo, useEffect } from 'react';
import React from 'react';
import { DocumentNavigation } from '@/components/DocumentNavigation';
import { DocumentCardGrid } from '@/components/DocumentCardGrid';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import PdfViewer from '@/components/PdfViewer';
import VideoViewer, { VideoPlayerRef } from '@/components/VideoViewer';

import PDFThumbnail from '@/components/PDFThumbnail';

type Parameter = { id: number; name: string; code?: string; approved_count?: number; category_approved_counts?: Record<string, number> };
type Area = { id: number; name: string; code?: string; parameters?: Parameter[] };
type Program = { id: number; name: string; code?: string; areas: Area[] };

interface PageProps {
    sidebar: Program[];
    csrfToken: string;
}

export default function ReviewerDocuments(props: PageProps) {
    const sidebar = props.sidebar ?? [];
    const csrfToken = props.csrfToken;
    const [selected, setSelected] = useState<{ programId?: number; areaId?: number; parameterId?: number; category?: string }>({});
    const [expanded, setExpanded] = useState<{ [programId: number]: boolean }>({});
    const [areaExpanded, setAreaExpanded] = useState<{ [areaId: number]: boolean }>({});
    const [paramExpanded, setParamExpanded] = useState<{ [paramId: number]: boolean }>({});

    const selectedProgram = sidebar.find(p => p.id === selected.programId);
    const selectedArea = selectedProgram?.areas?.find(a => a.id === selected.areaId);
    const selectedParameter = selectedArea?.parameters?.find(param => param.id === selected.parameterId);

    const toggleExpand = (programId: number) => {
        setExpanded(prev => ({ ...prev, [programId]: !prev[programId] }));
    };
    const toggleAreaExpand = (areaId: number) => {
        setAreaExpanded(prev => ({ ...prev, [areaId]: !prev[areaId] }));
    };

    // --- Reviewer: Pending Modal State ---
    const [pendingModalOpen, setPendingModalOpen] = useState(false);
    const [pendingDocs, setPendingDocs] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [pendingError, setPendingError] = useState('');
    const [pendingDocView, setPendingDocView] = useState<any | null>(null);
    const [loadingPendingDoc, setLoadingPendingDoc] = useState(false);

    // --- PDF Navigation state ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [fitMode, setFitMode] = useState<'width' | 'height' | null>(null);
    const [rotate, setRotate] = useState(0);
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(0.9); // Start with 90%
    const [gridOpen, setGridOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- Video Navigation state ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const videoPlayerRef = useRef<VideoPlayerRef>(null);

    // Fetch pending documents when modal opens
    useEffect(() => {
        if (pendingModalOpen) {
            setLoadingPending(true);
            setPendingError('');
            fetch('/reviewer/documents/pending', {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setPendingDocs(data.documents);
                    else setPendingError('Failed to load pending documents.');
                })
                .catch(() => setPendingError('Failed to load pending documents.'))
                .finally(() => setLoadingPending(false));
        }
    }, [pendingModalOpen]);

    // View a pending document
    const handleViewPendingDoc = (docId: number) => {
        setLoadingPendingDoc(true);
        setPendingDocView(null);
        fetch(`/reviewer/documents/pending/${docId}`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setPendingDocView(data.document);
                else setPendingDocView({ error: data.message || 'Failed to load document.' });
            })
            .catch(() => setPendingDocView({ error: 'Failed to load document.' }))
            .finally(() => setLoadingPendingDoc(false));
    };

    // --- Approved Documents State ---
    const [approvedDocs, setApprovedDocs] = useState<{ id: number, filename: string, url: string, uploaded_at: string, user_name?: string, approved_by?: string | null, approved_at?: string | null, updated_at?: string | null }[]>([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [search, setSearch] = useState('');
    const [pageInput, setPageInput] = useState(viewerIndex + 1);

    useEffect(() => {
        setPageInput(viewerIndex + 1);
    }, [viewerIndex]);

    useEffect(() => {
        // Only fetch when all three are selected
        if (selected.programId && selected.areaId && selected.parameterId && selected.category) {
            setLoadingDocs(true);
            fetch(`/reviewer/documents/approved?program_id=${selected.programId}&area_id=${selected.areaId}&parameter_id=${selected.parameterId}&category=${selected.category}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        setApprovedDocs(data.documents);
                        setViewerIndex(0);
                    } else {
                        setApprovedDocs([]);
                    }
                })
                .catch(() => setApprovedDocs([]))
                .finally(() => setLoadingDocs(false));
        } else if (selected.programId && selected.areaId) {
            // If only program and area are selected, fetch all docs for that area (for grid counts)
            setLoadingDocs(true);
            fetch(`/reviewer/documents/approved?program_id=${selected.programId}&area_id=${selected.areaId}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        setApprovedDocs(data.documents);
                        setViewerIndex(0);
                    } else {
                        setApprovedDocs([]);
                    }
                })
                .catch(() => setApprovedDocs([]))
                .finally(() => setLoadingDocs(false));
        } else {
            setApprovedDocs([]);
            setViewerIndex(0);
        }
    }, [selected.programId, selected.areaId, selected.parameterId, selected.category]);

    // Reset to first page when document changes
    useEffect(() => {
        setCurrentPage(1);
        setTotalPages(1);
    }, [viewerIndex]);

    // Filtered docs for preview card grid: filter by parameterId and category if both are selected
    const filteredDocs = useMemo(() => {
        let docs = approvedDocs;
        if (selected.parameterId && selected.category) {
            docs = docs.filter(doc =>
                doc.parameter_id === selected.parameterId &&
                doc.category === selected.category
            );
        }
        if (search) {
            docs = docs.filter(doc => doc.filename.toLowerCase().includes(search.toLowerCase()));
        }
        return docs;
    }, [approvedDocs, selected.parameterId, selected.category, search]);

    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === approvedDocs[viewerIndex]?.id);
    const currentDoc = filteredDocs[filteredViewerIndex >= 0 ? filteredViewerIndex : 0];

    const goTo = (idx: number) => {
        if (filteredDocs.length === 0) return;
        const doc = filteredDocs[idx];
        const realIdx = approvedDocs.findIndex(d => d.id === doc.id);
        if (realIdx !== -1) {
            setViewerIndex(realIdx);
            setViewingDocIndex(realIdx);
        }
    };
    const goFirst = () => goTo(0);
    const goLast = () => goTo(filteredDocs.length - 1);
    const goPrev = () => goTo(Math.max(0, filteredViewerIndex - 1));
    const goNext = () => goTo(Math.min(filteredDocs.length - 1, filteredViewerIndex + 1));

    const handleDownload = () => {
        if (!currentDoc) return;
        const link = document.createElement('a');
        link.href = currentDoc.url;
        link.download = currentDoc.filename;
        link.click();
    };

    const handlePrint = () => {
        if (!currentDoc) return;
        const win = window.open(currentDoc.url, '_blank');
        if (win) win.print();
    };

    const handleRotate = (dir: 'left' | 'right') => {
        setRotate(r => (dir === 'left' ? (r - 90 + 360) % 360 : (r + 90) % 360));
    };

    const toggleFitMode = () => {
        setFitMode(f => {
            if (f === null) {
                // Switch to fit-to-width: set zoom to 100%
                setZoom(1.0);
                return 'width';
            } else if (f === 'width') {
                // Switch to fit-to-height: set zoom to 50%
                setZoom(0.5);
                return 'height';
            } else {
                // Switch back to default: set zoom to 90%
                setZoom(0.9);
                return null;
            }
        });
    };

    const handleZoom = (dir: 'in' | 'out') => {
        setZoom(z => {
            const newZoom = dir === 'in' ? Math.min(z + 0.1, 1.0) : Math.max(z - 0.1, 0.5);
            
            // Update fitMode based on zoom value
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

    const openGrid = () => setGridOpen(true);
    const closeGrid = () => setGridOpen(false);

    // --- Video handlers ---
    const handleRewind = () => {
        if (videoPlayerRef.current) {
            const currentTime = videoPlayerRef.current.getCurrentTime();
            videoPlayerRef.current.setCurrentTime(Math.max(0, currentTime - 10));
        }
    };

    const handlePlayPause = () => {
        if (videoPlayerRef.current) {
            if (videoPlayerRef.current.isPaused()) {
                videoPlayerRef.current.play();
                setIsPlaying(true);
            } else {
                videoPlayerRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleFastForward = () => {
        if (videoPlayerRef.current) {
            const currentTime = videoPlayerRef.current.getCurrentTime();
            const duration = videoPlayerRef.current.getDuration();
            videoPlayerRef.current.setCurrentTime(Math.min(duration, currentTime + 10));
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.setVolume(newVolume);
            setVolume(newVolume);
            if (newVolume === 0) {
                setIsMuted(true);
            } else if (isMuted) {
                setIsMuted(false);
            }
        }
    };

    const handleMuteToggle = () => {
        if (videoPlayerRef.current) {
            if (isMuted) {
                videoPlayerRef.current.unmute();
                setIsMuted(false);
            } else {
                videoPlayerRef.current.mute();
                setIsMuted(true);
            }
        }
    };

    const handleSpeedChange = (speed: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.setPlaybackRate(speed);
            setPlaybackSpeed(speed);
        }
    };

    const handlePictureInPicture = () => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.requestPictureInPicture().catch(console.error);
        }
    };

    const handleTimeUpdate = (time: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.setCurrentTime(time);
        }
    };

    // Video time tracking
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const onVideoTimeUpdate = (current: number, total: number) => {
        setCurrentTime(current);
        setDuration(total);
    };

    const previewRef = useRef<HTMLDivElement>(null);
    const handleFullscreen = () => {
        if (!previewRef.current) return;
        if (!isFullscreen) {
            previewRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    useEffect(() => { setRotate(0); setZoom(0.9); setFitMode(null); }, [viewerIndex, selected.programId, selected.areaId]);
    useEffect(() => {
        setPageInput(filteredViewerIndex + 1);
    }, [filteredViewerIndex, search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredDocs.length > 0) goTo(0);
    };

    // --- Add Document Modal State ---
    const [addModalOpen, setAddModalOpen] = useState(false);

    const handleUploadSuccess = () => {
        // Refresh the current view by reloading the approved documents
        window.location.reload();
    };

    // Helper: category list
    const categoryList = [
        { value: 'system', label: 'System' },
        { value: 'implementation', label: 'Implementation' },
        { value: 'outcomes', label: 'Outcomes' },
    ];
    // --- Add state to track if a document is being viewed ---
    const [viewingDocIndex, setViewingDocIndex] = useState<number | null>(null);

    // --- Reset viewingDocIndex when navigating via sidebar/category ---
    useEffect(() => {
        setViewingDocIndex(null);
    }, [
        selected.programId,
        selected.areaId,
        selected.parameterId,
        selected.category
    ]);

    return (
        <>
            <Head title="Reviewer Documents" />
            <DashboardLayout>
                <div className="flex w-full min-h-[calc(100vh-64px-40px)] overflow-hidden">
                    {/* Sidebar - Reduced width */}
                    <aside
                        className="min-w-[265px] bg-gray-50 p-4 h-[calc(100vh-64px-40px)] sticky top-16 self-start overflow-y-auto"
                        style={{
                            minHeight: 'calc(100vh - 64px - 40px)',
                            maxHeight: 'calc(100vh - 64px - 40px)',
                            flexBasis: '240px',
                            flexShrink: 0
                        }}
                    >
                        <button
                            type="button"
                            className={`text-base font-bold mb-2 w-full text-left px-2 py-1.5 rounded transition
                                ${!selected.programId ? 'text-[#7F0404] underline underline-offset-4 decoration-2' : 'text-[#7F0404] hover:bg-gray-100'}`}
                            onClick={() => {
                                setSelected({});
                                setViewingDocIndex(null); // <-- reset viewer
                            }}
                        >
                            My Program Documents
                        </button>
                        <nav>
                            {sidebar.length === 0 && (
                                <div className="text-gray-500 text-sm">No assignments found.</div>
                            )}
                            {sidebar.map(program => (
                                <div key={program.id} className="mb-2">
                                    <button
                                        type="button"
                                        className={`flex items-center w-full font-semibold px-2 py-1 rounded transition
                                            ${selected.programId === program.id && !selected.areaId ? 'text-[#7F0404] underline underline-offset-4 decoration-2' : 'text-[#7F0404] hover:bg-gray-100'}
                                        `}
                                        onClick={() => {
                                            toggleExpand(program.id);
                                            setSelected({ programId: program.id, areaId: undefined, parameterId: undefined, category: undefined });
                                            setViewingDocIndex(null); // <-- reset viewer
                                        }}
                                    >
                                        <span className="flex-1 text-left">
                                            {program.code ? <span className="font-bold">{program.code}</span> : ''}
                                            {program.code ? ' - ' : ''}
                                            {program.name}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 ml-2 transition-transform ${expanded[program.id] ? 'rotate-90' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    {expanded[program.id] && program.areas && program.areas.length > 0 && (
                                        <ul className="ml-4 mt-1 list-none text-sm text-gray-700">
                                            {program.areas.map(area => (
                                                <li key={area.id}>
                                                    <button
                                                        type="button"
                                                        className={`flex items-center w-full text-left px-2 py-1 rounded transition
                                                            ${selected.programId === program.id && selected.areaId === area.id && !selected.parameterId
                                                                ? 'text-[#7F0404] underline underline-offset-4 decoration-2'
                                                                : 'hover:bg-gray-100'}
                                                        `}
                                                        onClick={() => {
                                                            toggleAreaExpand(area.id);
                                                            setSelected({ programId: program.id, areaId: area.id, parameterId: undefined, category: undefined });
                                                            setViewingDocIndex(null); // <-- reset viewer
                                                        }}
                                                    >
                                                        <span className="flex-shrink-0 flex items-center h-full pt-0.5 mr-2">
                                                            <span className="w-2 h-2 bg-[#7F0404] rounded-full inline-block"></span>
                                                        </span>
                                                        <span className="flex-1">
                                                            {area.code ? (
                                                                <>
                                                                    <span className="font-bold">Area {area.code}</span>
                                                                    {' - '}
                                                                </>
                                                            ) : 'Area ' }
                                                            {area.name}
                                                        </span>
                                                        <svg
                                                            className={`w-4 h-4 ml-2 transition-transform ${areaExpanded[area.id] ? 'rotate-90' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                    {areaExpanded[area.id] && area.parameters && area.parameters.length > 0 && (
                                                        <ul className="ml-4 mt-1 list-none text-xs text-gray-700">
                                                            {area.parameters.map(param => (
                                                                <li key={param.id}>
                                                                    <button
                                                                        type="button"
                                                                        className={`flex items-center w-full text-left px-2 py-1 rounded transition
                                                                            ${selected.programId === program.id && selected.areaId === area.id && selected.parameterId === param.id && !selected.category
                                                                                ? 'text-[#7F0404] underline underline-offset-4 decoration-2'
                                                                                : 'hover:bg-gray-100'}
                                                                        `}
                                                                        onClick={() => {
                                                                            setParamExpanded(prev => ({ ...prev, [param.id]: !prev[param.id] }));
                                                                            setSelected({ programId: program.id, areaId: area.id, parameterId: param.id, category: undefined });
                                                                            setViewingDocIndex(null); // <-- reset viewer
                                                                        }}
                                                                    >
                                                                        <span className="flex-shrink-0 flex items-center h-full pt-0.5 mr-2">
                                                                            <span className="w-1.5 h-1.5 bg-[#7F0404] rounded-full inline-block"></span>
                                                                        </span>
                                                                        <span className="flex-1">
                                                                            {param.code ? (
                                                                                <>
                                                                                    <span className="font-bold">{param.code}</span>
                                                                                    {' - '}
                                                                                </>
                                                                            ) : ''}
                                                                            {param.name}
                                                                        </span>
                                                                        <svg
                                                                            className={`w-3 h-3 ml-2 transition-transform ${paramExpanded[param.id] ? 'rotate-90' : ''}`}
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </button>
                                                                    {/* Category sub-links */}
                                                                    {paramExpanded[param.id] && (
                                                                        <ul className="ml-4 mt-1 list-none text-[11px] text-gray-700">
                                                                            {categoryList.map(cat => (
                                                                                <li key={cat.value}>
                                                                                    <button
                                                                                        type="button"
                                                                                        className={`flex items-center w-full text-left px-2 py-1 rounded transition
                                                                                            ${selected.programId === program.id && selected.areaId === area.id && selected.parameterId === param.id && selected.category === cat.value
                                                                                                ? 'text-[#7F0404] underline underline-offset-4 decoration-2 font-bold'
                                                                                                : 'hover:bg-gray-100'}
                                                                                        `}
                                                                                        style={{
                                                                                            fontSize: '11px',
                                                                                            paddingLeft: 18,
                                                                                            textDecorationColor: selected.programId === program.id && selected.areaId === area.id && selected.parameterId === param.id && selected.category === cat.value ? '#7F0404' : undefined
                                                                                        }}
                                                                                        onClick={() => {
                                                                                            setSelected({ programId: program.id, areaId: area.id, parameterId: param.id, category: cat.value });
                                                                                            setViewingDocIndex(null); // <-- reset viewer
                                                                                        }}
                                                                                    >
                                                                                        <span className="flex-shrink-0 flex items-center h-full pt-0.5 mr-2">
                                                                                            <span
                                                                                                className="w-1 h-1 rounded-full inline-block"
                                                                                                style={{
                                                                                                    backgroundColor: '#7F0404'
                                                                                                }}
                                                                                            ></span>
                                                                                        </span>
                                                                                        <span className="flex-1">{cat.label}</span>
                                                                                    </button>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </aside>
                    
                    {/* Main Content */}
                    <section className="flex-1 w-full px-6 py-4 text-left flex flex-col min-h-[calc(100vh-64px-40px)] max-h-[calc(100vh-64px-40px)] overflow-auto">
                        <div className="flex items-center justify-between flex-shrink-0">
                            <div>
                                {!selected.programId ? (
                                    <h1 className="text-xl font-bold text-[#7F0404]">Reviewer Documents</h1>
                                ) : selectedProgram ? (
                                    <h1 className="text-lg font-bold text-[#7F0404]">
                                        {selectedProgram.code ? `${selectedProgram.code} - ` : ''}
                                        {selectedProgram.name}
                                    </h1>
                                ) : null}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="flex items-center bg-[#7F0404] hover:bg-[#a00a0a] text-white font-medium px-2 py-1.5 text-sm rounded shadow transition"
                                    onClick={() => setAddModalOpen(true)}
                                >
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                        </div>
                        
                        {/* Program Cards Grid when no program is selected */}
                        {!selected.programId ? (
                            <div className="mt-4 mb-8">
                                <p className="text-base text-gray-700 mb-6">Select a program to view and manage its documents.</p>
                                <DocumentCardGrid
                                    items={sidebar}
                                    getKey={program => program.id}
                                    onCardClick={program => {
                                        setSelected({ programId: program.id });
                                        setExpanded(prev => ({ ...prev, [program.id]: true }));
                                    }}
                                    renderCardContent={(program, index) => {
                                        // Use program.approved_count for approved documents
                                        return (
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start mb-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                        style={{ backgroundColor: '#f1f5f9' }}
                                                    >
                                                        {/* Icon */}
                                                        <LuFileCheck2 className="w-5 h-5 text-[#7F0404]" />
                                                    </div>
                                                    <h2 className="text-base font-bold text-[#7F0404]">
                                                        {program.code ? program.code : ''} 
                                                        {program.code ? ' - ' : ''}
                                                        {program.name}
                                                    </h2>
                                                </div>
                                                
                                                {/* Using flex-grow to push the following content to the bottom */}
                                                <div className="flex-grow"></div>
                                                
                                                {/* Bottom aligned content */}
                                                <div className="mt-auto">
                                                    <div className="text-gray-600 mb-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-sm">Areas:</span>
                                                            <span className="font-semibold">{program.areas.length}</span>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm">Approved Documents:</span>
                                                            <span className={`font-semibold ${program.approved_count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                                {program.approved_count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                                                        <div className="flex items-center text-xs font-medium text-[#7F0404] group">
                                                            <span>View Documents</span>
                                                            <svg 
                                                                className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        ) : selected.programId && !selected.areaId ? (
                            /* Area Cards Grid when program is selected but no area is selected */
                            <div className="mt-4 mb-8">
                                <p className="text-base text-gray-700 mb-6">
                                    Select an area to view and manage its documents.
                                </p>
                                <DocumentCardGrid
                                    items={selectedProgram?.areas || []}
                                    getKey={area => area.id}
                                    onCardClick={area => {
                                        setSelected({ programId: selected.programId, areaId: area.id });
                                        setAreaExpanded(prev => ({ ...prev, [area.id]: true }));
                                    }}
                                    renderCardContent={(area, index) => {
                                        const parametersCount = area.parameters?.length || 0;
                                        // Use area.approved_count for approved documents
                                        const approvedCount = area.approved_count || 0;
                                        return (
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start mb-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                        style={{ backgroundColor: '#f1f5f9' }}
                                                    >
                                                        {/* Icon */}
                                                        <LuFileCheck2 className="w-5 h-5 text-[#7F0404]" />
                                                    </div>
                                                    <h2 className="text-base font-bold text-[#7F0404]">
                                                        {area.code ? `Area ${area.code}` : 'Area'} 
                                                        {area.code ? ' - ' : ''}
                                                        {area.name}
                                                    </h2>
                                                </div>
                                                
                                                {/* Using flex-grow to push the following content to the bottom */}
                                                <div className="flex-grow"></div>
                                                
                                                {/* Bottom aligned content */}
                                                <div className="mt-auto">
                                                    <div className="text-gray-600 mb-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-sm">Parameters:</span>
                                                            <span className="font-semibold">{parametersCount}</span>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm">Approved Documents:</span>
                                                            <span className={`font-semibold ${approvedCount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                                {approvedCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-3 border-t border-gray-100 flex justify-end">
                                                        <div className="flex items-center text-xs font-medium text-[#7F0404] group">
                                                            <span>View Documents</span>
                                                            <svg 
                                                                className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        ) : selected.programId && selected.areaId && !selected.parameterId ? (
                            // --- Parameter Cards Grid when area is selected but no parameter is selected ---
                            <div>
                                {/* Area title below program title */}
                                <div className="ml-4 min-h-[1rem] flex items-center flex-shrink-0">
                                    {selectedProgram && selectedArea ? (
                                        <h2 className="text-base font-semibold text-[#7F0404] flex items-center">
                                            <span className="font-bold mr-2">Area</span>
                                            {selectedArea.code ? <span className="font-bold mr-2">{selectedArea.code}</span> : null}
                                            - {selectedArea.name}
                                        </h2>
                                    ) : null}
                                </div>
                                <p className="text-base text-gray-700 mb-6">
                                    Select a parameter to view and manage its documents.
                                </p>
                                <DocumentCardGrid
                                    items={selectedArea?.parameters || []}
                                    getKey={param => param.id}
                                    onCardClick={param => {
                                        setSelected({ programId: selected.programId, areaId: selected.areaId, parameterId: param.id });
                                        setParamExpanded(prev => ({ ...prev, [param.id]: true })); // <-- expand selected parameter
                                    }}
                                    renderCardContent={(param, index) => (
                                        <div className="p-5 flex flex-col h-full">
                                            <div className="flex items-start mb-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                    style={{ backgroundColor: '#f1f5f9' }}
                                                >
                                                    {/* Icon */}
                                                    <LuFileCheck2 className="w-5 h-5 text-[#7F0404]" />
                                                </div>
                                                <h2 className="text-base font-bold text-[#7F0404]">
                                                    {param.code ? `${param.code} - ` : ''}
                                                    {param.name}
                                                </h2>
                                            </div>
                                            <div className="flex-grow"></div>
                                            <div className="mt-auto">
                                                <div className="text-gray-600 mb-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm">Categories:</span>
                                                        <span className="font-semibold">3</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm">Approved Documents:</span>
                                                        <span className={`font-semibold ${param.approved_count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                            {param.approved_count || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="pt-3 border-t border-gray-100 flex justify-end">
                                                    <div className="flex items-center text-xs font-medium text-[#7F0404] group">
                                                        <span>View Documents</span>
                                                        <svg
                                                            className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        ) : null}
                        {/* Display area and parameter headers only when documents are being viewed */}
                        {selected.areaId && selected.parameterId && (
                            <>
                                <div className="ml-4 min-h-[1rem] flex items-center flex-shrink-0">
                                    {selectedProgram && selectedArea ? (
                                        <h2 className="text-base font-semibold text-[#7F0404] flex items-center">
                                            <span className="font-bold mr-2">Area</span>
                                            {selectedArea.code ? <span className="font-bold mr-2">{selectedArea.code}</span> : null}
                                            - {selectedArea.name}
                                        </h2>
                                    ) : null}
                                </div>
                                <div className="ml-8 min-h-[1rem] flex items-center flex-shrink-0">
                                    {selectedProgram && selectedArea && selectedParameter ? (
                                        selected.category ? (
                                            <h3 className="text-sm font-medium text-[#7F0404] flex items-center">
                                                {selectedParameter.code ? <span className="font-bold mr-2">{selectedParameter.code}</span> : null}
                                                - {selectedParameter.name}
                                                <span className="ml-2 text-xs font-semibold text-[#C46B02]">
                                                    ({categoryList.find(cat => cat.value === selected.category)?.label || selected.category})
                                                </span>
                                            </h3>
                                        ) : (
                                            <h3 className="text-sm font-medium text-[#7F0404] flex items-center">
                                                {selectedParameter.code ? <span className="font-bold mr-2">{selectedParameter.code}</span> : null}
                                                - {selectedParameter.name}
                                            </h3>
                                        )
                                    ) : null}
                                </div>
                            </>
                        )}
                        {/* --- Document Viewer Section --- */}
                        {selected.programId && selected.areaId && selected.parameterId && (
                            <div className="mt-2 flex flex-col flex-1 min-h-0">
                                {selected.parameterId && !selected.category && (
                                    // --- Category Cards Grid when parameter is selected but no category is selected ---
                                    <div>
                                        <p className="text-base text-gray-700 mb-6">
                                            Select a category to view and manage its documents.
                                        </p>
                                        <DocumentCardGrid
                                            items={categoryList}
                                            getKey={cat => cat.value}
                                            onCardClick={cat => {
                                                setSelected({
                                                    programId: selected.programId,
                                                    areaId: selected.areaId,
                                                    parameterId: selected.parameterId,
                                                    category: cat.value
                                                });
                                            }}
                                            renderCardContent={(cat, index) => {
                                                // Show correct count for this parameter/category
                                                let approvedCount = 0;
                                                if (selectedParameter && selectedParameter.category_approved_counts) {
                                                    approvedCount = selectedParameter.category_approved_counts[cat.value] || 0;
                                                }
                                                return (
                                                    <div className="p-5 flex flex-col h-full">
                                                        <div className="flex items-start mb-3">
                                                            <div
                                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                                style={{ backgroundColor: '#f1f5f9' }}
                                                            >
                                                                {/* Icon */}
                                                                <LuFileCheck2 className="w-5 h-5 text-[#7F0404]" />
                                                            </div>
                                                            <h2 className="text-base font-bold text-[#7F0404]">
                                                                {cat.label}
                                                            </h2>
                                                        </div>
                                                        <div className="flex-grow"></div>
                                                        <div className="mt-auto">
                                                            <div className="text-gray-600 mb-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm">Approved Documents:</span>
                                                                    <span className={`font-semibold ${approvedCount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                                        {approvedCount}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="pt-3 border-t border-gray-100 flex justify-end">
                                                                <div className="flex items-center text-xs font-medium text-[#7F0404] group">
                                                                    <span>View Documents</span>
                                                                    <svg
                                                                        className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                                {selected.category && (
                                    <>
                                    <div>
                                        <p className="text-base text-gray-700 mb-2">
                                            {/* Removed the Back to list button */}
                                            {viewingDocIndex === null
                                                ? "Select a document to view."
                                                : null
                                            }
                                        </p>
                                        {/* --- Show DocumentNavigation if a document is selected --- */}
                                        {viewingDocIndex !== null && filteredDocs[filteredViewerIndex] ? (
                                            <div className="w-full flex flex-col items-center pb-4">
                                                <div className="w-full max-w-4xl mx-auto">
                                                    {(() => {
                                                        const currentDoc = filteredDocs[filteredViewerIndex];
                                                        const isVideoFile = !!(currentDoc?.filename && 
                                                            ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(
                                                                currentDoc.filename.split('.').pop()?.toLowerCase() || ''
                                                            ));
                                                        
                                                        return (
                                                            <DocumentNavigation
                                                                currentDocument={currentDoc}
                                                                currentPage={currentPage}
                                                                totalPages={totalPages}
                                                                onPageChange={setCurrentPage}
                                                                onDownload={handleDownload}
                                                                onPrint={handlePrint}
                                                                onRotate={handleRotate}
                                                                onFitMode={toggleFitMode}
                                                                onZoom={handleZoom}
                                                                onInfo={() => setInfoOpen(true)}
                                                                onGrid={openGrid}
                                                                onFullscreen={handleFullscreen}
                                                                fitMode={fitMode}
                                                                rotate={rotate}
                                                                zoom={zoom}
                                                                isFullscreen={isFullscreen}
                                                                infoOpen={infoOpen}
                                                                setInfoOpen={setInfoOpen}
                                                                gridOpen={gridOpen}
                                                                setGridOpen={setGridOpen}
                                                                search={search}
                                                                setSearch={setSearch}
                                                                onSearch={handleSearch}
                                                                // Video props - only pass when it's a video file
                                                                forceVideoMode={isVideoFile}
                                                                onRewind={isVideoFile ? handleRewind : undefined}
                                                                onPlayPause={isVideoFile ? handlePlayPause : undefined}
                                                                onFastForward={isVideoFile ? handleFastForward : undefined}
                                                                onVolumeChange={isVideoFile ? handleVolumeChange : undefined}
                                                                onMuteToggle={isVideoFile ? handleMuteToggle : undefined}
                                                                onSpeedChange={isVideoFile ? handleSpeedChange : undefined}
                                                                onPictureInPicture={isVideoFile ? handlePictureInPicture : undefined}
                                                                onTimeUpdate={isVideoFile ? handleTimeUpdate : undefined}
                                                                isPlaying={isVideoFile ? isPlaying : undefined}
                                                                volume={isVideoFile ? volume : undefined}
                                                                isMuted={isVideoFile ? isMuted : undefined}
                                                                playbackSpeed={isVideoFile ? playbackSpeed : undefined}
                                                                currentTime={isVideoFile ? currentTime : undefined}
                                                                duration={isVideoFile ? duration : undefined}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                                {(() => {
                                                    const doc = filteredDocs[filteredViewerIndex];
                                                    if (!doc) return null;
                                                    const ext = (doc.filename.split('.').pop() || '').toLowerCase();
                                                    const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
                                                    if (isVideo) return null; // handled by VideoNavigation
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
                                                    return (
                                                        <div className="w-full max-w-4xl mx-auto bg-gray-50 text-gray-500 flex items-center justify-center" style={{ height: '40vh' }}>
                                                            No preview available for this file type.
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            // --- Card grid for approved documents in this category ---
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {filteredDocs.length === 0 ? (
                                                    <div className="col-span-full text-gray-400 text-center">No approved documents for this category.</div>
                                                ) : (
                                                    filteredDocs.flatMap((doc) => {
                                                        const ext = doc.filename.split('.').pop()?.toLowerCase();
                                                        const cards = [];
                                                        // Unified preview card for all files (including videos)
                                                        cards.push(
                                                            <div
                                                                key={doc.id + '-doc'}
                                                                className="bg-white rounded-xl shadow-md border-t-4 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-lg transition"
                                                                style={{
                                                                    borderTopColor: '#7F0404',
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
                                                        return cards;
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    </>
                                )}
                            </div>
                        )}
                        {/* --- End Document Viewer Section --- */}
                    </section>
                </div>
            </DashboardLayout>

            {/* Document Upload Modal */}
            <DocumentUploadModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                sidebar={sidebar}
                csrfToken={csrfToken}
                uploadEndpoint="/reviewer/documents/upload"
                onUploadSuccess={handleUploadSuccess}
            />

            <style jsx>{`
                table { font-size: 1rem; }
                th, td { vertical-align: middle; }
                .group:hover svg {
                    filter: drop-shadow(0 2px 4px rgba(196,107,2,0.15));
                    transition: color 0.2s, transform 0.2s;
                    transform: scale(1.35);
                }
                .group svg { transition: color 0.2s, transform 0.2s; }
                .group:active { transform: scale(0.95); }
                
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .bg-white {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </>
    );
}