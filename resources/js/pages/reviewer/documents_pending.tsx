import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import React from 'react';
import { DocumentNavigation } from '@/components/DocumentNavigation';

type Parameter = { id: number; name: string; code?: string };
type Area = { id: number; name: string; code?: string; parameters?: Parameter[]; pending_count?: number };
type Program = { id: number; name: string; code?: string; areas: Area[] };

interface PageProps {
    sidebar: Program[];
    csrfToken: string;
}

export default function ReviewerDocumentsPending(props: PageProps) {
    const sidebar = props.sidebar ?? [];
    const [selected, setSelected] = useState<{ programId?: number; areaId?: number; parameterId?: number }>({});
    const [expanded, setExpanded] = useState<{ [programId: number]: boolean }>({});
    const [areaExpanded, setAreaExpanded] = useState<{ [areaId: number]: boolean }>({});

    const selectedProgram = sidebar.find(p => p.id === selected.programId);
    const selectedArea = selectedProgram?.areas?.find(a => a.id === selected.areaId);
    const selectedParameter = selectedArea?.parameters?.find(param => param.id === selected.parameterId);

    const toggleExpand = (programId: number) => {
        setExpanded(prev => ({ ...prev, [programId]: !prev[programId] }));
    };
    const toggleAreaExpand = (areaId: number) => {
        setAreaExpanded(prev => ({ ...prev, [areaId]: !prev[areaId] }));
    };

    // --- Pending Documents State ---
    const [pendingDocs, setPendingDocs] = useState<{ id: number, filename: string, url: string, uploaded_at: string, user_name?: string }[]>([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [search, setSearch] = useState('');
    const [pageInput, setPageInput] = useState(viewerIndex + 1);

    useEffect(() => {
        setPageInput(viewerIndex + 1);
    }, [viewerIndex]);

    // Fetch pending documents for selected program/area
    useEffect(() => {
        if (selected.programId && selected.areaId) {
            setLoadingDocs(true);
            fetch(`/reviewer/documents/pending/data?program_id=${selected.programId}&area_id=${selected.areaId}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then(data => {
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
    }, [selected.programId, selected.areaId]);

    // --- Navigation state ---
    const [fitMode, setFitMode] = useState<'width' | 'page'>('width');
    const [rotate, setRotate] = useState(0);
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [gridOpen, setGridOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const filteredDocs = search
        ? pendingDocs.filter(doc => doc.filename.toLowerCase().includes(search.toLowerCase()))
        : pendingDocs;
    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === pendingDocs[viewerIndex]?.id);
    const currentDoc = filteredDocs[filteredViewerIndex >= 0 ? filteredViewerIndex : 0];

    const goTo = (idx: number) => {
        if (filteredDocs.length === 0) return;
        const doc = filteredDocs[idx];
        const realIdx = pendingDocs.findIndex(d => d.id === doc.id);
        if (realIdx !== -1) setViewerIndex(realIdx);
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

    const toggleFitMode = () => setFitMode(f => (f === 'width' ? 'page' : 'width'));

    const handleZoom = (dir: 'in' | 'out') => {
        setZoom(z => {
            if (dir === 'in') return Math.min(z + 0.1, 2);
            else return Math.max(z - 0.1, 0.5);
        });
    };

    const openGrid = () => setGridOpen(true);
    const closeGrid = () => setGridOpen(false);

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

    useEffect(() => { setRotate(0); setZoom(1); }, [viewerIndex, selected.programId, selected.areaId]);
    useEffect(() => {
        setPageInput(filteredViewerIndex + 1);
    }, [filteredViewerIndex, search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredDocs.length > 0) goTo(0);
    };

    // Pending Modal State
    const [pendingModalOpen, setPendingModalOpen] = useState(false);
    const [pendingDocsTable, setPendingDocsTable] = useState<any[]>([]);
    const [loadingPendingTable, setLoadingPendingTable] = useState(false);
    const [pendingTableError, setPendingTableError] = useState('');
    const [viewDocId, setViewDocId] = useState<number | null>(null);

    // Fetch all pending documents for modal table
    const fetchPendingTable = () => {
        setLoadingPendingTable(true);
        setPendingTableError('');
        fetch('/reviewer/documents/pending/data', {
            headers: { 'Accept': 'application/json' },
            credentials: 'same-origin',
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setPendingDocsTable(data.documents);
                else setPendingTableError('Failed to load pending documents.');
            })
            .catch(() => setPendingTableError('Failed to load pending documents.'))
            .finally(() => setLoadingPendingTable(false));
    };

    // Open modal and fetch data
    const openPendingModal = () => {
        setPendingModalOpen(true);
        fetchPendingTable();
    };

    // Find program/area for a document (by program_code/area_code)
    function findProgramAreaByCodes(program_code: string, area_code: string) {
        for (const program of sidebar) {
            if (program.code === program_code) {
                for (const area of program.areas) {
                    if (area.code === area_code) {
                        return { programId: program.id, areaId: area.id };
                    }
                }
            }
        }
        return null;
    }

    // Helper to select a document by id after area selection
    function selectDocumentById(docId: number, programId: number, areaId: number) {
        setSelected({ programId, areaId });
        // Wait for docs to load, then set viewerIndex to the correct doc
        setTimeout(() => {
            setViewerIndex(prev => {
                const idx = pendingDocs.findIndex(d => d.id === docId);
                return idx !== -1 ? idx : 0;
            });
        }, 0);
    }

    return (
        <>
            <Head title="Reviewer Pending Documents" />
            <DashboardLayout>
                <div className="flex w-full min-h-[calc(100vh-64px-40px)]">
                    {/* Sidebar */}
                    <aside
                        className="w-1/5 bg-gray-50 p-4 h-[calc(100vh-64px-40px)] sticky top-16 self-start overflow-y-auto"
                        style={{
                            minHeight: 'calc(100vh - 64px - 40px)',
                            maxHeight: 'calc(100vh - 64px - 40px)',
                        }}
                    >
                        <button
                            type="button"
                            className={`text-lg font-bold mb-2 w-full text-left px-2 py-2 rounded transition
                                ${!selected.programId ? 'text-[#7F0404] underline underline-offset-4 decoration-2' : 'text-[#7F0404] hover:bg-gray-100'}`}
                            onClick={() => setSelected({})}
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
                                            setSelected({ programId: program.id, areaId: undefined, parameterId: undefined });
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
                                            {program.areas.map(area => {
                                                // Only show (PENDING) if pending_count > 0
                                                let pendingLabel = '';
                                                if (area.pending_count && area.pending_count > 0) {
                                                    pendingLabel = area.pending_count > 1
                                                        ? ` (PENDING - ${area.pending_count})`
                                                        : ' (PENDING)';
                                                } else {
                                                    pendingLabel = ''; // Ensure no () if no pending
                                                }
                                                return (
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
                                                                setSelected({ programId: program.id, areaId: area.id, parameterId: undefined });
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
                                                                {pendingLabel && (
                                                                    <span className="text-xs font-bold text-[#C46B02]"> {pendingLabel}</span>
                                                                )}
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
                                                                                ${selected.programId === program.id && selected.areaId === area.id && selected.parameterId === param.id
                                                                                    ? 'text-[#7F0404] underline underline-offset-4 decoration-2'
                                                                                    : 'hover:bg-gray-100'}
                                                                            `}
                                                                            onClick={() => setSelected({ programId: program.id, areaId: area.id, parameterId: param.id })}
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
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </aside>
                    {/* Main Content */}
                    <section className="flex-1 w-full px-8 py-4 text-left flex flex-col min-h-[calc(100vh-64px-40px)] max-h-[calc(100vh-64px-40px)]">
                        <div className="flex items-center justify-between flex-shrink-0">
                            <div>
                                {!selected.programId ? (
                                    <h1 className="text-4xl font-bold text-[#7F0404]">Reviewer Pending Documents</h1>
                                ) : selectedProgram ? (
                                    <h1 className="text-3xl font-bold text-[#7F0404]">
                                        {selectedProgram.code ? `${selectedProgram.code} - ` : ''}
                                        {selectedProgram.name}
                                    </h1>
                                ) : null}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="flex items-center bg-[#C46B02] hover:bg-[#a86a00] text-white font-semibold px-3 py-2 rounded shadow transition"
                                    onClick={openPendingModal}
                                >
                                    {/* Clock Icon */}
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                    </svg>
                                    Pending
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center bg-[#7F0404] hover:bg-[#a00a0a] text-white font-semibold px-3 py-2 rounded shadow transition"
                                    // Add your disapprove logic here
                                >
                                    {/* X Icon */}
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Disapprove
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center bg-[#388e3c] hover:bg-[#256029] text-white font-semibold px-3 py-2 rounded shadow transition"
                                    // Add your approve logic here
                                >
                                    {/* Check Icon */}
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve
                                </button>
                            </div>
                        </div>
                        {!selected.programId ? (
                            <p className="text-lg text-gray-700 mb-8">This is the pending documents page for reviewers.</p>
                        ) : null}
                        <div className="ml-6 min-h-[1rem] flex items-center flex-shrink-0">
                            {selectedProgram && selectedArea ? (
                                <h2 className="text-xl font-semibold text-[#7F0404] flex items-center">
                                    <span className="font-bold mr-2">Area</span>
                                    {selectedArea.code ? <span className="font-bold mr-2">{selectedArea.code}</span> : null}
                                    - {selectedArea.name} 
                                    {selectedArea.pending_count && selectedArea.pending_count > 0 ? (
                                        <span className="text-xs font-bold text-[#C46B02]">
                                            {' '}
                                            {selectedArea.pending_count > 1
                                                ? `(PENDING - ${selectedArea.pending_count})`
                                                : `(PENDING)`}
                                        </span>
                                    ) : null}
                                </h2>
                            ) : null}
                        </div>
                        <div className="ml-12 min-h-[1rem] flex items-center flex-shrink-0">
                            {selectedProgram && selectedArea && selectedParameter ? (
                                <h3 className="text-lg font-medium text-[#7F0404] flex items-center">
                                    {selectedParameter.code ? <span className="font-bold mr-2">{selectedParameter.code}</span> : null}
                                    - {selectedParameter.name}
                                </h3>
                            ) : null}
                        </div>
                        {/* --- Document Viewer Section --- */}
                        {selected.programId && selected.areaId && (
                            <div className="mt-2 flex flex-col flex-1 min-h-0">
                                <DocumentNavigation
                                    documents={filteredDocs.slice(0, 1)}
                                    currentIndex={0}
                                    onChangeIndex={() => {}} // No-op
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
                                />
                                <div
                                    ref={previewRef}
                                    className="border border-t-0 rounded-b-lg bg-white flex-1 min-h-0 flex items-center justify-center p-0"
                                    style={isFullscreen
                                        ? { height: '100vh', minHeight: 0 }
                                        : { maxHeight: '100%' }
                                    }
                                >
                                    <div className="w-full h-full flex-1 min-h-0 overflow-auto flex items-center justify-center p-4">
                                        {loadingDocs ? (
                                            <div className="text-gray-500">Loading documents...</div>
                                        ) : filteredDocs.length === 0 ? (
                                            <div className="text-gray-400 text-center">No pending documents for this area.</div>
                                        ) : (
                                            (() => {
                                                const doc = currentDoc;
                                                if (!doc) return null;
                                                const ext = doc.filename.split('.').pop()?.toLowerCase();
                                                const transform = `rotate(${rotate}deg) scale(${zoom})`;
                                                if (['pdf'].includes(ext)) {
                                                    return (
                                                        <iframe
                                                            src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                            className="w-full h-full border-none rounded bg-white"
                                                            title="PDF Document"
                                                            style={{ transform, transition: 'transform 0.2s', height: '100%' }}
                                                        ></iframe>
                                                    );
                                                } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
                                                    return (
                                                        <img
                                                            src={doc.url}
                                                            alt={doc.filename}
                                                            className="max-h-full max-w-full rounded object-contain mx-auto w-auto h-auto"
                                                            style={{ transform, transition: 'transform 0.2s', maxHeight: '100%', maxWidth: '100%' }}
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <div className="text-gray-500 text-center">
                                                            Preview not available for this file type.<br />
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[#7F0404] underline">
                                                                Download / Open
                                                            </a>
                                                        </div>
                                                    );
                                                }
                                            })()
                                        )}
                                    </div>
                                </div>
                                {/* Document Info Modal */}
                                <Transition show={infoOpen} as={Fragment}>
                                    <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={() => setInfoOpen(false)}>
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
                                            <div className="relative w-full max-w-sm mx-auto rounded-xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#7F0404] flex flex-col">
                                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#7F0404]/90 to-[#C46B02]/80">
                                                    <Dialog.Title className="text-lg font-bold text-white tracking-tight">
                                                        Document Info
                                                    </Dialog.Title>
                                                    <button
                                                        onClick={() => setInfoOpen(false)}
                                                        className="text-white hover:text-[#FFD600] transition-all duration-200 rounded-full p-1.5 focus:outline-none"
                                                        aria-label="Close"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="px-6 py-6 flex-1">
                                                    {currentDoc ? (
                                                        <div className="space-y-2 text-[#7F0404]">
                                                            <div><span className="font-semibold">Filename:</span> {currentDoc.filename}</div>
                                                            <div><span className="font-semibold">Uploaded:</span> {currentDoc.uploaded_at}</div>
                                                            <div><span className="font-semibold">Uploader:</span> {currentDoc.user_name || 'N/A'}</div>
                                                            <div><span className="font-semibold">Status:</span> Pending</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500">No document selected.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </Transition.Child>
                                    </Dialog>
                                </Transition>
                                {/* Grid Modal */}
                                <Transition show={gridOpen} as={Fragment}>
                                    <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={closeGrid}>
                                        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                                        <Transition.Child
                                            as={Fragment}
                                            enter="ease-out duration-200"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="ease-in duration-150"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <div className="relative w-full max-w-3xl mx-auto rounded-xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#7F0404] flex flex-col">
                                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#7F0404]/90 to-[#C46B02]/80">
                                                    <Dialog.Title className="text-lg font-bold text-white tracking-tight">
                                                        Document Grid
                                                    </Dialog.Title>
                                                    <button
                                                        onClick={closeGrid}
                                                        className="text-white hover:text-[#FFD600] transition-all duration-200 rounded-full p-1.5 focus:outline-none"
                                                        aria-label="Close"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="px-6 py-6 flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {filteredDocs.map((doc, idx) => (
                                                        <div
                                                            key={doc.id}
                                                            className={`border rounded-lg p-2 cursor-pointer hover:shadow-lg transition ${doc.id === currentDoc?.id ? 'border-[#C46B02] ring-2 ring-[#FFD600]' : 'border-gray-200'}`}
                                                            onClick={() => { goTo(idx); closeGrid(); }}
                                                        >
                                                            <div className="truncate text-xs font-bold text-[#7F0404] mb-2">{doc.filename}</div>
                                                            <div className="text-xs text-gray-500 mb-1">{doc.user_name ? `By: ${doc.user_name}` : ''}</div>
                                                            {(() => {
                                                                const ext = doc.filename.split('.').pop()?.toLowerCase();
                                                                if (['jpg', 'jpeg', 'png'].includes(ext)) {
                                                                    return <img src={doc.url} alt={doc.filename} className="w-full h-24 object-contain rounded" />;
                                                                } else if (['pdf'].includes(ext)) {
                                                                    return <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded text-[#C46B02] font-bold">PDF</div>;
                                                                } else {
                                                                    return <div className="w-full h-24 flex items-center justify-center bg-gray-100 rounded text-gray-400">FILE</div>;
                                                                }
                                                            })()}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Transition.Child>
                                    </Dialog>
                                </Transition>
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
                        <div className="relative w-full max-w-3xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#C46B02] flex flex-col">
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
                            <div className="px-8 py-8 flex-1 overflow-y-auto bg-white">
                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-[#F4BB00]/30 text-[#7F0404]">
                                                <th className="px-4 py-3 text-left font-bold">Submitted Date</th>
                                                <th className="px-4 py-3 text-left font-bold">Uploader</th>
                                                <th className="px-4 py-3 text-left font-bold">Program Code</th>
                                                <th className="px-4 py-3 text-left font-bold">Area Code</th>
                                                <th className="px-4 py-3 text-center font-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loadingPendingTable ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-gray-500 py-8">Loading...</td>
                                                </tr>
                                            ) : pendingTableError ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-red-600 py-8">{pendingTableError}</td>
                                                </tr>
                                            ) : pendingDocsTable.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="text-center text-gray-400 py-8">No pending documents found.</td>
                                                </tr>
                                            ) : (
                                                pendingDocsTable.map((doc, idx) => (
                                                    <tr key={doc.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                                                        <td className="px-4 py-3">{doc.uploaded_at}</td>
                                                        <td className="px-4 py-3">{doc.user_name}</td>
                                                        <td className="px-4 py-3">{doc.program_code}</td>
                                                        <td className="px-4 py-3">{doc.area_code}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                type="button"
                                                                className="inline-flex items-center justify-center text-[#C46B02] hover:text-[#7F0404] transition"
                                                                title="View"
                                                                onClick={() => {
                                                                    const match = findProgramAreaByCodes(doc.program_code, doc.area_code);
                                                                    if (match) {
                                                                        setPendingModalOpen(false);
                                                                        // Wait for modal to close, then select area and set viewerIndex to this doc
                                                                        setTimeout(() => {
                                                                            setSelected({ programId: match.programId, areaId: match.areaId });
                                                                            setTimeout(() => {
                                                                                setViewerIndex(prev => {
                                                                                    const idx = pendingDocs.findIndex(d => d.id === doc.id);
                                                                                    // If not found in current pendingDocs, set to 0 (will be corrected by useEffect)
                                                                                    return idx !== -1 ? idx : 0;
                                                                                });
                                                                            }, 100);
                                                                        }, 200);
                                                                    }
                                                                }}
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                                                    <circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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
        </>
    );
}
