import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import FileUpload from '@/components/FileUpload';

interface ChedMemorandumOrderContent {
    hero_image: string | File;
    hero_title: string;
    hero_subtitle: string;
    section_title: string;
    program1_title: string;
    program1_image: string | File;
    program1_document: string | File;
    program2_title: string;
    program2_image: string | File;
    program2_document: string | File;
    program3_title: string;
    program3_image: string | File;
    program3_document: string | File;
    footer_section_title: string;
    footer_image: string | File;
}

interface Props {
    chedMemorandumOrderContent: ChedMemorandumOrderContent;
}

export default function LayoutExhibitChedMemorandumOrder({ chedMemorandumOrderContent }: Props) {
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now());

    // Hero Section State
    const [heroTitle, setHeroTitle] = useState(chedMemorandumOrderContent.hero_title || "CHED Memorandum Order");
    const [heroSubtitle, setHeroSubtitle] = useState(chedMemorandumOrderContent.hero_subtitle || 'Official memorandums and orders from the Commission on Higher Education');
    const [heroImage, setHeroImage] = useState<string | File>(chedMemorandumOrderContent.hero_image || '');

    // Memorandum Documents Section State
    const [sectionTitle, setSectionTitle] = useState(chedMemorandumOrderContent.section_title || "CHED Memorandum Order Preview");
    
    // BTLED Program State
    const [program1Title, setProgram1Title] = useState(chedMemorandumOrderContent.program1_title || 'Bachelor of Technology and Livelihood Education');
    const [program1Image, setProgram1Image] = useState<string | File>(chedMemorandumOrderContent.program1_image || '');
    const [program1Document, setProgram1Document] = useState<string | File>(chedMemorandumOrderContent.program1_document || '');

    // BSIT Program State
    const [program2Title, setProgram2Title] = useState(chedMemorandumOrderContent.program2_title || 'Bachelor of Science in Information Technology');
    const [program2Image, setProgram2Image] = useState<string | File>(chedMemorandumOrderContent.program2_image || '');
    const [program2Document, setProgram2Document] = useState<string | File>(chedMemorandumOrderContent.program2_document || '');

    // BSENT Program State
    const [program3Title, setProgram3Title] = useState(chedMemorandumOrderContent.program3_title || 'Bachelor of Science in Entrepreneurship');
    const [program3Image, setProgram3Image] = useState<string | File>(chedMemorandumOrderContent.program3_image || '');
    const [program3Document, setProgram3Document] = useState<string | File>(chedMemorandumOrderContent.program3_document || '');

    // Footer Section State
    const [footerSectionTitle, setFooterSectionTitle] = useState(chedMemorandumOrderContent.footer_section_title || 'Mula Sayo, Para Sa Bayan');
    const [footerImage, setFooterImage] = useState<string | File>(chedMemorandumOrderContent.footer_image || '');

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

        // Add program 1 files
        if (program1Image instanceof File) {
            formData.append('program1_image', program1Image);
        }
        if (program1Document instanceof File) {
            formData.append('program1_document', program1Document);
        }

        // Add program 2 files
        if (program2Image instanceof File) {
            formData.append('program2_image', program2Image);
        }
        if (program2Document instanceof File) {
            formData.append('program2_document', program2Document);
        }

        // Add program 3 files
        if (program3Image instanceof File) {
            formData.append('program3_image', program3Image);
        }
        if (program3Document instanceof File) {
            formData.append('program3_document', program3Document);
        }

        // Add footer image
        if (footerImage instanceof File) {
            formData.append('footer_image', footerImage);
        }

        router.post('/admin/layout/exhibit/ched-memorandum-order', formData, {
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
        { id: 'memorandum', name: 'Memorandum Document' },
        { id: 'footer', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: Exhibit - CHED Memorandum Order" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">CHED Memorandum Order Page Editor</h2>
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

                                {/* Memorandum Document Section */}
                                {activeSection === 'memorandum' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Memorandum Document</h3>
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

                                            {/* BTLED Document */}
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <h4 className="text-md font-semibold text-[#7F0404] mb-3">BTLED Document</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Program Title</label>
                                                        <input
                                                            type="text"
                                                            value={program1Title}
                                                            onChange={(e) => setProgram1Title(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                            placeholder="Enter BTLED program title"
                                                        />
                                                    </div>

                                                    <FileUpload
                                                        label="Program Image"
                                                        value={program1Image}
                                                        onChange={(file) => setProgram1Image(file || '')}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={5}
                                                    />

                                                    <FileUpload
                                                        label="CHED Memorandum Document"
                                                        value={program1Document}
                                                        onChange={(file) => setProgram1Document(file || '')}
                                                        accept="image/*,.pdf,.doc,.docx"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                                                        maxSize={10}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Upload memorandum document (Image, PDF, DOC, or DOCX)
                                                    </p>
                                                </div>
                                            </div>

                                            {/* BSIT Document */}
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <h4 className="text-md font-semibold text-[#7F0404] mb-3">BSIT Document</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Program Title</label>
                                                        <input
                                                            type="text"
                                                            value={program2Title}
                                                            onChange={(e) => setProgram2Title(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                            placeholder="Enter BSIT program title"
                                                        />
                                                    </div>

                                                    <FileUpload
                                                        label="Program Image"
                                                        value={program2Image}
                                                        onChange={(file) => setProgram2Image(file || '')}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={5}
                                                    />

                                                    <FileUpload
                                                        label="CHED Memorandum Document"
                                                        value={program2Document}
                                                        onChange={(file) => setProgram2Document(file || '')}
                                                        accept="image/*,.pdf,.doc,.docx"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                                                        maxSize={10}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Upload memorandum document (Image, PDF, DOC, or DOCX)
                                                    </p>
                                                </div>
                                            </div>

                                            {/* BSENT Document */}
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <h4 className="text-md font-semibold text-[#7F0404] mb-3">BSENT Document</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Program Title</label>
                                                        <input
                                                            type="text"
                                                            value={program3Title}
                                                            onChange={(e) => setProgram3Title(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                            placeholder="Enter BSENT program title"
                                                        />
                                                    </div>

                                                    <FileUpload
                                                        label="Program Image"
                                                        value={program3Image}
                                                        onChange={(file) => setProgram3Image(file || '')}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={5}
                                                    />

                                                    <FileUpload
                                                        label="CHED Memorandum Document"
                                                        value={program3Document}
                                                        onChange={(file) => setProgram3Document(file || '')}
                                                        accept="image/*,.pdf,.doc,.docx"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                                                        maxSize={10}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Upload memorandum document (Image, PDF, DOC, or DOCX)
                                                    </p>
                                                </div>
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
                                <h1 className="text-2xl font-bold text-gray-800">CHED Memorandum Order Page Preview</h1>
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
                                    pageUrl="/exhibit/ched-memorandum-order" 
                                    title="CHED Memorandum Order Page Preview"
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
