import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import FileUpload from '@/components/FileUpload';

    interface Document {
    id?: string;
    title: string;
    file: string | File;
    oldFile?: string;
}

// Move DocumentManager outside the main component to prevent recreation on every render
const DocumentManager = ({ title, documents, onAdd, onRemove, onUpdateTitle, onUpdateFile }: {
    program: 1 | 2 | 3;
    title: string;
    documents: Document[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdateTitle: (index: number, title: string) => void;
    onUpdateFile: (index: number, file: File | string) => void;
}) => {
    console.log(`[DEBUG] DocumentManager rendering - title: ${title}, documents count: ${documents.length}`);
    console.log('[DEBUG] Documents:', documents);
    
    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-[#7F0404]">{title}</h4>
                <button
                    type="button"
                    onClick={onAdd}
                    className="text-sm bg-[#7F0404] text-white px-3 py-1 rounded hover:bg-[#6B0303] transition-colors"
                >
                    Add Document
                </button>
            </div>
            
            <div className="space-y-4">
                {documents.map((document, index) => {
                    console.log(`[DEBUG] Rendering document ${index} with key: ${document.id || `doc_stable_${index}`}`);
                    return (
                        <div key={document.id || `doc_stable_${index}`} className="border border-gray-300 rounded p-3 bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-700">Document {index + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Document Title</label>
                                    <input
                                        type="text"
                                        value={document.title}
                                        onChange={(e) => {
                                            console.log(`[DEBUG] Input onChange - index: ${index}, value: "${e.target.value}"`);
                                            onUpdateTitle(index, e.target.value);
                                        }}
                                        onFocus={() => console.log(`[DEBUG] Input focused - index: ${index}`)}
                                        onBlur={() => console.log(`[DEBUG] Input blurred - index: ${index}`)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#C46B02] focus:border-transparent"
                                        placeholder="Enter document title"
                                    />
                                </div>
                                
                                <FileUpload
                                    label="Document File"
                                    value={document.file}
                                    onChange={(file) => onUpdateFile(index, file || '')}
                                    accept="image/*,.pdf,.doc,.docx"
                                    allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                                    maxSize={10}
                                />
                            </div>
                        </div>
                    );
                })}
                
                {documents.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No documents added yet. Click "Add Document" to start.
                    </div>
                )}
            </div>
        </div>
    );
};

interface OBESyllabiContent {
    hero_image: string | File;
    hero_title: string;
    hero_subtitle: string;
    section_title: string;
    program1_title: string;
    program1_image: string | File;
    program1_documents: Document[];
    program2_title: string;
    program2_image: string | File;
    program2_documents: Document[];
    program3_title: string;
    program3_image: string | File;
    program3_documents: Document[];
    footer_section_title: string;
    footer_image: string | File;
}

interface Props {
    obeSyllabiContent: OBESyllabiContent;
}

export default function LayoutExhibitOBESyllabi({ obeSyllabiContent }: Props) {
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now());

    // Hero Section State
    const [heroTitle, setHeroTitle] = useState(obeSyllabiContent.hero_title || "OBE Syllabi");
    const [heroSubtitle, setHeroSubtitle] = useState(obeSyllabiContent.hero_subtitle || 'Outcome-based education syllabi and curriculum documents');
    const [heroImage, setHeroImage] = useState<string | File>(obeSyllabiContent.hero_image || '');

    // Syllabi Documents Section State
    const [sectionTitle, setSectionTitle] = useState(obeSyllabiContent.section_title || "OBE Syllabi Preview");
    
    // BTLED Program State
    const [program1Title, setProgram1Title] = useState(obeSyllabiContent.program1_title || 'Bachelor of Technology and Livelihood Education');
    const [program1Image, setProgram1Image] = useState<string | File>(obeSyllabiContent.program1_image || '');
    const [program1Documents, setProgram1Documents] = useState<Document[]>(obeSyllabiContent.program1_documents || []);

    // BSENT Program State
    const [program2Title, setProgram2Title] = useState(obeSyllabiContent.program2_title || 'Bachelor of Science in Entrepreneurship');
    const [program2Image, setProgram2Image] = useState<string | File>(obeSyllabiContent.program2_image || '');
    const [program2Documents, setProgram2Documents] = useState<Document[]>(obeSyllabiContent.program2_documents || []);

    // BSIT Program State
    const [program3Title, setProgram3Title] = useState(obeSyllabiContent.program3_title || 'Bachelor of Science in Information Technology');
    const [program3Image, setProgram3Image] = useState<string | File>(obeSyllabiContent.program3_image || '');
    const [program3Documents, setProgram3Documents] = useState<Document[]>(obeSyllabiContent.program3_documents || []);

    // Footer Section State
    const [footerSectionTitle, setFooterSectionTitle] = useState(obeSyllabiContent.footer_section_title || 'Mula Sayo, Para Sa Bayan');
    const [footerImage, setFooterImage] = useState<string | File>(obeSyllabiContent.footer_image || '');

    // Initialize IDs for existing documents that don't have them
    useEffect(() => {
        console.log('[DEBUG] useEffect for ID initialization running');
        const addIdToDocuments = (docs: Document[]) => 
            docs.map((doc, index) => doc.id ? doc : { 
                ...doc, 
                id: `doc_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
            });

        // Only update if there are documents without IDs
        setProgram1Documents(prev => {
            const hasDocsWithoutId = prev.some(doc => !doc.id);
            console.log('[DEBUG] Program 1 - has docs without ID:', hasDocsWithoutId);
            if (hasDocsWithoutId) {
                console.log('[DEBUG] Program 1 - adding IDs to documents');
                return addIdToDocuments(prev);
            }
            return prev;
        });
        setProgram2Documents(prev => {
            const hasDocsWithoutId = prev.some(doc => !doc.id);
            console.log('[DEBUG] Program 2 - has docs without ID:', hasDocsWithoutId);
            if (hasDocsWithoutId) {
                console.log('[DEBUG] Program 2 - adding IDs to documents');
                return addIdToDocuments(prev);
            }
            return prev;
        });
        setProgram3Documents(prev => {
            const hasDocsWithoutId = prev.some(doc => !doc.id);
            console.log('[DEBUG] Program 3 - has docs without ID:', hasDocsWithoutId);
            if (hasDocsWithoutId) {
                console.log('[DEBUG] Program 3 - adding IDs to documents');
                return addIdToDocuments(prev);
            }
            return prev;
        });
    }, []); // Run only once on mount

    // Helper functions for managing documents
    const addDocument = (program: 1 | 2 | 3) => {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const newDocument: Document = { 
            id: `doc_${program}_${timestamp}_${randomId}`,
            title: '', 
            file: '', 
            oldFile: '' 
        };
        
        switch (program) {
            case 1:
                setProgram1Documents([...program1Documents, newDocument]);
                break;
            case 2:
                setProgram2Documents([...program2Documents, newDocument]);
                break;
            case 3:
                setProgram3Documents([...program3Documents, newDocument]);
                break;
        }
    };

    const removeDocument = (program: 1 | 2 | 3, index: number) => {
        switch (program) {
            case 1:
                setProgram1Documents(program1Documents.filter((_, i) => i !== index));
                break;
            case 2:
                setProgram2Documents(program2Documents.filter((_, i) => i !== index));
                break;
            case 3:
                setProgram3Documents(program3Documents.filter((_, i) => i !== index));
                break;
        }
    };

    const updateDocumentTitle = (program: 1 | 2 | 3, index: number, title: string) => {
        console.log(`[DEBUG] updateDocumentTitle called - program: ${program}, index: ${index}, title: "${title}"`);
        switch (program) {
            case 1: {
                console.log('[DEBUG] Updating program 1 documents');
                const newProgram1Docs = [...program1Documents];
                newProgram1Docs[index] = { ...newProgram1Docs[index], title };
                console.log('[DEBUG] New program 1 docs:', newProgram1Docs);
                setProgram1Documents(newProgram1Docs);
                break;
            }
            case 2: {
                console.log('[DEBUG] Updating program 2 documents');
                const newProgram2Docs = [...program2Documents];
                newProgram2Docs[index] = { ...newProgram2Docs[index], title };
                console.log('[DEBUG] New program 2 docs:', newProgram2Docs);
                setProgram2Documents(newProgram2Docs);
                break;
            }
            case 3: {
                console.log('[DEBUG] Updating program 3 documents');
                const newProgram3Docs = [...program3Documents];
                newProgram3Docs[index] = { ...newProgram3Docs[index], title };
                console.log('[DEBUG] New program 3 docs:', newProgram3Docs);
                setProgram3Documents(newProgram3Docs);
                break;
            }
        }
    };

    const updateDocumentFile = (program: 1 | 2 | 3, index: number, file: File | string) => {
        switch (program) {
            case 1: {
                const newProgram1Docs = [...program1Documents];
                newProgram1Docs[index] = { ...newProgram1Docs[index], file };
                setProgram1Documents(newProgram1Docs);
                break;
            }
            case 2: {
                const newProgram2Docs = [...program2Documents];
                newProgram2Docs[index] = { ...newProgram2Docs[index], file };
                setProgram2Documents(newProgram2Docs);
                break;
            }
            case 3: {
                const newProgram3Docs = [...program3Documents];
                newProgram3Docs[index] = { ...newProgram3Docs[index], file };
                setProgram3Documents(newProgram3Docs);
                break;
            }
        }
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();
        
        // Add basic fields
        formData.append('hero_title', heroTitle);
        formData.append('hero_subtitle', heroSubtitle);
        formData.append('section_title', sectionTitle);
        formData.append('program1_title', program1Title);
        formData.append('program2_title', program2Title);
        formData.append('program3_title', program3Title);
        formData.append('footer_section_title', footerSectionTitle);

        // Add hero image
        if (heroImage instanceof File) {
            formData.append('hero_image', heroImage);
        }

        // Add program images
        if (program1Image instanceof File) {
            formData.append('program1_image', program1Image);
        }
        if (program2Image instanceof File) {
            formData.append('program2_image', program2Image);
        }
        if (program3Image instanceof File) {
            formData.append('program3_image', program3Image);
        }

        // Add footer image
        if (footerImage instanceof File) {
            formData.append('footer_image', footerImage);
        }

        // Add documents for each program
        const programs = [
            { key: 'program1', documents: program1Documents },
            { key: 'program2', documents: program2Documents },
            { key: 'program3', documents: program3Documents }
        ];

        programs.forEach(({ key, documents }) => {
            // Send documents as JSON
            const documentsData = documents.map((doc, index) => {
                const docData: Record<string, string> = { title: doc.title };
                
                // If it's a new file upload, we'll handle it separately
                if (doc.file instanceof File) {
                    formData.append(`${key}_document_${index}`, doc.file);
                } else if (typeof doc.file === 'string' && doc.file) {
                    // Keep existing file path
                    docData.file = doc.file;
                }
                
                // Store old file path for cleanup
                if (doc.oldFile) {
                    docData.oldFile = doc.oldFile;
                }
                
                return docData;
            });
            
            formData.append(`${key}_documents`, JSON.stringify(documentsData));
        });

        router.post('/admin/layout/exhibit/obe-syllabi', formData, {
            forceFormData: true,
            onFinish: () => setSaving(false),
            onSuccess: () => {
                // Refresh the preview by updating the key with a more significant delay
                setTimeout(() => {
                    setPreviewKey(Date.now());
                }, 500);
                
                // Show success indicator
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            },
            onError: (errors) => {
                console.error('Save errors:', errors);
            },
        });
    };

    const sections = [
        { id: 'hero', name: 'Hero Section' },
        { id: 'syllabi', name: 'Syllabi Documents' },
        { id: 'footer', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: Exhibit - OBE Syllabi" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">OBE Syllabi Page Editor</h2>
                                <p className="text-sm text-gray-600">Manage content and preview changes</p>
                            </div>

                            {/* Section Navigation */}
                            <div className="mb-6 space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                                            activeSection === section.id
                                                ? 'bg-gray-100 text-[#7F0404] font-semibold'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-[#7F0404]">{section.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Dynamic Content Based on Active Section */}
                            <div className="space-y-6">
                                {/* Hero Section */}
                                {activeSection === 'hero' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Hero Section</h3>
                                        <div className="space-y-4">
                                            <FileUpload
                                                label="Hero Background Image"
                                                value={heroImage}
                                                onChange={(file) => setHeroImage(file || '')}
                                                accept="image/*"
                                                allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                maxSize={5}
                                            />

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Hero Title</label>
                                                <input
                                                    type="text"
                                                    value={heroTitle}
                                                    onChange={(e) => setHeroTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter hero title"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Hero Subtitle</label>
                                                <textarea
                                                    value={heroSubtitle}
                                                    onChange={(e) => setHeroSubtitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter hero subtitle"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Syllabi Documents Section */}
                                {activeSection === 'syllabi' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Syllabi Documents</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={sectionTitle}
                                                    onChange={(e) => setSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {/* Program 1 - BTLED */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#7F0404]">BTLED Program Title</label>
                                                    <input
                                                        type="text"
                                                        value={program1Title}
                                                        onChange={(e) => setProgram1Title(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                        placeholder="Enter BTLED program title"
                                                    />
                                                </div>

                                                <FileUpload
                                                    label="BTLED Program Image"
                                                    value={program1Image}
                                                    onChange={(file) => setProgram1Image(file || '')}
                                                    accept="image/*"
                                                    allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                    maxSize={5}
                                                />

                                                <DocumentManager
                                                    program={1}
                                                    title="BTLED Documents"
                                                    documents={program1Documents}
                                                    onAdd={() => addDocument(1)}
                                                    onRemove={(index) => removeDocument(1, index)}
                                                    onUpdateTitle={(index, title) => updateDocumentTitle(1, index, title)}
                                                    onUpdateFile={(index, file) => updateDocumentFile(1, index, file)}
                                                />
                                            </div>

                                            {/* Program 2 - BSENT */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#7F0404]">BSENT Program Title</label>
                                                    <input
                                                        type="text"
                                                        value={program2Title}
                                                        onChange={(e) => setProgram2Title(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                        placeholder="Enter BSENT program title"
                                                    />
                                                </div>

                                                <FileUpload
                                                    label="BSENT Program Image"
                                                    value={program2Image}
                                                    onChange={(file) => setProgram2Image(file || '')}
                                                    accept="image/*"
                                                    allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                    maxSize={5}
                                                />

                                                <DocumentManager
                                                    program={2}
                                                    title="BSENT Documents"
                                                    documents={program2Documents}
                                                    onAdd={() => addDocument(2)}
                                                    onRemove={(index) => removeDocument(2, index)}
                                                    onUpdateTitle={(index, title) => updateDocumentTitle(2, index, title)}
                                                    onUpdateFile={(index, file) => updateDocumentFile(2, index, file)}
                                                />
                                            </div>

                                            {/* Program 3 - BSIT */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#7F0404]">BSIT Program Title</label>
                                                    <input
                                                        type="text"
                                                        value={program3Title}
                                                        onChange={(e) => setProgram3Title(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                        placeholder="Enter BSIT program title"
                                                    />
                                                </div>

                                                <FileUpload
                                                    label="BSIT Program Image"
                                                    value={program3Image}
                                                    onChange={(file) => setProgram3Image(file || '')}
                                                    accept="image/*"
                                                    allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                    maxSize={5}
                                                />

                                                <DocumentManager
                                                    program={3}
                                                    title="BSIT Documents"
                                                    documents={program3Documents}
                                                    onAdd={() => addDocument(3)}
                                                    onRemove={(index) => removeDocument(3, index)}
                                                    onUpdateTitle={(index, title) => updateDocumentTitle(3, index, title)}
                                                    onUpdateFile={(index, file) => updateDocumentFile(3, index, file)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Section */}
                                {activeSection === 'footer' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Mula Sayo, Para sa Bayan</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={footerSectionTitle}
                                                    onChange={(e) => setFooterSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter footer section title"
                                                />
                                            </div>

                                            <FileUpload
                                                label="Background Image"
                                                value={footerImage}
                                                onChange={(file) => setFooterImage(file || '')}
                                                accept="image/*"
                                                allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                maxSize={5}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center bg-[#7F0404] hover:bg-[#4D1414] disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded shadow transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-sm"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content - Preview */}
                    <section className="flex-1 w-full px-8 py-4 pb-2 text-left flex flex-col h-full">
                        {/* Preview Header */}
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">OBE Syllabi Page Preview</h1>
                                <p className="text-sm text-gray-600">Live preview of your changes</p>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${saveSuccess ? 'bg-green-500' : 'bg-green-400'}`}></div>
                                <span className={saveSuccess ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                    {saveSuccess ? 'Preview Updated!' : 'Live Preview'}
                                </span>
                            </div>
                        </div>

                        {/* Preview Container */}
                        <div className="flex-1 min-h-0 flex justify-center">
                            <div className="h-full w-full max-w-7xl">
                                <PagePreview 
                                    pageUrl="/exhibit/obe-syllabi" 
                                    title="OBE Syllabi Page Preview"
                                    key={previewKey}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        </>
    );
}
