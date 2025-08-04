import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import React from 'react';
import { DocumentNavigation } from '@/components/DocumentNavigation';
import { DocumentCardGrid } from '@/components/DocumentCardGrid';

type Parameter = { id: number; name: string; code?: string; disapproved_count?: number; category_disapproved_counts?: Record<string, number> };
type Area = { id: number; name: string; code?: string; parameters?: Parameter[]; disapproved_count?: number };
type Program = { id: number; name: string; code?: string; areas: Area[]; disapproved_count?: number };

interface PageProps {
    sidebar: Program[];
    csrfToken: string;
}

export default function FacultyDocumentsDisapproved(props: PageProps) {
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

    // --- Faculty: Pending Modal State ---
    const [pendingModalOpen, setPendingModalOpen] = useState(false);
    const [pendingDocs, setPendingDocs] = useState<any[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [pendingError, setPendingError] = useState('');
    const [pendingDocView, setPendingDocView] = useState<any | null>(null);
    const [loadingPendingDoc, setLoadingPendingDoc] = useState(false);

    // Fetch pending documents when modal opens
    useEffect(() => {
        if (pendingModalOpen) {
            setLoadingPending(true);
            setPendingError('');
            fetch('/faculty/documents/pending/data', {
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
        fetch(`/faculty/documents/pending/${docId}`, {
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

    // --- Disapproved Documents State ---
    const [disapprovedDocs, setDisapprovedDocs] = useState<{ id: number, filename: string, url: string, uploaded_at: string, user_name?: string }[]>([]);
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
            fetch(`/faculty/documents/disapproved/data?program_id=${selected.programId}&area_id=${selected.areaId}&parameter_id=${selected.parameterId}&category=${selected.category}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        setDisapprovedDocs(data.documents);
                        setViewerIndex(0);
                    } else {
                        setDisapprovedDocs([]);
                    }
                })
                .catch(() => setDisapprovedDocs([]))
                .finally(() => setLoadingDocs(false));
        } else if (selected.programId && selected.areaId) {
            // If only program and area are selected, fetch all docs for that area (for grid counts)
            setLoadingDocs(true);
            fetch(`/faculty/documents/disapproved/data?program_id=${selected.programId}&area_id=${selected.areaId}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.success) {
                        setDisapprovedDocs(data.documents);
                        setViewerIndex(0);
                    } else {
                        setDisapprovedDocs([]);
                    }
                })
                .catch(() => setDisapprovedDocs([]))
                .finally(() => setLoadingDocs(false));
        } else {
            setDisapprovedDocs([]);
            setViewerIndex(0);
        }
    }, [selected.programId, selected.areaId, selected.parameterId, selected.category]);

    // --- Navigation state ---
    const [fitMode, setFitMode] = useState<'width' | 'page'>('width');
    const [rotate, setRotate] = useState(0);
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [gridOpen, setGridOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Filtered docs for preview card grid: filter by parameterId and category if both are selected
    const filteredDocs = useMemo(() => {
        let docs = disapprovedDocs;
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
    }, [disapprovedDocs, selected.parameterId, selected.category, search]);

    const filteredViewerIndex = filteredDocs.findIndex(doc => doc.id === disapprovedDocs[viewerIndex]?.id);
    const currentDoc = filteredDocs[filteredViewerIndex >= 0 ? filteredViewerIndex : 0];

    const goTo = (idx: number) => {
        if (filteredDocs.length === 0) return;
        const doc = filteredDocs[idx];
        const realIdx = disapprovedDocs.findIndex(d => d.id === doc.id);
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

    // --- Add Document Modal State (copied/adapted from faculty) ---
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        programId: '',
        areaId: '',
        parameterId: '',
        category: '', // <-- add category field
        file: null as File | null,
        video: null as File | null, // <-- add video field
    });
    const [uploadErrors, setUploadErrors] = useState<any>({});
    const [uploading, setUploading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null); // <-- for video preview

    const programOptions = useMemo(() =>
        sidebar.map(p => ({ value: p.id, label: p.code ? `${p.code} - ${p.name}` : p.name })),
        [sidebar]
    );
    const areaOptions = useMemo(() => {
        const prog = sidebar.find(p => p.id === Number(uploadForm.programId));
        return prog?.areas?.map(a => ({
            value: a.id,
            label: a.code ? `Area ${a.code} - ${a.name}` : `Area - ${a.name}`,
            parameters: a.parameters || [],
        })) || [];
    }, [sidebar, uploadForm.programId]);

    // Compute parameter options based on selected area
    const parameterOptions = useMemo(() => {
        if (!uploadForm.programId || !uploadForm.areaId) return [];
        const prog = sidebar.find(p => p.id === Number(uploadForm.programId));
        const area = prog?.areas?.find(a => a.id === Number(uploadForm.areaId));
        return area?.parameters?.map(param => ({
            value: param.id,
            label: param.code ? `${param.code} - ${param.name}` : param.name,
        })) || [];
    }, [sidebar, uploadForm.programId, uploadForm.areaId]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null); // <-- for video input ref

    useEffect(() => {
        if (!uploadForm.file) {
            setFilePreviewUrl(null);
            return;
        }
        const file = uploadForm.file;
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setFilePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setFilePreviewUrl(null);
        }
    }, [uploadForm.file]);

    // Video preview effect
    useEffect(() => {
        if (!uploadForm.video) {
            setVideoPreviewUrl(null);
            return;
        }
        const file = uploadForm.video;
        if (file.type.startsWith("video/")) {
            const url = URL.createObjectURL(file);
            setVideoPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setVideoPreviewUrl(null);
        }
    }, [uploadForm.video]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setUploadForm(f => ({ ...f, file }));
    };
    // Video file change handler
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = e.target.files?.[0] || null;
        setUploadForm(f => ({ ...f, video }));
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;
        setUploadForm(f => ({ ...f, file }));
    };
    const handleUploadFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUploadForm(f => {
            // Reset areaId, parameterId, and category if program changes
            if (name === "programId") {
                return { ...f, programId: value, areaId: '', parameterId: '', category: '', file: f.file, video: f.video };
            }
            // Reset parameterId and category if area changes
            if (name === "areaId") {
                return { ...f, areaId: value, parameterId: '', category: '', file: f.file, video: f.video };
            }
            // Reset category if parameter changes
            if (name === "parameterId") {
                return { ...f, parameterId: value, category: '', file: f.file, video: f.video };
            }
            return { ...f, [name]: value };
        });
    };
    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadErrors({});
        if (!uploadForm.programId) return setUploadErrors({ programId: "Select a program." });
        if (!uploadForm.areaId) return setUploadErrors({ areaId: "Select an area." });
        if (!uploadForm.parameterId) return setUploadErrors({ parameterId: "Select a parameter." });
        if (!uploadForm.category) return setUploadErrors({ category: "Select a category." }); // <-- require category
        if (!uploadForm.file) return setUploadErrors({ file: "Select a document file." });

        setUploading(true);
        const formData = new FormData();
        formData.append('program_id', uploadForm.programId);
        formData.append('area_id', uploadForm.areaId);
        formData.append('parameter_id', uploadForm.parameterId);
        formData.append('category', uploadForm.category); // <-- append category
        formData.append('file', uploadForm.file);
        // Append video if present
        if (uploadForm.video) {
            formData.append('video', uploadForm.video);
        }

        try {
            const token = csrfToken;
            const response = await fetch('/reviewer/documents/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                credentials: 'same-origin',
            });

            if (response.status === 419) {
                setUploadErrors({ general: "CSRF token mismatch. Please refresh the page and try again." });
                setUploading(false);
                return;
            }

            const data = await response.json();

            if (response.ok && data.success) {
                setAddModalOpen(false);
                setUploadForm({ programId: '', areaId: '', parameterId: '', category: '', file: null, video: null });
                setFilePreviewUrl(null);
                setVideoPreviewUrl(null);
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
            setUploadErrors({ general: "Upload failed. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    // Helper: is selected area 8 or 9?
    const isArea8or9 = (() => {
        if (!uploadForm.programId || !uploadForm.areaId) return false;
        const prog = sidebar.find(p => p.id === Number(uploadForm.programId));
        const area = prog?.areas?.find(a => a.id === Number(uploadForm.areaId));
        // Accept both numeric and Roman numeral codes
        const code = (area?.code || '').toString().toUpperCase();
        return area && (
            code === 'VIII' || code === 'IX'
        );
    })();

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
            <Head title="Reviewer Disapproved Documents" />
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
                                setViewingDocIndex(null);
                            }}
                        >
                            My Program Disapproved Documents
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
                                    <h1 className="text-xl font-bold text-[#7F0404]">Reviewer Disapproved Documents</h1>
                                ) : selectedProgram ? (
                                    <h1 className="text-lg font-bold text-[#7F0404]">
                                        {selectedProgram.code ? `${selectedProgram.code} - ` : ''}
                                        {selectedProgram.name}
                                    </h1>
                                ) : null}
                            </div>
                            {/* No Add button for disapproved page */}
                        </div>
                        
                        {/* Program Cards Grid when no program is selected */}
                        {!selected.programId ? (
                            <div className="mt-4 mb-8">
                                <p className="text-base text-gray-700 mb-6">Select a program to view its disapproved documents.</p>
                                <DocumentCardGrid
                                    items={sidebar}
                                    getKey={program => program.id}
                                    onCardClick={program => {
                                        setSelected({ programId: program.id });
                                        setExpanded(prev => ({ ...prev, [program.id]: true }));
                                    }}
                                    renderCardContent={(program, index) => {
                                        return (
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start mb-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                        style={{ backgroundColor: '#f1f5f9' }}
                                                    >
                                                        <svg className="w-5 h-5 text-[#7F0404]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6H5z" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M14 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
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
                                                            <span className="text-sm">Disapproved Documents:</span>
                                                            <span className={`font-semibold ${program.disapproved_count > 0 ? 'text-[#7F0404]' : 'text-gray-500'}`}>
                                                                {program.disapproved_count}
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
                            <div className="mt-4 mb-8">
                                <p className="text-base text-gray-700 mb-6">
                                    Select an area to view its disapproved documents.
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
                                        const disapprovedCount = area.disapproved_count || 0;
                                        return (
                                            <div className="p-5 flex flex-col h-full">
                                                <div className="flex items-start mb-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                        style={{ backgroundColor: '#f1f5f9' }}
                                                    >
                                                        <svg className="w-5 h-5 text-[#7F0404]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6H5z" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M14 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
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
                                                            <span className="text-sm">Disapproved Documents:</span>
                                                            <span className={`font-semibold ${area.disapproved_count > 0 ? 'text-[#7F0404]' : 'text-gray-500'}`}>
                                                                {area.disapproved_count}
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
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
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
                                    Select a parameter to view its disapproved documents.
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
                                                    <svg className="w-5 h-5 text-[#7F0404]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6H5z" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M14 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
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
                                                        <span className="text-sm">Disapproved Documents:</span>
                                                        <span className={`font-semibold ${param.disapproved_count > 0 ? 'text-[#7F0404]' : 'text-gray-500'}`}>
                                                            {param.disapproved_count || 0}
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
                        {selected.programId && selected.areaId && selected.parameterId && (
                            <div className="mt-2 flex flex-col flex-1 min-h-0">
                                {selected.parameterId && !selected.category && (
                                    // --- Category Cards Grid when parameter is selected but no category is selected ---
                                    <div>
                                        <p className="text-base text-gray-700 mb-6">
                                            Select a category to view its disapproved documents.
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
                                                let disapprovedCount = 0;
                                                if (selectedParameter && selectedParameter.category_disapproved_counts) {
                                                    disapprovedCount = selectedParameter.category_disapproved_counts[cat.value] || 0;
                                                }
                                                return (
                                                    <div className="p-5 flex flex-col h-full">
                                                        <div className="flex items-start mb-3">
                                                            <div
                                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1"
                                                                style={{ backgroundColor: '#f1f5f9' }}
                                                            >
                                                                <svg className="w-5 h-5 text-[#7F0404]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6H5z" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M14 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                            <h2 className="text-base font-bold text-[#7F0404]">
                                                                {cat.label}
                                                            </h2>
                                                        </div>
                                                        <div className="flex-grow"></div>
                                                        <div className="mt-auto">
                                                            <div className="text-gray-600 mb-4">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm">Disapproved Documents:</span>
                                                                    <span className={`font-semibold ${disapprovedCount > 0 ? 'text-[#7F0404]' : 'text-gray-500'}`}>
                                                                        {disapprovedCount}
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
                                            <div className="w-full flex flex-col items-center">
                                                <div className="w-full max-w-4xl mx-auto">
                                                    <DocumentNavigation
                                                        documents={filteredDocs}
                                                        currentIndex={filteredViewerIndex}
                                                        onChangeIndex={idx => goTo(idx)}
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
                                                </div>
                                                <div
                                                    ref={previewRef}
                                                    className="w-full max-w-4xl mx-auto bg-white rounded-b-lg shadow-lg flex flex-col items-center justify-center overflow-hidden"
                                                    style={{
                                                        minHeight: 480,
                                                        maxHeight: '70vh',
                                                        marginBottom: 24,
                                                        marginTop: 0,
                                                        borderBottomLeftRadius: 14,
                                                        borderBottomRightRadius: 14,
                                                    }}
                                                >
                                                    {/* --- Document Preview --- */}
                                                    {(() => {
                                                        const doc = filteredDocs[filteredViewerIndex];
                                                        if (!doc) return null;
                                                        const ext = doc.filename.split('.').pop()?.toLowerCase();
                                                        if (['pdf'].includes(ext)) {
                                                            return (
                                                                <iframe
                                                                    src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                    className="w-full h-[65vh] border-none rounded-b-lg bg-white"
                                                                    title="PDF Preview"
                                                                    style={{
                                                                        objectFit: 'contain',
                                                                        minHeight: 480,
                                                                        maxHeight: '65vh',
                                                                    }}
                                                                ></iframe>
                                                            );
                                                        } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
                                                            return (
                                                                <img
                                                                    src={doc.url}
                                                                    alt={doc.filename}
                                                                    className="max-h-[65vh] max-w-full rounded-b-lg object-contain mx-auto w-auto h-auto"
                                                                    style={{
                                                                        width: '100%',
                                                                        objectFit: 'contain',
                                                                        minHeight: 480,
                                                                        maxHeight: '65vh',
                                                                    }}
                                                                />
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="w-full h-[65vh] flex items-center justify-center bg-gray-100 rounded-b-lg text-gray-400 text-xs">
                                                                    No preview available for this file type.
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        ) : (
                                            // --- Card grid for disapproved documents in this category ---
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                {filteredDocs.length === 0 ? (
                                                    <div className="col-span-full text-gray-400 text-center">No disapproved documents for this category.</div>
                                                ) : (
                                                    filteredDocs.flatMap((doc, idx) => {
                                                        const ext = doc.filename.split('.').pop()?.toLowerCase();
                                                        const cards = [];
                                                        // Always show the document preview card
                                                        cards.push(
                                                            <div
                                                                key={doc.id + '-doc'}
                                                                className="bg-white rounded-xl shadow-md border-t-4 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-lg transition"
                                                                style={{
                                                                    borderTopColor: '#7F0404',
                                                                    aspectRatio: '8.5/13',
                                                                    maxWidth: 255,
                                                                    minHeight: 380,
                                                                }}
                                                                onClick={() => {
                                                                    const realIdx = disapprovedDocs.findIndex(d => d.id === doc.id);
                                                                    setViewerIndex(realIdx);
                                                                    setViewingDocIndex(realIdx);
                                                                }}
                                                            >
                                                                <div className="w-full flex-1 flex items-center justify-center bg-gray-50 p-2">
                                                                    {['pdf'].includes(ext) ? (
                                                                        <iframe
                                                                            src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                            className="w-full h-56 border-none rounded bg-white"
                                                                            title="PDF Preview"
                                                                            style={{ objectFit: 'contain', height: '17rem' }}
                                                                        ></iframe>
                                                                    ) : ['jpg', 'jpeg', 'png'].includes(ext) ? (
                                                                        <img
                                                                            src={doc.url}
                                                                            alt={doc.filename}
                                                                            className="max-h-56 max-w-full rounded object-contain mx-auto w-auto h-auto"
                                                                            style={{ width: '100%', objectFit: 'contain', height: '14rem' }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-56 flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs">
                                                                            No preview available for this file type.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="w-full px-4 py-2 flex flex-col items-center border-t border-gray-100">
                                                                    <div className="truncate w-full text-xs font-bold text-[#7F0404] mb-1 text-center">{doc.filename}</div>
                                                                    <div className="text-xs text-gray-500 mb-1 text-center">{doc.user_name ? `By: ${doc.user_name}` : ''}</div>
                                                                    <div className="text-xs text-gray-400 text-center">
                                                                        {doc.updated_at
                                                                            ? `Disapproved: ${doc.updated_at}`
                                                                            : doc.uploaded_at
                                                                                ? `Disapproved: ${doc.uploaded_at}`
                                                                                : ''}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                        // If there is a video_filename, show a separate preview card for the video
                                                        if (doc.video_filename) {
                                                            const videoUrl = doc.video_filename.startsWith('http')
                                                                ? doc.video_filename
                                                                : `/storage/documents/${doc.video_filename}`;
                                                            cards.push(
                                                                <div
                                                                    key={doc.id + '-video'}
                                                                    className="bg-white rounded-xl shadow-md border-t-4 flex flex-col items-center overflow-hidden cursor-pointer hover:shadow-lg transition"
                                                                    style={{
                                                                        borderTopColor: '#7F0404',
                                                                        aspectRatio: '8.5/13',
                                                                        maxWidth: 255,
                                                                        minHeight: 380,
                                                                    }}
                                                                    onClick={() => {
                                                                        const realIdx = disapprovedDocs.findIndex(d => d.id === doc.id);
                                                                        setViewerIndex(realIdx);
                                                                        setViewingDocIndex(realIdx);
                                                                    }}
                                                                >
                                                                    <div className="w-full flex-1 flex items-center justify-center bg-gray-50 p-2">
                                                                        <video
                                                                            src={videoUrl}
                                                                            controls
                                                                            className="w-full h-56 rounded bg-black"
                                                                            style={{ objectFit: 'contain', height: '17rem' }}
                                                                        />
                                                                    </div>
                                                                    <div className="w-full px-4 py-2 flex flex-col items-center border-t border-gray-100">
                                                                        <div className="truncate w-full text-xs font-bold text-[#7F0404] mb-1 text-center">{doc.filename} (Video)</div>
                                                                        <div className="text-xs text-gray-500 mb-1 text-center">{doc.user_name ? `By: ${doc.user_name}` : ''}</div>
                                                                        <div className="text-xs text-gray-400 text-center">
                                                                            {doc.updated_at
                                                                                ? `Disapproved: ${doc.updated_at}`
                                                                                : doc.uploaded_at
                                                                                    ? `Disapproved: ${doc.uploaded_at}`
                                                                                    : ''}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
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
                    </section>
                </div>
            </DashboardLayout>

            {/* Add Document Modal (copied/adapted from faculty) */}
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
                        <div
                            className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-white border-t-8 border-[#7F0404] flex flex-col"
                            style={{
                                maxHeight: '90vh', // Prevent modal from exceeding viewport
                            }}
                        >
                            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#7F0404]/90 to-[#C46B02]/80 flex-shrink-0">
                                <Dialog.Title className="text-xl font-bold text-white tracking-tight">
                                    Add Document
                                </Dialog.Title>
                                <button
                                    onClick={() => setAddModalOpen(false)}
                                    className="text-white hover:text-[#FDDE54] transition-all duration-200 rounded-full p-1.5 focus:outline-none"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div
                                className="px-8 py-8 flex-1 overflow-y-auto"
                                style={{
                                    minHeight: 0,
                                    maxHeight: 'calc(90vh - 120px)', // Adjust for header/footer
                                }}
                            >
                                <form onSubmit={handleUploadSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
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
                                            {/* Parameter Dropdown */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Parameter <span className="text-red-600">*</span></label>
                                                <select
                                                    name="parameterId"
                                                    value={uploadForm.parameterId}
                                                    onChange={handleUploadFormChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                                    required
                                                    disabled={!uploadForm.areaId}
                                                >
                                                    <option value="">Select parameter</option>
                                                    {parameterOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                {uploadErrors.parameterId && <div className="text-red-600 text-xs mt-1">{uploadErrors.parameterId}</div>}
                                            </div>
                                            {/* Category Dropdown */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Category <span className="text-red-600">*</span></label>
                                                <select
                                                    name="category"
                                                    value={uploadForm.category}
                                                    onChange={handleUploadFormChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                                    required
                                                    disabled={!uploadForm.parameterId}
                                                >
                                                    <option value="">Select category</option>
                                                    <option value="system">System</option>
                                                    <option value="implementation">Implementation</option>
                                                    <option value="outcomes">Outcomes</option>
                                                </select>
                                                {uploadErrors.category && <div className="text-red-600 text-xs mt-1">{uploadErrors.category}</div>}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Document File <span className="text-red-600">*</span></label>
                                                <div
                                                    className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-3 h-28 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center"
                                                    style={{ minHeight: '5rem', maxHeight: '7rem' }}
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
                                            {/* --- Video File Upload (only for Area 8 or 9) --- */}
                                            {isArea8or9 && (
                                                <div className="flex-1 flex flex-col mt-4">
                                                    <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Video File (optional)</label>
                                                    <div
                                                        className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-3 h-28 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center"
                                                        style={{ minHeight: '5rem', maxHeight: '7rem' }}
                                                        onClick={() => videoInputRef.current?.click()}
                                                    >
                                                        {uploadForm.video ? (
                                                            <div>
                                                                <div className="font-semibold">{uploadForm.video.name}</div>
                                                                <div className="text-xs text-gray-500">{uploadForm.video.type} ({(uploadForm.video.size / 1024).toFixed(1)} KB)</div>
                                                                <button
                                                                    type="button"
                                                                    className="mt-2 text-xs text-red-600 underline"
                                                                    onClick={e => { e.stopPropagation(); setUploadForm(f => ({ ...f, video: null })); }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Click to upload a video file (MP4, MOV, AVI, etc.)</span>
                                                        )}
                                                        <input
                                                            ref={videoInputRef}
                                                            type="file"
                                                            accept="video/*"
                                                            className="hidden"
                                                            onChange={handleVideoChange}
                                                        />
                                                    </div>
                                                    {/* No error display, since not required */}
                                                </div>
                                            )}
                                            {/* --- End Video File Upload --- */}
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Preview</label>
                                            <div
                                                className="border rounded-lg bg-white flex items-center justify-center overflow-hidden"
                                                style={{
                                                    minHeight: '180px',
                                                    maxHeight: '400px',
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    aspectRatio: '8.5/11', // Portrait document aspect ratio
                                                }}
                                            >
                                                {uploadForm.file ? (
                                                    uploadForm.file.type === "application/pdf" ? (
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
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                            ></iframe>
                                                        </div>
                                                    ) : uploadForm.file.type.startsWith("image/") ? (
                                                        <div 
                                                            className="w-full h-full overflow-auto flex items-center justify-center p-4"
                                                            style={{
                                                                scrollbarWidth: 'thin',
                                                                scrollbarColor: '#C46B02 #f1f5f9'
                                                            }}
                                                        >
                                                            <img
                                                                src={filePreviewUrl}
                                                                alt="Preview"
                                                                className="max-h-full max-w-full rounded object-contain"
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500 text-sm">Preview not available for this file type.</div>
                                                    )
                                                ) : (
                                                    <div className="text-gray-400 text-center">No file selected.</div>
                                                )}
                                            </div>
                                            {/* Video preview (if video selected) */}
                                            {isArea8or9 && uploadForm.video && videoPreviewUrl && (
                                                <div className="mt-4">
                                                    <label className="block text-xs font-semibold mb-1 text-[#7F0404]">Video Preview</label>
                                                    <video
                                                        src={videoPreviewUrl}
                                                        controls
                                                        className="w-full max-h-48 rounded"
                                                    />
                                                </div>
                                            )}
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