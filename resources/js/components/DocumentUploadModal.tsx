import { Fragment, useRef, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

// Types
type Parameter = { 
    id: number; 
    name: string; 
    code?: string; 
    approved_count?: number; 
    category_approved_counts?: Record<string, number>; 
};

type Area = { 
    id: number; 
    name: string; 
    code?: string; 
    parameters?: Parameter[]; 
};

type Program = { 
    id: number; 
    name: string; 
    code?: string; 
    areas: Area[]; 
};

interface UploadForm {
    programId: string;
    areaId: string;
    parameterId: string;
    category: string;
    file: File | null;
    video: File | null;
}

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    sidebar: Program[];
    csrfToken: string;
    uploadEndpoint: string; // e.g., '/faculty/documents/upload' or '/reviewer/documents/upload'
    onUploadSuccess?: () => void;
}

export default function DocumentUploadModal({
    isOpen,
    onClose,
    sidebar,
    csrfToken,
    uploadEndpoint,
    onUploadSuccess
}: DocumentUploadModalProps) {
    // Form state
    const [uploadForm, setUploadForm] = useState<UploadForm>({
        programId: '',
        areaId: '',
        parameterId: '',
        category: '',
        file: null,
        video: null,
    });
    
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Computed options
    const programOptions = useMemo(() =>
        sidebar.map(p => ({ value: p.id, label: p.code ? `${p.code} - ${p.name}` : p.name })),
        [sidebar]
    );

    const areaOptions = useMemo(() => {
        const prog = sidebar.find(p => p.id === Number(uploadForm.programId));
        return prog?.areas?.map(a => ({
            value: a.id,
            label: a.code ? `${a.code} - ${a.name}` : a.name,
        })) || [];
    }, [sidebar, uploadForm.programId]);

    const parameterOptions = useMemo(() => {
        if (!uploadForm.programId || !uploadForm.areaId) return [];
        const prog = sidebar.find(p => p.id === Number(uploadForm.programId));
        const area = prog?.areas?.find(a => a.id === Number(uploadForm.areaId));
        return area?.parameters?.map(param => ({
            value: param.id,
            label: param.code ? `${param.code} - ${param.name}` : param.name,
        })) || [];
    }, [sidebar, uploadForm.programId, uploadForm.areaId]);

    // Note: Video upload is now always available (not just for areas 8/9)

    // File preview effects
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

    // Event handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && file.type !== 'application/pdf') {
            setUploadErrors(errors => ({ ...errors, file: 'Only PDF files are allowed.' }));
            setUploadForm(f => ({ ...f, file: null }));
            return;
        }
        setUploadForm(f => ({ ...f, file }));
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = e.target.files?.[0] || null;
        if (video && video.type !== 'video/mp4') {
            setUploadErrors(errors => ({ ...errors, video: 'Only MP4 video files are allowed.' }));
            setUploadForm(f => ({ ...f, video: null }));
            return;
        }
        setUploadForm(f => ({ ...f, video }));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = Array.from(e.dataTransfer.files || []).find(f => f.type === 'application/pdf') || null;
        if (file && file.type !== 'application/pdf') {
            setUploadErrors(errors => ({ ...errors, file: 'Only PDF files are allowed.' }));
            setUploadForm(f => ({ ...f, file: null }));
            return;
        }
        setUploadForm(f => ({ ...f, file }));
    };

    // Drag & drop for video
    const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const video = Array.from(e.dataTransfer.files || []).find(f => f.type === 'video/mp4') || null;
        if (video && video.type !== 'video/mp4') {
            setUploadErrors(errors => ({ ...errors, video: 'Only MP4 video files are allowed.' }));
            setUploadForm(f => ({ ...f, video: null }));
            return;
        }
        setUploadForm(f => ({ ...f, video }));
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

        // Validation
        let errors: Record<string, string> = {};
        if (!uploadForm.programId) errors.programId = 'Program is required.';
        if (!uploadForm.areaId) errors.areaId = 'Area is required.';
        if (!uploadForm.parameterId) errors.parameterId = 'Parameter is required.';
        if (!uploadForm.category) errors.category = 'Category is required.';
        if (!uploadForm.file) errors.file = 'Document file is required.';
        else if (uploadForm.file.type !== 'application/pdf') errors.file = 'Only PDF files are allowed.';
        if (uploadForm.video && uploadForm.video.type !== 'video/mp4') errors.video = 'Only MP4 video files are allowed.';
        if (Object.keys(errors).length > 0) {
            setUploadErrors(errors);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('program_id', uploadForm.programId);
        formData.append('area_id', uploadForm.areaId);
        formData.append('parameter_id', uploadForm.parameterId);
        formData.append('category', uploadForm.category);
        formData.append('file', uploadForm.file);

        // Append video if present
        if (uploadForm.video) {
            formData.append('video', uploadForm.video);
        }

        try {
            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
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
                // Reset form
                setUploadForm({ programId: '', areaId: '', parameterId: '', category: '', file: null, video: null });
                setFilePreviewUrl(null);
                setVideoPreviewUrl(null);
                
                // Close modal
                onClose();
                
                // Show success message
                alert(data.message || 'Document uploaded successfully!');
                
                // Trigger success callback
                if (onUploadSuccess) {
                    onUploadSuccess();
                } else {
                    // Fallback: reload page
                    window.location.reload();
                }
            } else {
                if (data.errors) {
                    setUploadErrors(data.errors);
                } else {
                    setUploadErrors({ general: data.message || "Upload failed." });
                }
            }
        } catch {
            setUploadErrors({ general: "Upload failed. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setUploadForm({ programId: '', areaId: '', parameterId: '', category: '', file: null, video: null });
            setUploadErrors({});
            setFilePreviewUrl(null);
            setVideoPreviewUrl(null);
        }
    }, [isOpen]);

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={onClose}>
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
                                onClick={onClose}
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
                                                    <span className="text-gray-400">Drag & drop or click to upload <br /><b>(PDF only)</b></span>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="application/pdf"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            {uploadErrors.file && <div className="text-red-600 text-xs mt-1">{uploadErrors.file}</div>}
                                        </div>
                                        {/* --- Video File Upload (always available) --- */}
                                        <div className="flex-1 flex flex-col mt-4">
                                            <label className="block text-sm font-semibold mb-2 text-[#7F0404]">Video File <span className='text-xs text-gray-400'>(optional)</span></label>
                                            <div
                                                className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-3 h-28 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center"
                                                style={{ minHeight: '5rem', maxHeight: '7rem' }}
                                                onClick={() => videoInputRef.current?.click()}
                                                onDrop={handleVideoDrop}
                                                onDragOver={e => e.preventDefault()}
                                            >
                                                {uploadForm.video ? (
                                                    <div>
                                                        <div className="font-semibold text-sm text-gray-500">{uploadForm.video.name}</div>
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
                                                    <span className="text-gray-400">Drag & drop or click to upload <br /><b>(MP4 only)</b></span>
                                                )}
                                                <input
                                                    ref={videoInputRef}
                                                    type="file"
                                                    accept="video/mp4"
                                                    className="hidden"
                                                    onChange={handleVideoChange}
                                                />
                                            </div>
                                            {/* No error display, since not required */}
                                        </div>
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
                                        {/* Video preview (always shown with placeholder when no video) */}
                                        <div className="mt-4">
                                            <label className="block text-xs font-semibold mb-1 text-[#7F0404]">Video Preview</label>
                                            <div
                                                className="border rounded-lg bg-white flex items-center justify-center overflow-hidden"
                                                style={{
                                                    minHeight: '150px',
                                                    maxHeight: '200px',
                                                    width: '100%',
                                                }}
                                            >
                                                {uploadForm.video && videoPreviewUrl ? (
                                                    <video
                                                        src={videoPreviewUrl}
                                                        controls
                                                        className="w-full max-h-48 rounded bg-black"
                                                        style={{ objectFit: 'contain', height: '100%' }}
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-center">No video selected.</div>
                                                )}
                                            </div>
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
                                onClick={onClose}
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
    );
}
