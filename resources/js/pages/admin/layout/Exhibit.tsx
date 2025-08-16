import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import FileUpload from '@/components/FileUpload';

interface ExhibitItem {
    image: string | File;
    title: string;
    subtitle: string;
}

interface ExhibitContent {
    hero_image: string | File;
    hero_title: string;
    hero_subtitle: string;
    exhibit_section_title: string;
    exhibit_data: ExhibitItem[];
    mula_sayo_title: string;
    mula_sayo_image: string | File;
}

interface Props {
    exhibitContent: ExhibitContent;
}

export default function Exhibit({ exhibitContent }: Props) {
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now());

    // Hero Section State
    const [heroTitle, setHeroTitle] = useState(exhibitContent.hero_title || 'Exhibit');
    const [heroSubtitle, setHeroSubtitle] = useState(exhibitContent.hero_subtitle || 'Comprehensive exhibit of university resources and documentation for academic excellence.');
    const [heroImage, setHeroImage] = useState<string | File>(exhibitContent.hero_image || '');

    // Exhibits Section State
    const [exhibitSectionTitle, setExhibitSectionTitle] = useState(exhibitContent.exhibit_section_title || 'University Exhibit Resources');
    const [exhibits, setExhibits] = useState<ExhibitItem[]>(
        exhibitContent.exhibit_data && exhibitContent.exhibit_data.length > 0 
            ? exhibitContent.exhibit_data 
            : [{ image: '', title: '', subtitle: '' }]
    );

    // Mula Sayo Section State
    const [mulaSayoTitle, setMulaSayoTitle] = useState(exhibitContent.mula_sayo_title || 'Mula Sayo, Para Sa Bayan');
    const [mulaSayoImage, setMulaSayoImage] = useState<string | File>(exhibitContent.mula_sayo_image || '');

    // Exhibits handlers
    const handleExhibitChange = (idx: number, field: keyof ExhibitItem, value: string | File | null) => {
        const updated = [...exhibits];
        if (field === 'image') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setExhibits(updated);
    };

    const addExhibit = () => {
        setExhibits([...exhibits, { image: '', title: '', subtitle: '' }]);
    };

    const removeExhibit = (idx: number) => {
        if (exhibits.length > 1) {
            setExhibits(exhibits.filter((_, i) => i !== idx));
        }
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();
        
        // Add basic fields
        formData.append('hero_title', heroTitle);
        formData.append('hero_subtitle', heroSubtitle);
        formData.append('exhibit_section_title', exhibitSectionTitle);
        formData.append('mula_sayo_title', mulaSayoTitle);

        // Add hero image
        if (heroImage instanceof File) {
            formData.append('hero_image', heroImage);
        }

        // Add mula sayo image
        if (mulaSayoImage instanceof File) {
            formData.append('mula_sayo_image', mulaSayoImage);
        }

        // Add exhibit data
        const exhibitData = exhibits.map(item => ({
            title: item.title,
            subtitle: item.subtitle,
            image: typeof item.image === 'string' ? item.image : ''
        }));
        formData.append('exhibit_data', JSON.stringify(exhibitData));

        // Add exhibit images
        exhibits.forEach((item, index) => {
            if (item.image instanceof File) {
                formData.append(`exhibit_image_${index}`, item.image);
            }
        });

        router.post('/admin/layout/exhibit', formData, {
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
        { id: 'exhibits', name: 'Exhibits' },
        { id: 'mulasayo', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: Exhibit" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Exhibit Page Editor</h2>
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

                                {/* Exhibits Section */}
                                {activeSection === 'exhibits' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Exhibits</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={exhibitSectionTitle}
                                                    onChange={(e) => setExhibitSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {exhibits.map((exhibit, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Exhibit {index + 1}</span>
                                                        {exhibits.length > 1 && (
                                                            <button
                                                                onClick={() => removeExhibit(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <FileUpload
                                                        label="Exhibit Image"
                                                        value={exhibit.image}
                                                        onChange={(file) => handleExhibitChange(index, 'image', file)}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={2}
                                                    />
                                                    
                                                    <div className="mt-3 space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Title</label>
                                                            <input
                                                                type="text"
                                                                value={exhibit.title}
                                                                onChange={(e) => handleExhibitChange(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter exhibit title"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Subtitle</label>
                                                            <textarea
                                                                value={exhibit.subtitle}
                                                                onChange={(e) => handleExhibitChange(index, 'subtitle', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter exhibit subtitle"
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addExhibit}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Exhibit
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
                                <h1 className="text-2xl font-bold text-gray-800">Exhibit Page Preview</h1>
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
                                    pageUrl="/exhibit" 
                                    title="Exhibit Page Preview"
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
