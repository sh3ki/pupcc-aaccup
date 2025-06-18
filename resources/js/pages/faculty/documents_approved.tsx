import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useMemo, useCallback, useEffect } from 'react';
import React from 'react';
import { DocumentNavigation } from '@/components/DocumentNavigation';

type Parameter = { id: number; name: string; code?: string };
type Area = { id: number; name: string; code?: string; parameters?: Parameter[] };
type Program = { id: number; name: string; code?: string; areas: Area[] };

interface PageProps {
    sidebar: Program[];
    csrfToken: string;
}

export default function FacultyDocuments(props: PageProps) {
    const sidebar = props.sidebar ?? [];
    const csrfToken = props.csrfToken;
    // Track selected program, area, and parameter
    const [selected, setSelected] = useState<{ programId?: number; areaId?: number; parameterId?: number }>({});
    // Track which programs and areas are expanded
    const [expanded, setExpanded] = useState<{ [programId: number]: boolean }>({});
    const [areaExpanded, setAreaExpanded] = useState<{ [areaId: number]: boolean }>({});

    // Find selected program/area/parameter for main content
    const selectedProgram = sidebar.find(p => p.id === selected.programId);
    const selectedArea = selectedProgram?.areas?.find(a => a.id === selected.areaId);
    const selectedParameter = selectedArea?.parameters?.find(param => param.id === selected.parameterId);

    const toggleExpand = (programId: number) => {
        setExpanded(prev => ({ ...prev, [programId]: !prev[programId] }));
    };
    const toggleAreaExpand = (areaId: number) => {
        setAreaExpanded(prev => ({ ...prev, [areaId]: !prev[areaId] }));
    };

    // Modal state
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        programId: '',
        areaId: '',
        file: null as File | null,
    });
    const [uploadErrors, setUploadErrors] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

    // Dropdown logic
    const programOptions = useMemo(() =>
        sidebar.map(p => ({ value: p.id, label: p.code ? `${p.code} - ${p.name}` : p.name })),
        [sidebar]
    );
    const areaOptions = useMemo(() => {
        const prog = sidebar.find(p => p.id === Number(uploadForm.programId));
        return prog?.areas?.map(a => ({
            value: a.id,
            label: a.code ? `Area ${a.code} - ${a.name}` : `Area - ${a.name}`
        })) || [];
    }, [sidebar, uploadForm.programId]);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // File preview logic
    useEffect(() => {
        if (!uploadForm.file) {
            setFilePreviewUrl(null);
            return;
        }
        const file = uploadForm.file;
        if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setFilePreviewUrl(null);
        }
    }, [uploadForm.file]);

    // Handle file drop/select
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setUploadForm(f => ({ ...f, file }));
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;
        setUploadForm(f => ({ ...f, file }));
    };

    // Handle upload form change
    const handleUploadFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUploadForm(f => ({ ...f, [name]: value }));
    };

    // Handle upload submit
    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadErrors({});
        if (!uploadForm.programId) return setUploadErrors({ programId: "Select a program." });
        if (!uploadForm.areaId) return setUploadErrors({ areaId: "Select an area." });
        if (!uploadForm.file) return setUploadErrors({ file: "Select a document file." });

        setUploading(true);
        const formData = new FormData();
        formData.append('program_id', uploadForm.programId);
        formData.append('area_id', uploadForm.areaId);
        formData.append('file', uploadForm.file);

        try {
            // Use the CSRF token from props
            const token = csrfToken;
            
            const response = await fetch('/faculty/documents/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    // Do not set Content-Type for multipart/form-data, let the browser set it with boundary
                },
                credentials: 'same-origin',
            });

            // Handle the response
            if (response.status === 419) {
                setUploadErrors({ general: "CSRF token mismatch. Please refresh the page and try again." });
                setUploading(false);
                return;
            }

            const data = await response.json();

            if (response.ok && data.success) {
                setAddModalOpen(false);
                setUploadForm({ programId: '', areaId: '', file: null });
                setFilePreviewUrl(null);
                alert(data.message || 'Document uploaded successfully!');
                window.location.reload();
            } else {
                if (data.errors) {
                    setUploadErrors(data.errors);
                } else {
                    setUploadErrors({ general: data.message || "Upload failed." });
                }
            }
        } catch (err: any) {
            console.error("Upload error:", err);
            setUploadErrors({ general: "Upload failed. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    // State for approved documents and viewer
    const [approvedDocs, setApprovedDocs] = useState<{ id: number, filename: string, url: string, uploaded_at: string }[]>([]);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [loadingDocs, setLoadingDocs] = useState(false);

    // Remove top nav state, but keep pageInput for document navigation
    const [search, setSearch] = useState('');
    const [pageInput, setPageInput] = useState(viewerIndex + 1);

    useEffect(() => {
        setPageInput(viewerIndex + 1);
    }, [viewerIndex]);

    // Fetch approved documents when area changes
    useEffect(() => {
        if (selected.programId && selected.areaId) {
            setLoadingDocs(true);
            fetch(`/faculty/documents/approved?program_id=${selected.programId}&area_id=${selected.areaId}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then(data => {
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
    }, [selected.programId, selected.areaId]);

    // --- Navigation state ---
    const [fitMode, setFitMode] = useState<'width' | 'page'>('width');
    const [rotate, setRotate] = useState(0);
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [gridOpen, setGridOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Filtered docs for search
    const filteredDocs = search
        ? approvedDocs.filter(doc => doc.filename.toLowerCase().includes(search.toLowerCase()))
        : approvedDocs;
    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === approvedDocs[viewerIndex]?.id);
    const currentDoc = filteredDocs[filteredViewerIndex >= 0 ? filteredViewerIndex : 0];

    // Navigation handlers
    const goTo = (idx: number) => {
        if (filteredDocs.length === 0) return;
        const doc = filteredDocs[idx];
        const realIdx = approvedDocs.findIndex(d => d.id === doc.id);
        if (realIdx !== -1) setViewerIndex(realIdx);
    };
    const goFirst = () => goTo(0);
    const goLast = () => goTo(filteredDocs.length - 1);
    const goPrev = () => goTo(Math.max(0, filteredViewerIndex - 1));
    const goNext = () => goTo(Math.min(filteredDocs.length - 1, filteredViewerIndex + 1));

    // Download
    const handleDownload = () => {
        if (!currentDoc) return;
        const link = document.createElement('a');
        link.href = currentDoc.url;
        link.download = currentDoc.filename;
        link.click();
    };

    // Print
    const handlePrint = () => {
        if (!currentDoc) return;
        const win = window.open(currentDoc.url, '_blank');
        if (win) win.print();
    };

    // Rotate
    const handleRotate = (dir: 'left' | 'right') => {
        setRotate(r => (dir === 'left' ? (r - 90 + 360) % 360 : (r + 90) % 360));
    };

    // Fit mode
    const toggleFitMode = () => setFitMode(f => (f === 'width' ? 'page' : 'width'));

    // Zoom
    const handleZoom = (dir: 'in' | 'out') => {
        setZoom(z => {
            if (dir === 'in') return Math.min(z + 0.1, 2);
            else return Math.max(z - 0.1, 0.5);
        });
    };

    // Grid
    const openGrid = () => setGridOpen(true);
    const closeGrid = () => setGridOpen(false);

    // Fullscreen
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

    // Reset rotate/zoom on doc change
    useEffect(() => { setRotate(0); setZoom(1); }, [viewerIndex, selected.programId, selected.areaId]);

    // Page input sync
    useEffect(() => {
        setPageInput(filteredViewerIndex + 1);
    }, [filteredViewerIndex, search]);

    // Search submit (optional: jump to first match)
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredDocs.length > 0) goTo(0);
    };

    return (
        <>
            <Head title="Faculty Documents" />
            <DashboardLayout>
                {/* Remove pt-[38px] here */}
                <div className="flex w-full min-h-[calc(100vh-64px-40px)]">
                    {/* Sidebar: flush left, sticky below header */}
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
                            My Program Documents
                        </button>
                        <nav>
                            {sidebar.length === 0 && (
                                <div className="text-gray-500 text-sm">No assignments found.</div>
                            )}
                            {sidebar.map(program => (
                                <div key={program.id} className="mb-2">
                                    {/* Program collapsible header */}
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
                                    {/* Areas under program, collapsible */}
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
                                                            setSelected({ programId: program.id, areaId: area.id, parameterId: undefined });
                                                        }}
                                                    >
                                                        {/* Dot for area */}
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
                                                    {/* Parameters under area, collapsible */}
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
                                                                        {/* Dot for parameter */}
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
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </aside>
                    {/* Main Content */}
                    <section className="flex-1 w-full px-8 py-4 text-left flex flex-col min-h-[calc(100vh-64px-40px)] max-h-[calc(100vh-64px-40px)]">
                        {/* Header row: title left, buttons right */}
                        <div className="flex items-center justify-between flex-shrink-0">
                            <div>
                                {/* Render the heading as before */}
                                {!selected.programId ? (
                                    <h1 className="text-4xl font-bold text-[#7F0404]">Documents</h1>
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
                                    className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-2 rounded shadow transition"
                                    // TODO: Add onClick handler
                                >
                                    {/* Pending icon */}
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                    </svg>
                                    Pending
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center bg-[#7F0404] hover:bg-[#a00a0a] text-white font-semibold px-3 py-2 rounded shadow transition"
                                    onClick={() => setAddModalOpen(true)}
                                >
                                    {/* Add icon */}
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add
                                </button>
                            </div>
                        </div>
                        {/* Subtitle or instructions */}
                        {!selected.programId ? (
                            <p className="text-lg text-gray-700 mb-8">This is the documents page for faculty.</p>
                        ) : null}
                        {/* Always render area and parameter containers to preserve layout */}
                        <div className="ml-6 min-h-[1rem] flex items-center flex-shrink-0">
                            {selectedProgram && selectedArea ? (
                                <h2 className="text-xl font-semibold text-[#7F0404] flex items-center">
                                    <span className="font-bold mr-2">Area</span>
                                    {selectedArea.code ? <span className="font-bold mr-2">{selectedArea.code}</span> : null}
                                    - {selectedArea.name}
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
                                {/* Navigation bar */}
                                <DocumentNavigation
                                    documents={filteredDocs}
                                    currentIndex={filteredViewerIndex >= 0 ? filteredViewerIndex : 0}
                                    onChangeIndex={goTo}
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
                                {/* Document Preview */}
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
                                            <div className="text-gray-400 text-center">No approved documents for this area.</div>
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
                                                            <div><span className="font-semibold">Status:</span> Approved</div>
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

            {/* Add Document Modal */}
            <Transition show={addModalOpen} as={Fragment}>
                <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={() => setAddModalOpen(false)}>
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
                        <div className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#7F0404] flex flex-col">
                            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#7F0404]/90 to-[#C46B02]/80 flex-shrink-0">
                                <Dialog.Title className="text-2xl font-bold text-white tracking-tight">
                                    Add Document
                                </Dialog.Title>
                                <button
                                    onClick={() => setAddModalOpen(false)}
                                    className="text-white hover:text-[#FDDE54] transition-all duration-200 rounded-full p-1.5 focus:outline-none"
                                    aria-label="Close"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="px-8 py-8 flex-1 overflow-y-auto">
                                <form onSubmit={handleUploadSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                        {/* Left: Fields */}
                                        <div className="flex flex-col">
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Program <span className="text-red-600">*</span></label>
                                                <select
                                                    name="programId"
                                                    value={uploadForm.programId}
                                                    onChange={handleUploadFormChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                                    required
                                                >
                                                    <option value="">Select program</option>
                                                    {programOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                {uploadErrors.programId && <div className="text-red-600 text-xs mt-1">{uploadErrors.programId}</div>}
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Area <span className="text-red-600">*</span></label>
                                                <select
                                                    name="areaId"
                                                    value={uploadForm.areaId}
                                                    onChange={handleUploadFormChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                                    required
                                                    disabled={!uploadForm.programId}
                                                >
                                                    <option value="">Select area</option>
                                                    {areaOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                {uploadErrors.areaId && <div className="text-red-600 text-xs mt-1">{uploadErrors.areaId}</div>}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Document File <span className="text-red-600">*</span></label>
                                                <div
                                                    className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    onDrop={handleDrop}
                                                    onDragOver={e => e.preventDefault()}
                                                >
                                                    {uploadForm.file ? (
                                                        <div>
                                                            <div className="font-semibold">{uploadForm.file.name}</div>
                                                            <div className="text-xs text-gray-500">{uploadForm.file.type} ({(uploadForm.file.size / 1024).toFixed(1)} KB)</div>
                                                            <button
                                                                type="button"
                                                                className="mt-2 text-xs text-red-600 underline"
                                                                onClick={e => { e.stopPropagation(); setUploadForm(f => ({ ...f, file: null })); }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Drag & drop or click to upload (PDF, DOCX, PPT, etc.)</span>
                                                    )}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                    />
                                                </div>
                                                {uploadErrors.file && <div className="text-red-600 text-xs mt-1">{uploadErrors.file}</div>}
                                            </div>
                                        </div>
                                        {/* Right: Preview */}
                                        <div className="flex flex-col">
                                            <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Preview</label>
                                            <div className="border rounded-lg bg-white flex items-center justify-center flex-1 overflow-hidden">
                                                {filePreviewUrl && uploadForm.file?.type === "application/pdf" ? (
                                                    <div 
                                                        className="w-full h-full overflow-y-auto"
                                                        style={{
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: '#C46B02 #f1f5f9'
                                                        }}
                                                    >
                                                        <iframe 
                                                            src={`${filePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                                                            className="w-full h-full border-none rounded bg-white" 
                                                            title="PDF Preview"
                                                        ></iframe>
                                                    </div>
                                                ) : filePreviewUrl && uploadForm.file?.type.startsWith("image/") ? (
                                                    <div 
                                                        className="w-full h-full overflow-auto flex items-center justify-center p-4"
                                                        style={{
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: '#C46B02 #f1f5f9'
                                                        }}
                                                    >
                                                        <img src={filePreviewUrl} alt="Preview" className="max-h-full max-w-full rounded object-contain" />
                                                    </div>
                                                ) : uploadForm.file ? (
                                                    <div className="text-gray-500 text-sm">Preview not available for this file type.</div>
                                                ) : (
                                                    <div className="text-gray-400 text-center">No file selected.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {uploadErrors.general && <div className="text-red-600 text-xs mt-4">{uploadErrors.general}</div>}
                                </form>
                            </div>
                            <div className="flex flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100 px-8 pb-6 flex-shrink-0 bg-white">
                                <button
                                    type="button"
                                    className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    onClick={() => setAddModalOpen(false)}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg font-bold shadow bg-[#7F0404] text-white hover:bg-[#C46L02] hover:shadow-lg transition-all duration-200"
                                    disabled={uploading}
                                    onClick={handleUploadSubmit}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </>
    );
}
