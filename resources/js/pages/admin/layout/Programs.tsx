import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import FileUpload from '@/components/FileUpload';

interface ProgramItem {
    image: string | File;
    title: string;
    short: string;
    description: string;
    href: string;
}

interface ProgramsContent {
    hero_image: string | File;
    hero_title: string;
    hero_subtitle: string;
    programs_section_title: string;
    programs_data: ProgramItem[];
    mula_sayo_title: string;
    mula_sayo_image: string | File;
}

interface Props {
    programsContent: ProgramsContent;
}

export default function Programs({ programsContent }: Props) {
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now());

    // Hero Section State
    const [heroTitle, setHeroTitle] = useState(programsContent.hero_title || 'Programs Under Survey');
    const [heroSubtitle, setHeroSubtitle] = useState(programsContent.hero_subtitle || 'Comprehensive programs designed to meet industry standards and educational excellence.');
    const [heroImage, setHeroImage] = useState<string | File>(programsContent.hero_image || '');

    // Programs Section State
    const [programsSectionTitle, setProgramsSectionTitle] = useState(programsContent.programs_section_title || 'Our Programs');
    const [programs, setPrograms] = useState<ProgramItem[]>(
        programsContent.programs_data && programsContent.programs_data.length > 0 
            ? programsContent.programs_data 
            : [{ image: '', title: '', short: '', description: '', href: '' }]
    );

    // Mula Sayo Section State
    const [mulaSayoTitle, setMulaSayoTitle] = useState(programsContent.mula_sayo_title || 'Mula Sayo, Para Sa Bayan');
    const [mulaSayoImage, setMulaSayoImage] = useState<string | File>(programsContent.mula_sayo_image || '');

    // Programs handlers
    const handleProgramChange = (idx: number, field: keyof ProgramItem, value: string | File | null) => {
        const updated = [...programs];
        if (field === 'image') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setPrograms(updated);
    };

    const addProgram = () => {
        setPrograms([...programs, { image: '', title: '', short: '', description: '', href: '' }]);
    };

    const removeProgram = (idx: number) => {
        if (programs.length > 1) {
            setPrograms(programs.filter((_, i) => i !== idx));
        }
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();
        
        // Add basic fields
        formData.append('hero_title', heroTitle);
        formData.append('hero_subtitle', heroSubtitle);
        formData.append('programs_section_title', programsSectionTitle);
        formData.append('mula_sayo_title', mulaSayoTitle);

        // Add hero image
        if (heroImage instanceof File) {
            formData.append('hero_image', heroImage);
        }

        // Add mula sayo image
        if (mulaSayoImage instanceof File) {
            formData.append('mula_sayo_image', mulaSayoImage);
        }

        // Add programs data
        const programsData = programs.map(item => ({
            title: item.title,
            short: item.short,
            description: item.description,
            href: item.href,
            image: typeof item.image === 'string' ? item.image : ''
        }));
        formData.append('programs_data', JSON.stringify(programsData));

        // Add program images
        programs.forEach((item, index) => {
            if (item.image instanceof File) {
                formData.append(`program_image_${index}`, item.image);
            }
        });

        router.post('/admin/layout/programs', formData, {
            forceFormData: true,
            onFinish: () => setSaving(false),
            onSuccess: () => {
                // Refresh the preview by updating the key
                setPreviewKey(Date.now());
                // Show success indicator
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            },
        });
    };

    const sections = [
        { id: 'hero', name: 'Hero Section' },
        { id: 'programs', name: 'Programs' },
        { id: 'mulasayo', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: Programs Under Survey" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Programs Page Editor</h2>
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

                                {/* Programs Section */}
                                {activeSection === 'programs' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Programs</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={programsSectionTitle}
                                                    onChange={(e) => setProgramsSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {programs.map((program, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Program {index + 1}</span>
                                                        {programs.length > 1 && (
                                                            <button
                                                                onClick={() => removeProgram(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <FileUpload
                                                        label="Program Image"
                                                        value={program.image}
                                                        onChange={(file) => handleProgramChange(index, 'image', file)}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={2}
                                                    />
                                                    
                                                    <div className="mt-3 space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Title</label>
                                                            <input
                                                                type="text"
                                                                value={program.title}
                                                                onChange={(e) => handleProgramChange(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter program title"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Short Name</label>
                                                            <input
                                                                type="text"
                                                                value={program.short}
                                                                onChange={(e) => handleProgramChange(index, 'short', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter short name (e.g., BTLED)"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Description</label>
                                                            <textarea
                                                                value={program.description}
                                                                onChange={(e) => handleProgramChange(index, 'description', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter program description"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addProgram}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Program
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Mula Sayo Section */}
                                {activeSection === 'mulasayo' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Mula Sayo Para sa Bayan</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={mulaSayoTitle}
                                                    onChange={(e) => setMulaSayoTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            <FileUpload
                                                label="Background Image"
                                                value={mulaSayoImage}
                                                onChange={(file) => setMulaSayoImage(file || '')}
                                                accept="image/*"
                                                allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                maxSize={5}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-[#7F0404] hover:bg-[#a00a0a] disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded shadow transition-all duration-200 hover:shadow-lg disabled:hover:shadow-sm"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content - Preview */}
                    <section className="flex-1 w-full px-8 py-4 pb-2 text-left flex flex-col h-full">
                        {/* Preview Header */}
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Programs Page Preview</h1>
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
                                    pageUrl="/programs" 
                                    title="Programs Page Preview"
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
