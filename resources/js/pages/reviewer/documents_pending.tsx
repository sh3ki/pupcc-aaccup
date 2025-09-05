import { Head } from '@inertiajs/react';
import { LuFileClock } from "react-icons/lu";
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import React from 'react';
import { DocumentNavigation } from '@/components/DocumentNavigation';
import { DocumentCardGrid } from '@/components/DocumentCardGrid';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import PdfViewer from '@/components/PdfViewer';
import VideoViewer, { VideoPlayerRef } from '@/components/VideoViewer';
import PDFThumbnail from '@/components/PDFThumbnail';
import '../../echo'; // Import Echo for real-time functionality
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with multiple fallback options
if (typeof window !== 'undefined') {
    // For production environments, use CDN workers which are more reliable
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Use local .js worker for production (better compatibility than .mjs)
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
    } else {
        // Use local worker for development
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.mjs';
    }
}

// Types adapted for pending
type Parameter = { id: number; name: string; code?: string; pending_count?: number; category_pending_counts?: Record<string, number> };
type Area = { id: number; name: string; code?: string; parameters?: Parameter[]; pending_count?: number };
type Program = { id: number; name: string; code?: string; areas: Area[]; pending_count?: number };

interface PageProps {
    sidebar: Program[];
    csrfToken: string;
}

export default function ReviewerDocumentsPending(props: PageProps) {
    const [sidebar, setSidebar] = useState<Program[]>(props.sidebar ?? []);
    const csrfToken = props.csrfToken;
    // --- Add Document Modal State ---
    const [addModalOpen, setAddModalOpen] = useState(false);

    const handleUploadSuccess = () => {
        // Refresh the current view by reloading the pending documents
        window.location.reload();
    };

    // Check URL parameters to auto-open the add modal
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('add') === 'true') {
            setAddModalOpen(true);
            // Clean up the URL parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('add');
            window.history.replaceState({}, '', newUrl.toString());
        }
    }, []);

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

    // --- Pending Modal State ---
    type PendingTableRow = {
        id: number;
        type: 'file' | 'video';
        user_name?: string;
        program_code?: string;
        program_name?: string;
        area_code?: string;
        area_name?: string;
        parameter_code?: string;
        paramName?: string;
        category?: string;
        file_url?: string | null;
        file_name?: string | null;
        video_url?: string | null;
        video_name?: string | null;
        uploaded_at?: string;
        can_delete?: boolean;
    };
    const [pendingModalOpen, setPendingModalOpen] = useState(false);
    const [pendingDocsTable, setPendingDocsTable] = useState<PendingTableRow[]>([]);
    const [loadingPendingTable, setLoadingPendingTable] = useState(false);
    const [pendingTableError, setPendingTableError] = useState('');
    const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
    
    // Pagination state for pending documents modal
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const [tablePagination, setTablePagination] = useState({
        current_page: 1,
        total_pages: 1,
        per_page: 5,
        total: 0,
        has_next: false,
        has_prev: false,
    });

    // --- Real-time Notification State ---
    const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

    // Helper: flatten docs for modal (split file/video, add program/area/parameter/category info)
    type PendingServerDoc = {
        id: number;
        program_id: number;
        area_id: number;
        parameter_id: number;
        category?: string;
        filename?: string | null;
        url?: string | null;
        video_filename?: string | null;
        video_url?: string | null;
        uploaded_at?: string;
        user_name?: string;
        can_delete?: boolean;
    };

    const flattenPendingDocs = (docs: PendingServerDoc[], sidebar: Program[]): PendingTableRow[] => {
        const result: PendingTableRow[] = [];
        docs.forEach(doc => {
            // Find program, area, parameter
            let program_code = '', area_code = '', parameter_code = '', category = '';
            let program_name = '', area_name = '', paramName = '';
            for (const prog of sidebar) {
                if (prog.id === doc.program_id) {
                    program_code = prog.code || '';
                    program_name = prog.name || '';
                    for (const area of prog.areas) {
                        if (area.id === doc.area_id) {
                            area_code = area.code || '';
                            area_name = area.name || '';
                            if (area.parameters) {
                                for (const param of area.parameters) {
                                    if (param.id === doc.parameter_id) {
                                        parameter_code = param.code || '';
                                        paramName = param.name || '';
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
            category = doc.category || '';
            // Document file row
            if (doc.filename) {
                result.push({
                    id: doc.id,
                    type: 'file',
                    user_name: doc.user_name,
                    program_code,
                    program_name,
                    area_code,
                    area_name,
                    parameter_code,
                    paramName,
                    category,
                    file_url: doc.url || null,
                    file_name: doc.filename || null,
                    video_url: null,
                    video_name: null,
                    uploaded_at: doc.uploaded_at,
                    can_delete: doc.can_delete,
                });
            }
            // Video file row
            if (doc.video_filename && doc.video_url) {
                result.push({
                    id: doc.id,
                    type: 'video',
                    user_name: doc.user_name,
                    program_code,
                    program_name,
                    area_code,
                    area_name,
                    parameter_code,
                    paramName,
                    category,
                    file_url: null,
                    file_name: null,
                    video_url: doc.video_url,
                    video_name: doc.video_filename,
                    uploaded_at: doc.uploaded_at,
                    can_delete: doc.can_delete,
                });
            }
        });
        return result;
    };

    // Fetch all pending documents for modal table with pagination
    const fetchPendingTable = (page = 1) => {
        setLoadingPendingTable(true);
        setPendingTableError('');
        fetch(`/reviewer/documents/pending/data?page=${page}`, {
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPendingDocsTable(flattenPendingDocs(data.documents, sidebar));
                    setTablePagination(data.pagination || {
                        current_page: 1,
                        total_pages: 1,
                        per_page: 5,
                        total: 0,
                        has_next: false,
                        has_prev: false,
                    });
                    setCurrentTablePage(page);
                } else {
                    setPendingTableError('Failed to load pending documents.');
                }
            })
            .catch(() => setPendingTableError('Failed to load pending documents.'))
            .finally(() => setLoadingPendingTable(false));
    };

    // Open modal and fetch data
    const openPendingModal = () => {
        setPendingModalOpen(true);
        fetchPendingTable(1); // Start from page 1
    };

    // Delete confirmation modal state (for pending modal table)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, doc: PendingTableRow | null }>({ open: false, doc: null });
    const [deleteActionLoading, setDeleteActionLoading] = useState(false);
    const [deleteActionError, setDeleteActionError] = useState('');

    // Open delete confirmation modal
    const openDeleteConfirm = (docRow: PendingTableRow) => {
        setDeleteActionError('');
        setDeleteConfirm({ open: true, doc: docRow });
    };

    // Handle viewing a document from the modal table
    const handleViewFromModal = (docRow: PendingTableRow) => {
        // Find the program, area, parameter IDs from the sidebar using codes
        let targetProgramId: number | undefined;
        let targetAreaId: number | undefined;
        let targetParameterId: number | undefined;
        
        for (const program of sidebar) {
            if (program.code === docRow.program_code) {
                targetProgramId = program.id;
                for (const area of program.areas) {
                    if (area.code === docRow.area_code) {
                        targetAreaId = area.id;
                        if (area.parameters) {
                            for (const param of area.parameters) {
                                if (param.code === docRow.parameter_code) {
                                    targetParameterId = param.id;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }

        // Navigate the sidebar to the correct selection
        if (targetProgramId && targetAreaId && targetParameterId && docRow.category) {
            setSelected({
                programId: targetProgramId,
                areaId: targetAreaId,
                parameterId: targetParameterId,
                category: docRow.category
            });

            // Expand the sidebar sections
            setExpanded(prev => ({ ...prev, [targetProgramId!]: true }));
            setAreaExpanded(prev => ({ ...prev, [targetAreaId!]: true }));
            setParamExpanded(prev => ({ ...prev, [targetParameterId!]: true }));

            // Close the modal
            setPendingModalOpen(false);

            // Wait a bit for the pendingDocs to load, then find and set the viewing index
            setTimeout(() => {
                const docToFind = pendingDocs.find(doc => doc.id === docRow.id);
                if (docToFind) {
                    const realIdx = pendingDocs.findIndex(d => d.id === docRow.id);
                    if (realIdx !== -1) {
                        setViewerIndex(realIdx);
                        setViewingDocIndex(realIdx);
                    }
                }
            }, 500); // Give time for the useEffect to fetch pendingDocs
        }
    };

    // Perform delete on confirm
    const confirmDeletePending = async () => {
        if (!deleteConfirm.doc) return;
        const docId = deleteConfirm.doc.id;
        try {
            setDeleteActionLoading(true);
            setDeleteLoadingId(docId);
            const res = await fetch(`/reviewer/documents/pending/${docId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });
            let data;
            if (res.status === 404) {
                // Treat 404 as successful delete (already deleted)
                data = { success: true };
            } else {
                data = await res.json();
            }
            if (!data.success) throw new Error(data.message || 'Failed to delete document');

            // Refresh the pending modal table
            fetchPendingTable(currentTablePage);

            // Refresh the card grids by removing the deleted doc from pendingDocs
            setPendingDocs(prev => prev.filter(d => d.id !== docId));

            // If the currently viewed doc is the one deleted, adjust viewer selection
            if (currentDoc && currentDoc.id === docId) {
                const idx = viewingDocIndex ?? 0;
                const newPendingDocs = pendingDocs.filter(d => d.id !== docId);
                if (newPendingDocs.length === 0) {
                    setViewingDocIndex(null);
                } else {
                    const newFiltered = newPendingDocs.filter(doc =>
                        (!selected.parameterId || doc.parameter_id === selected.parameterId) &&
                        (!selected.category || doc.category === selected.category)
                    );
                    if (newFiltered.length === 0) {
                        setViewingDocIndex(null);
                    } else {
                        setViewingDocIndex(Math.max(0, Math.min(idx, newFiltered.length - 1)));
                    }
                }
            }

            setDeleteConfirm({ open: false, doc: null });
            setDeleteActionError('');
        } catch (e: unknown) {
            // Only show error if not a 404
            const msg = e instanceof Error ? e.message : 'Failed to delete';
            setDeleteActionError(msg);
        } finally {
            setDeleteActionLoading(false);
            setDeleteLoadingId(null);
        }
    };

    // Pagination handlers for the table
    const handleFirstPage = () => fetchPendingTable(1);
    const handlePrevPage = () => {
        if (tablePagination.has_prev) {
            fetchPendingTable(tablePagination.current_page - 1);
        }
    };
    const handleNextPage = () => {
        if (tablePagination.has_next) {
            fetchPendingTable(tablePagination.current_page + 1);
        }
    };
    const handleLastPage = () => fetchPendingTable(tablePagination.total_pages);

    // --- Pending Documents State (same as approved, but for pending) ---
    const [pendingDocs, setPendingDocs] = useState<{ id: number, filename: string, url: string, uploaded_at: string, user_name?: string, parameter_id?: number, category?: string }[]>([]);
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
            fetch(`/reviewer/documents/pending/data?program_id=${selected.programId}&area_id=${selected.areaId}&parameter_id=${selected.parameterId}&category=${selected.category}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        setPendingDocs(data.documents);
                        setViewerIndex(0);
                    } else {
                        setPendingDocs([]);
                    }
                })
                .catch(() => setPendingDocs([]))
                .finally(() => setLoadingDocs(false));
        } else if (selected.programId && selected.areaId) {
            // If only program and area are selected, fetch all docs for that area (for grid counts)
            setLoadingDocs(true);
            fetch(`/reviewer/documents/pending/data?program_id=${selected.programId}&area_id=${selected.areaId}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        setPendingDocs(data.documents);
                        setViewerIndex(0);
                    } else {
                        setPendingDocs([]);
                    }
                })
                .catch(() => setPendingDocs([]))
                .finally(() => setLoadingDocs(false));
        } else {
            setPendingDocs([]);
            setViewerIndex(0);
        }
    }, [selected.programId, selected.areaId, selected.parameterId, selected.category]);

    // --- Real-time Echo listener ---
    useEffect(() => {
        // Listen to general document updates channel
        const channel = window.Echo.channel('document-updates')
            .listen('DocumentUpdated', (e: any) => {
                setRealtimeNotification(`Document updated: ${e.message}`);
                setTimeout(() => setRealtimeNotification(null), 5000);
                refreshPendingDocs();
            })
            .listen('DocumentCreated', (e: any) => {
                setRealtimeNotification('New document added!');
                setTimeout(() => setRealtimeNotification(null), 5000);
                refreshPendingDocs();
            });

        function refreshPendingDocs() {
            // Always refresh sidebar data first
            fetch('/reviewer/documents/pending/sidebar', {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        // Update the sidebar state to reflect new counts
                        setSidebar(data.sidebar);
                    }
                })
                .catch(() => {});

            // If pending modal is open, refresh the table on current page
            if (pendingModalOpen) {
                fetchPendingTable(currentTablePage);
            }

            // Then refresh the document list if a specific selection is active
            if (selected.programId && selected.areaId && selected.parameterId && selected.category) {
                fetch(`/reviewer/documents/pending/data?program_id=${selected.programId}&area_id=${selected.areaId}&parameter_id=${selected.parameterId}&category=${selected.category}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                })
                    .then(res => res.json())
                    .then((data) => {
                        if (data.success) {
                            setPendingDocs(data.documents);
                        }
                    })
                    .catch(() => {});
            } else if (selected.programId && selected.areaId) {
                fetch(`/reviewer/documents/pending/data?program_id=${selected.programId}&area_id=${selected.areaId}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                })
                    .then(res => res.json())
                    .then((data) => {
                        if (data.success) {
                            setPendingDocs(data.documents);
                        }
                    })
                    .catch(() => {});
            }
        }

        // Cleanup on unmount
        return () => {
            window.Echo.leaveChannel('document-updates');
        };
    }, [selected.programId, selected.areaId, selected.parameterId, selected.category]);

    // --- Navigation state ---
    const [fitMode, setFitMode] = useState<'width' | 'height' | null>(null);
    const [rotate, setRotate] = useState(0);
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(0.9); // Start with 90%
    const [gridOpen, setGridOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- PDF page navigation state ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- Video state ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const videoPlayerRef = useRef<VideoPlayerRef>(null);

    // Reset to first page when document changes
    useEffect(() => {
        setCurrentPage(1);
        setTotalPages(1);
    }, [viewerIndex]);

    // Filtered docs for preview card grid: filter by parameterId and category if both are selected
    const filteredDocs = useMemo(() => {
        let docs = pendingDocs;
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
    }, [pendingDocs, selected.parameterId, selected.category, search]);

    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === pendingDocs[viewerIndex]?.id);
    

    const goTo = (idx: number) => {
        if (filteredDocs.length === 0) return;
        const doc = filteredDocs[idx];
        const realIdx = pendingDocs.findIndex(d => d.id === doc.id);
        if (realIdx !== -1) setViewerIndex(realIdx);
    };

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

    // --- Video control handlers ---
    const handleRewind = () => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.rewind();
        }
    };

    const handlePlayPause = () => {
        if (videoPlayerRef.current) {
            if (isPlaying) {
                videoPlayerRef.current.pause();
            } else {
                videoPlayerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleFastForward = () => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.fastForward();
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.setVolume(newVolume);
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const handleMuteToggle = () => {
        if (videoPlayerRef.current) {
            if (isMuted) {
                videoPlayerRef.current.setVolume(volume || 0.5);
                setIsMuted(false);
            } else {
                videoPlayerRef.current.setVolume(0);
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
            videoPlayerRef.current.requestPictureInPicture();
        }
    };

    const handleTimeUpdate = (time: number) => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.setCurrentTime(time);
        }
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

    // Only set currentDoc when viewingDocIndex is not null (i.e., DocumentNavigation is active)
    const currentDoc = (viewingDocIndex !== null && filteredDocs[viewingDocIndex]) ? filteredDocs[viewingDocIndex] : undefined;

    // --- Approve/Disapprove handlers ---
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, action: 'approve' | 'disapprove' | null }>({ open: false, action: null });
    const [disapproveComment, setDisapproveComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const handleApprove = () => {
    setDisapproveComment('');
    setConfirmModal({ open: true, action: 'approve' });
    };
    const handleDisapprove = () => {
    setDisapproveComment('');
    setConfirmModal({ open: true, action: 'disapprove' });
    };

    const confirmAction = async () => {
        if (!currentDoc || !confirmModal.action) return;
        setActionLoading(true);
        setActionError('');
        try {
            const res = await fetch(`/reviewer/documents/pending/${currentDoc.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    status: confirmModal.action === 'approve' ? 'approved' : 'disapproved',
                    comment: confirmModal.action === 'disapprove' ? disapproveComment : undefined,
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to update status');
            // Remove doc from filteredDocs/pendingDocs
            const idx = viewingDocIndex;
            const newPendingDocs = pendingDocs.filter(doc => doc.id !== currentDoc.id);
            setPendingDocs(newPendingDocs);
            // Move to next doc or close navigation if none left
            if (newPendingDocs.length === 0) {
                setViewingDocIndex(null);
            } else {
                const newFiltered = newPendingDocs.filter(doc =>
                    (!selected.parameterId || doc.parameter_id === selected.parameterId) &&
                    (!selected.category || doc.category === selected.category)
                );
                if (newFiltered.length === 0) {
                    setViewingDocIndex(null);
                } else {
                    setViewingDocIndex(Math.max(0, Math.min(idx, newFiltered.length - 1)));
                }
            }
            setConfirmModal({ open: false, action: null });
            setDisapproveComment('');
        } catch (e: any) {
            setActionError(e.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <Head title="Reviewer Pending Documents" />
            <DashboardLayout>                
                <div className="flex w-full min-h-[calc(100vh-64px-40px)] overflow-hidden">
                    {/* Sidebar - Same as approved, but for pending */}
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
                                setViewingDocIndex(null);
                            }}
                        >
                            My Program Pending Documents
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
                                            setViewingDocIndex(null);
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
                                                            setViewingDocIndex(null);
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
                                                                            setViewingDocIndex(null);
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
                                                                                            setViewingDocIndex(null);
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
                                    <h1 className="text-xl font-bold text-[#7F0404]">Reviewer Pending Documents</h1>
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
                                    className="flex items-center bg-[#C46B02] hover:bg-[#a86a00] text-white font-medium px-2 py-1.5 text-sm rounded shadow transition"
                                    onClick={openPendingModal}
                                >
                                    {/* Pending Icon */}
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/><path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                                    Pending
                                </button>
                                {/* Show Approve/Disapprove only when a document is being viewed (DocumentNavigation is active) */}
                                {currentDoc && (
                                    <>
                                        <button
                                            type="button"
                                            className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-2 py-1.5 text-sm rounded shadow transition group"
                                            onClick={handleApprove}
                                        >
                                            {/* Approve Icon */}
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            className="flex items-center bg-[#7F0404] hover:bg-[#a80000] text-white font-medium px-2 py-1.5 text-sm rounded shadow transition group"
                                            onClick={handleDisapprove}
                                        >
                                            {/* Disapprove Icon */}
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                                            Disapprove
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Program Cards Grid when no program is selected */}
                        {!selected.programId ? (
                            <div className="mt-4 mb-8">
                                <p className="text-base text-gray-700 mb-6">Select a program to view and manage its pending documents.</p>
                                <DocumentCardGrid
                                    items={sidebar}
                                    getKey={program => program.id}
                                    onCardClick={program => {
                                        setSelected({ programId: program.id });
                                        setExpanded(prev => ({ ...prev, [program.id]: true }));
                                    }}
                                    renderCardContent={(program, index) => {
                                        // Use program.pending_count for pending documents
                                        return (
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start mb-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                        style={{ backgroundColor: '#f1f5f9' }}
                                                    >
                                                        {/* Icon */}
                                                        <LuFileClock className="w-5 h-5 text-[#7F0404]" />
                                                    </div>
                                                    <h2 className="text-base font-bold text-[#7F0404]">
                                                        {program.code ? program.code : ''} 
                                                        {program.code ? ' - ' : ''}
                                                        {program.name}
                                                    </h2>
                                                </div>
                                                <div className="flex-grow"></div>
                                                <div className="mt-auto">
                                                    <div className="text-gray-600 mb-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-sm">Areas:</span>
                                                            <span className="font-semibold">{program.areas.length}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm">Pending Documents:</span>
                                                            <span className={`font-semibold ${program.pending_count && program.pending_count > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                                {program.pending_count ?? 0}
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
                                    Select an area to view and manage its pending documents.
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
                                        // Use area.pending_count for pending documents
                                        const pendingCount = area.pending_count || 0;
                                        return (
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start mb-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                        style={{ backgroundColor: '#f1f5f9' }}
                                                    >
                                                        {/* Icon */}
                                                        <LuFileClock className="w-5 h-5 text-[#7F0404]" />
                                                    </div>
                                                    <h2 className="text-base font-bold text-[#7F0404]">
                                                        {area.code ? `Area ${area.code}` : 'Area'} 
                                                        {area.code ? ' - ' : ''}
                                                        {area.name}
                                                    </h2>
                                                </div>
                                                <div className="flex-grow"></div>
                                                <div className="mt-auto">
                                                    <div className="text-gray-600 mb-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <span className="text-sm">Parameters:</span>
                                                            <span className="font-semibold">{parametersCount}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm">Pending Documents:</span>
                                                            <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                                {pendingCount}
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
                                    Select a parameter to view and manage its pending documents.
                                </p>
                                <DocumentCardGrid
                                    items={selectedArea?.parameters || []}
                                    getKey={param => param.id}
                                    onCardClick={param => {
                                        setSelected({ programId: selected.programId, areaId: selected.areaId, parameterId: param.id });
                                        setParamExpanded(prev => ({ ...prev, [param.id]: true }));
                                    }}
                                    renderCardContent={(param, index) => (
                                        <div className="p-5 flex flex-col h-full">
                                            <div className="flex items-start mb-3">
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                    style={{ backgroundColor: '#f1f5f9' }}
                                                >
                                                    {/* Icon */}
                                                    <LuFileClock className="w-5 h-5 text-[#7F0404]" />
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
                                                        <span className="text-sm">Pending Documents:</span>
                                                        <span className={`font-semibold ${param.pending_count && param.pending_count > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                            {param.pending_count ?? 0}
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
                                            Select a category to view and manage its pending documents.
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
                                                let pendingCount = 0;
                                                if (selectedParameter && selectedParameter.category_pending_counts) {
                                                    pendingCount = selectedParameter.category_pending_counts[cat.value] || 0;
                                                }
                                                return (
                                                    <div className="p-5 flex flex-col h-full">
                                                        <div className="flex items-start mb-3">
                                                            <div
                                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                                style={{ backgroundColor: '#f1f5f9' }}
                                                            >
                                                                {/* Icon */}
                                                                <LuFileClock className="w-5 h-5 text-[#7F0404]" />
                                                            </div>
                                                            <h2 className="text-base font-bold text-[#7F0404]">
                                                                {cat.label}
                                                            </h2>
                                                        </div>
                                                        <div className="flex-grow"></div>
                                                        <div className="mt-auto">
                                                            <div className="text-gray-600 mb-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm">Pending Documents:</span>
                                                                    <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                                        {pendingCount}
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
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                                {(() => {
                                                    const currentDoc = filteredDocs[filteredViewerIndex];
                                                    const ext = currentDoc?.filename?.split('.').pop()?.toLowerCase() || '';
                                                    const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
                                                    if (isVideo) {
                                                        // Video is handled by DocumentNavigation's VideoNavigation
                                                        return null;
                                                    }
                                                    if (ext === 'pdf') {
                                                        return (
                                                            <div className="w-full max-w-4xl mx-auto rounded-b-lg overflow-hidden" style={{ height: '72vh' }}>
                                                                <PdfViewer
                                                                    url={currentDoc.url}
                                                                    currentPage={currentPage}
                                                                    onTotalPagesChange={setTotalPages}
                                                                    zoom={zoom}
                                                                    rotate={rotate}
                                                                    className="w-full h-full"
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                    // For non-video non-pdf (e.g., images), show a simple preview
                                                    if (['jpg', 'jpeg', 'png'].includes(ext)) {
                                                        return (
                                                            <div className="w-full max-w-4xl mx-auto bg-gray-50 flex items-center justify-center" style={{ height: '72vh' }}>
                                                                <img src={currentDoc.url} alt={currentDoc.filename} className="max-h-full max-w-full object-contain" />
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
                                            // --- Card grid for pending documents in this category ---
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {filteredDocs.length === 0 ? (
                                                    <div className="col-span-full text-gray-400 text-center">No pending documents for this category.</div>
                                                ) : (
                                                    filteredDocs.flatMap((doc) => {
                                                        const ext = (doc.filename || '').split('.').pop()?.toLowerCase() || '';
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
                                                                    // Set the viewer to this document
                                                                    const realIdx = pendingDocs.findIndex(d => d.id === doc.id);
                                                                    setViewerIndex(realIdx);
                                                                    setViewingDocIndex(realIdx);
                                                                }}
                                                            >
                                                                <div className="w-full flex-1 flex items-center justify-center bg-gray-50 p-2 overflow-hidden">
                                                                    {['pdf'].includes(ext) ? (
                                                                        <PDFThumbnail 
                                                                            url={doc.url} 
                                                                            className="w-full h-68 border-none rounded bg-white overflow-x-hidden"
                                                                            style={{ objectFit: 'contain', height: '17rem', overflowX: 'hidden' }}
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
                                                                    <div className="text-xs text-gray-500 mb-1 text-center">{doc.user_name ? `By: ${doc.user_name}` : ''}</div>
                                                                    <div className="text-xs text-gray-400 text-center">
                                                                        {doc.uploaded_at ? `Uploaded: ${doc.uploaded_at}` : ''}
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

            {/* Pending Documents Modal */}
            <Transition show={pendingModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={() => setPendingModalOpen(false)}>
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="relative w-full max-w-5xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#C46B02] flex flex-col">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#C46B02]/90 to-[#FFD600]/80 flex-shrink-0">
                                <Dialog.Title className="text-2xl font-bold text-white tracking-tight">
                                    Pending Documents
                                </Dialog.Title>
                                <button
                                    onClick={() => setPendingModalOpen(false)}
                                    className="text-white hover:text-[#7F0404] transition-all duration-200 rounded-full p-1.5 focus:outline-none"
                                    aria-label="Close"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="px-8 pt-4 flex-1 overflow-y-auto bg-white text-black">
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                                    <table className="min-w-full text-black text-xs"> {/* Smaller font */}
                                        <thead>
                                            <tr className="bg-[#F4BB00]/30 text-[#7F0404]">
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Uploader</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Program</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Area</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Parameter</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Category</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Document</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Uploaded</th>
                                                <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-black">
                                            {loadingPendingTable ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center text-gray-500 py-8">Loading...</td>
                                                </tr>
                                            ) : pendingTableError ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center text-red-600 py-8">{pendingTableError}</td>
                                                </tr>
                                            ) : pendingDocsTable.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="text-center text-gray-400 py-8">No pending documents found.</td>
                                                </tr>
                                            ) : (
                                                pendingDocsTable.map((doc) => (
                                                    <tr key={doc.id + '-' + doc.type} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                                                        <td className="px-2 py-2 text-center truncate max-w-[120px] whitespace-nowrap">{doc.user_name}</td>
                                                        <td className="px-2 py-2 text-center truncate max-w-[80px] whitespace-nowrap">{doc.program_code}</td>
                                                        <td className="px-2 py-2 text-center truncate max-w-[80px] whitespace-nowrap">Area {doc.area_code}</td>
                                                        <td className="px-2 py-2 text-center truncate max-w-[100px] whitespace-nowrap">{doc.parameter_code}</td>
                                                        <td className="px-2 py-2 text-center truncate max-w-[90px] whitespace-nowrap">{doc.category}</td>
                                                        <td className="px-2 py-2 inline-flex text-center justify-center items-center truncate max-w-[70px] whitespace-nowrap">
                                                            {/* Only show thumbnail image for document or video */}
                                                            {doc.type === 'file' && doc.file_url ? (
                                                                doc.file_name?.toLowerCase().match(/\.(jpg|jpeg|png)$/i) ? (
                                                                    <img src={doc.file_url} alt="preview" className="w-10 h-12 object-cover border rounded shadow-sm" />
                                                                ) : doc.file_name?.toLowerCase().endsWith('.pdf') ? (
                                                                    <PDFThumbnail url={doc.file_url} className="w-10 h-12 object-cover border rounded shadow-sm" />
                                                                ) : (
                                                                    <img src={`/thumbnails/file.png`} alt="File thumbnail" className="w-10 h-12 object-cover border rounded shadow-sm" />
                                                                )
                                                            ) : doc.type === 'video' && doc.video_url ? (
                                                                <img src={`/thumbnails/video.png`} alt="Video thumbnail" className="w-10 h-12 object-cover border rounded shadow-sm" />
                                                            ) : null}
                                                        </td>
                                                        <td className="px-2 py-2 truncate max-w-[110px] whitespace-nowrap">{doc.uploaded_at}</td>
                                                        <td className="px-2 py-2 text-center space-x-2">
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center justify-center text-[#C46B02] hover:text-[#7F0404] transition"
                                                                title="View"
                                                                onClick={() => handleViewFromModal(doc)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                                    <circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                            </button>
                                {doc.type === 'file' && doc.can_delete && (
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center justify-center text-red-600 hover:text-red-800 transition disabled:opacity-50"
                                                                    title="Delete"
                                    disabled={deleteLoadingId === doc.id}
                                    onClick={() => openDeleteConfirm(doc)}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Modern Pagination Controls */}
                                {tablePagination.total_pages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-2 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/70">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium text-gray-700">
                                                Showing <span className="font-semibold text-[#7F0404]">{((tablePagination.current_page - 1) * tablePagination.per_page) + 1}</span> to{' '}
                                                <span className="font-semibold text-[#7F0404]">{Math.min(tablePagination.current_page * tablePagination.per_page, tablePagination.total)}</span> of{' '}
                                                <span className="font-semibold text-[#7F0404]">{tablePagination.total}</span> documents
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleFirstPage}
                                                disabled={!tablePagination.has_prev || loadingPendingTable}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-[#7F0404] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-all duration-200 shadow-sm"
                                                title="Go to first page"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handlePrevPage}
                                                disabled={!tablePagination.has_prev || loadingPendingTable}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300 hover:bg-gray-50 hover:text-[#7F0404] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-all duration-200 shadow-sm"
                                                title="Go to previous page"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                            </button>
                                            <div className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#7F0404] to-[#C46B02] border-t border-b border-gray-300 shadow-sm">
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-2 0V2m-6 0V2m6 18V6H7v14z" />
                                                    </svg>
                                                    Page {tablePagination.current_page} of {tablePagination.total_pages}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleNextPage}
                                                disabled={!tablePagination.has_next || loadingPendingTable}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-gray-300 hover:bg-gray-50 hover:text-[#7F0404] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-all duration-200 shadow-sm"
                                                title="Go to next page"
                                            >
                                                Next
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleLastPage}
                                                disabled={!tablePagination.has_next || loadingPendingTable}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-[#7F0404] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-all duration-200 shadow-sm"
                                                title="Go to last page"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100 px-8 pb-6 flex-shrink-0 bg-white">
                                <button
                                    type="button"
                                    className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    onClick={() => setPendingModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>

            {/* Delete Confirmation Modal */}
            <Transition show={deleteConfirm.open} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={() => setDeleteConfirm({ open: false, doc: null })}>
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#C46B02] flex flex-col">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#C46B02]/90 to-[#FFD600]/80 flex-shrink-0">
                                <Dialog.Title className="text-lg font-bold text-white tracking-tight">Delete Document</Dialog.Title>
                            </div>
                            <div className="px-6 py-6 flex-1 overflow-y-auto bg-white text-black">
                                <p>Are you sure you want to <span className="text-[#7F0404] font-bold">delete</span> this document? This action cannot be undone.</p>
                                <div className="mt-4 p-3 rounded bg-gray-50 border text-xs space-y-1">
                                    <div>
                                        <span className="font-semibold">Program:</span> {deleteConfirm.doc?.program_code || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Area:</span> {deleteConfirm.doc?.area_code ? `Area ${deleteConfirm.doc.area_code}` : '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Parameter:</span> {deleteConfirm.doc?.parameter_code || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Category:</span> {deleteConfirm.doc?.category || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Uploaded by:</span> {deleteConfirm.doc?.user_name || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Uploaded at:</span> {deleteConfirm.doc?.uploaded_at || '—'}
                                    </div>
                                </div>
                                {deleteActionError && <div className="mt-2 text-red-600 text-sm">{deleteActionError}</div>}
                            </div>
                            <div className="flex flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100 px-6 pb-5 flex-shrink-0 bg-white">
                                <button
                                    type="button"
                                    className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    onClick={() => setDeleteConfirm({ open: false, doc: null })}
                                    disabled={deleteActionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-5 py-2 rounded-lg font-semibold text-white transition bg-[#7F0404] hover:bg-[#a80000]"
                                    onClick={confirmDeletePending}
                                    disabled={deleteActionLoading}
                                >
                                    {deleteActionLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>

            {/* Confirmation Modal */}
            <Transition show={confirmModal.open} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={() => setConfirmModal({ open: false, action: null })}>
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#C46B02] flex flex-col">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#C46B02]/90 to-[#FFD600]/80 flex-shrink-0">
                                <Dialog.Title className="text-lg font-bold text-white tracking-tight">
                                    {confirmModal.action === 'approve' ? 'Approve Document' : 'Disapprove Document'}
                                </Dialog.Title>
                            </div>
                            <div className="px-6 py-6 flex-1 overflow-y-auto bg-white text-black">
                                <p>Are you sure you want to <span className={confirmModal.action === 'approve' ? 'text-green-700 font-bold' : 'text-[#7F0404] font-bold'}>{confirmModal.action}</span> this document?</p>
                                {confirmModal.action === 'disapprove' && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded p-2 text-sm"
                                            rows={3}
                                            placeholder="Add a comment for disapproval (optional)"
                                            value={disapproveComment}
                                            onChange={(e) => setDisapproveComment(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="mt-4 p-3 rounded bg-gray-50 border text-xs space-y-1">
                                    <div>
                                        <span className="font-semibold">Program:</span>{' '}
                                        {selectedProgram ? (
                                            <>
                                                {selectedProgram.code ? `${selectedProgram.code} - ` : ''}
                                                {selectedProgram.name}
                                            </>
                                        ) : '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Area:</span>{' '}
                                        {selectedArea ? (
                                            <>
                                                {selectedArea.code ? `${selectedArea.code} - ` : ''}
                                                {selectedArea.name}
                                            </>
                                        ) : '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Parameter:</span>{' '}
                                        {selectedParameter ? (
                                            <>
                                                {selectedParameter.code ? `${selectedParameter.code} - ` : ''}
                                                {selectedParameter.name}
                                            </>
                                        ) : '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Category:</span>{' '}
                                        {selected.category ? (categoryList.find(c => c.value === selected.category)?.label || selected.category) : '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Uploaded by:</span>{' '}
                                        {currentDoc?.user_name || '—'}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Uploaded at:</span>{' '}
                                        {currentDoc?.uploaded_at || '—'}
                                    </div>
                                </div>
                                {actionError && <div className="mt-2 text-red-600 text-sm">{actionError}</div>}
                            </div>
                            <div className="flex flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100 px-6 pb-5 flex-shrink-0 bg-white">
                                <button
                                    type="button"
                                    className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    onClick={() => setConfirmModal({ open: false, action: null })}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`px-5 py-2 rounded-lg font-semibold text-white transition ${confirmModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-[#7F0404] hover:bg-[#a80000]'}`}
                                    onClick={confirmAction}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Processing...' : (confirmModal.action === 'approve' ? 'Approve' : 'Disapprove')}
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>

            <style>{`
                table { font-size: 1rem; }
                th, td { vertical-align: middle; }
                .group:hover svg {
                    filter: drop-shadow(0 2px 4px rgba(196,107,2,0.15));
                    transition: color 0.2s, transform 0.2s;
                    transform: scale(1.35);
                    to { opacity: 1; transform: translateY(0); }
                }
                .bg-white {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
            <DocumentUploadModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                sidebar={sidebar}
                csrfToken={csrfToken}
                uploadEndpoint="/reviewer/documents/upload"
                onUploadSuccess={handleUploadSuccess}
            />
        </>
    );
}
