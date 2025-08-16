import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import FileUpload from '@/components/FileUpload';

interface CarouselItem {
    image: string | File;
    title: string;
    subtitle: string;
}

interface AccreditorItem {
    image: string | File;
    name: string;
    position: string;
}

interface VideoItem {
    youtube_id: string;
    title: string;
    thumbnail?: string;
}

interface ProgramItem {
    image: string | File;
    name: string;
    description: string;
}

interface QuickLinkItem {
    url: string;
    title: string;
}

interface DirectorData {
    image: string | File;
    name: string;
    position: string;
    message: string;
}

interface LandingContent {
    carousel_data: CarouselItem[];
    accreditors_title: string;
    accreditors_data: AccreditorItem[];
    director_section_title: string;
    director_image: string;
    director_name: string;
    director_position: string;
    director_message: string;
    videos_section_title: string;
    videos_data: VideoItem[];
    programs_section_title: string;
    programs_data: ProgramItem[];
    quick_links_title: string;
    quick_links_data: QuickLinkItem[];
    mula_sayo_title: string;
    mula_sayo_image: string | File;
}

interface Props {
    landingContent: LandingContent;
}

export default function LayoutHome({ landingContent }: Props) {
    const [activeSection, setActiveSection] = useState('carousel');
    const [saving, setSaving] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now()); // Used to force refresh preview
    const [saveSuccess, setSaveSuccess] = useState(false); // Show success indicator

    // State for all sections
    const [carousel, setCarousel] = useState<CarouselItem[]>(landingContent.carousel_data || []);
    const [accreditorsTitle, setAccreditorsTitle] = useState(landingContent.accreditors_title || '');
    const [accreditors, setAccreditors] = useState<AccreditorItem[]>(landingContent.accreditors_data || []);
    const [directorSectionTitle, setDirectorSectionTitle] = useState(landingContent.director_section_title || '');
    const [director, setDirector] = useState<DirectorData>({
        image: landingContent.director_image || '',
        name: landingContent.director_name || '',
        position: landingContent.director_position || '',
        message: landingContent.director_message || ''
    });
    const [videosSectionTitle, setVideosSectionTitle] = useState(landingContent.videos_section_title || '');
    const [videos, setVideos] = useState<VideoItem[]>(landingContent.videos_data || []);
    const [programsSectionTitle, setProgramsSectionTitle] = useState(landingContent.programs_section_title || '');
    const [programs, setPrograms] = useState<ProgramItem[]>(landingContent.programs_data || []);
    const [quickLinksTitle, setQuickLinksTitle] = useState(landingContent.quick_links_title || '');
    const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>(landingContent.quick_links_data || []);
    const [mulaSayoTitle, setMulaSayoTitle] = useState(landingContent.mula_sayo_title || '');
    const [mulaSayoImage, setMulaSayoImage] = useState<string | File>(landingContent.mula_sayo_image || '');

    // Carousel handlers
    const handleCarouselChange = (idx: number, field: keyof CarouselItem, value: string | File | null) => {
        const updated = [...carousel];
        if (field === 'image') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setCarousel(updated);
    };

    const addCarouselSlide = () => {
        setCarousel([...carousel, { image: '', title: '', subtitle: '' }]);
    };

    const removeCarouselSlide = (idx: number) => {
        if (carousel.length > 1) {
            setCarousel(carousel.filter((_, i) => i !== idx));
        }
    };

    // Accreditor handlers
    const handleAccreditorChange = (idx: number, field: keyof AccreditorItem, value: string | File | null) => {
        const updated = [...accreditors];
        if (field === 'image') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setAccreditors(updated);
    };

    const addAccreditor = () => {
        setAccreditors([...accreditors, { image: '', name: '', position: '' }]);
    };

    const removeAccreditor = (idx: number) => {
        if (accreditors.length > 1) {
            setAccreditors(accreditors.filter((_, i) => i !== idx));
        }
    };

    // Director handlers
    const handleDirectorChange = (field: keyof DirectorData, value: string | File | null) => {
        if (field === 'image') {
            setDirector({ ...director, [field]: value || '' });
        } else {
            setDirector({ ...director, [field]: value as string });
        }
    };

    // Video handlers
    const handleVideoChange = (idx: number, field: keyof VideoItem, value: string) => {
        const updated = [...videos];
        updated[idx] = { ...updated[idx], [field]: value };
        setVideos(updated);
    };

    const addVideo = () => {
        setVideos([...videos, { youtube_id: '', title: '', thumbnail: '' }]);
    };

    const removeVideo = (idx: number) => {
        if (videos.length > 1) {
            setVideos(videos.filter((_, i) => i !== idx));
        }
    };

    // Program handlers
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
        setPrograms([...programs, { image: '', name: '', description: '' }]);
    };

    const removeProgram = (idx: number) => {
        if (programs.length > 1) {
            setPrograms(programs.filter((_, i) => i !== idx));
        }
    };

    // Quick Links handlers
    const handleQuickLinkChange = (idx: number, field: keyof QuickLinkItem, value: string) => {
        const updated = [...quickLinks];
        updated[idx] = { ...updated[idx], [field]: value };
        setQuickLinks(updated);
    };

    const addQuickLink = () => {
        setQuickLinks([...quickLinks, { url: '', title: '' }]);
    };

    const removeQuickLink = (idx: number) => {
        if (quickLinks.length > 1) {
            setQuickLinks(quickLinks.filter((_, i) => i !== idx));
        }
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();

        // Carousel data
        formData.append('carousel_data', JSON.stringify(carousel.map(item => ({
            title: item.title,
            subtitle: item.subtitle,
            image: typeof item.image === 'string' ? item.image : ''
        }))));

        carousel.forEach((item, idx) => {
            if (item.image instanceof File) {
                formData.append(`carousel_image_${idx}`, item.image);
            }
        });

        // Accreditors data
        formData.append('accreditors_title', accreditorsTitle);
        formData.append('accreditors_data', JSON.stringify(accreditors.map(item => ({
            name: item.name,
            position: item.position,
            image: typeof item.image === 'string' ? item.image : ''
        }))));

        accreditors.forEach((item, idx) => {
            if (item.image instanceof File) {
                formData.append(`accreditor_image_${idx}`, item.image);
            }
        });

        // Director data
        formData.append('director_section_title', directorSectionTitle);
        formData.append('director_name', director.name);
        formData.append('director_position', director.position);
        formData.append('director_message', director.message);
        if (director.image instanceof File) {
            formData.append('director_image', director.image);
        }

        // Videos data
        formData.append('videos_section_title', videosSectionTitle);
        formData.append('videos_data', JSON.stringify(videos));

        // Programs data
        formData.append('programs_section_title', programsSectionTitle);
        formData.append('programs_data', JSON.stringify(programs.map(item => ({
            name: item.name,
            description: item.description,
            image: typeof item.image === 'string' ? item.image : ''
        }))));

        programs.forEach((item, idx) => {
            if (item.image instanceof File) {
                formData.append(`program_image_${idx}`, item.image);
            }
        });

        // Quick Links data
        formData.append('quick_links_title', quickLinksTitle);
        formData.append('quick_links_data', JSON.stringify(quickLinks));

        // Mula Sayo data
        formData.append('mula_sayo_title', mulaSayoTitle);
        if (mulaSayoImage instanceof File) {
            formData.append('mula_sayo_image', mulaSayoImage);
        }

        router.post('/admin/layout/home', formData, {
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
        { id: 'carousel', name: 'Hero Carousel' },
        { id: 'accreditors', name: 'Accreditors' },
        { id: 'director', name: 'Director Message' },
        { id: 'videos', name: 'Campus Videos' },
        { id: 'programs', name: 'Programs' },
        { id: 'quicklinks', name: 'Quick Links' },
        { id: 'mulasayo', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: Home" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Home Page Editor</h2>
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
                                {/* Hero Carousel Section */}
                                {activeSection === 'carousel' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Hero Carousel</h3>
                                        <div className="space-y-4">
                                            {carousel.map((item, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Slide {index + 1}</span>
                                                        {carousel.length > 1 && (
                                                            <button
                                                                onClick={() => removeCarouselSlide(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <FileUpload
                                                        label="Slide Image"
                                                        value={item.image}
                                                        onChange={(file) => handleCarouselChange(index, 'image', file)}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={5}
                                                    />
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Title</label>
                                                            <input
                                                                type="text"
                                                                value={item.title}
                                                                onChange={(e) => handleCarouselChange(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter slide title"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Subtitle</label>
                                                            <input
                                                                type="text"
                                                                value={item.subtitle}
                                                                onChange={(e) => handleCarouselChange(index, 'subtitle', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter slide subtitle"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addCarouselSlide}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Slide
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Accreditors Section */}
                                {activeSection === 'accreditors' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Accreditors</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={accreditorsTitle}
                                                    onChange={(e) => setAccreditorsTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {accreditors.map((accreditor, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Accreditor {index + 1}</span>
                                                        {accreditors.length > 1 && (
                                                            <button
                                                                onClick={() => removeAccreditor(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <FileUpload
                                                        label="Photo"
                                                        value={accreditor.image}
                                                        onChange={(file) => handleAccreditorChange(index, 'image', file)}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={2}
                                                    />
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Name</label>
                                                            <input
                                                                type="text"
                                                                value={accreditor.name}
                                                                onChange={(e) => handleAccreditorChange(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter accreditor name"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Position</label>
                                                            <input
                                                                type="text"
                                                                value={accreditor.position}
                                                                onChange={(e) => handleAccreditorChange(index, 'position', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter accreditor position"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addAccreditor}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Accreditor
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Director Message Section */}
                                {activeSection === 'director' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Director Message</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={directorSectionTitle}
                                                    onChange={(e) => setDirectorSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            <FileUpload
                                                label="Director Photo"
                                                value={director.image}
                                                onChange={(file) => handleDirectorChange('image', file)}
                                                accept="image/*"
                                                allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                maxSize={2}
                                            />

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Director Name</label>
                                                <input
                                                    type="text"
                                                    value={director.name}
                                                    onChange={(e) => handleDirectorChange('name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter director name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Position</label>
                                                <input
                                                    type="text"
                                                    value={director.position}
                                                    onChange={(e) => handleDirectorChange('position', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter director position"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Message</label>
                                                <textarea
                                                    value={director.message}
                                                    onChange={(e) => handleDirectorChange('message', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter director message"
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Videos Section */}
                                {activeSection === 'videos' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Campus Videos</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={videosSectionTitle}
                                                    onChange={(e) => setVideosSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {videos.map((video, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Video {index + 1}</span>
                                                        {videos.length > 1 && (
                                                            <button
                                                                onClick={() => removeVideo(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">YouTube ID</label>
                                                            <input
                                                                type="text"
                                                                value={video.youtube_id}
                                                                onChange={(e) => handleVideoChange(index, 'youtube_id', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter YouTube video ID"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Title</label>
                                                            <input
                                                                type="text"
                                                                value={video.title}
                                                                onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter video title"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addVideo}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Video
                                            </button>
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
                                                        maxSize={3}
                                                    />
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Program Name</label>
                                                            <input
                                                                type="text"
                                                                value={program.name}
                                                                onChange={(e) => handleProgramChange(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter program name"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Description</label>
                                                            <textarea
                                                                value={program.description}
                                                                onChange={(e) => handleProgramChange(index, 'description', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
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

                                {/* Quick Links Section */}
                                {activeSection === 'quicklinks' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Quick Links</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={quickLinksTitle}
                                                    onChange={(e) => setQuickLinksTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {quickLinks.map((link, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Link {index + 1}</span>
                                                        {quickLinks.length > 1 && (
                                                            <button
                                                                onClick={() => removeQuickLink(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Title</label>
                                                            <input
                                                                type="text"
                                                                value={link.title}
                                                                onChange={(e) => handleQuickLinkChange(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter link title"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">URL</label>
                                                            <input
                                                                type="url"
                                                                value={link.url}
                                                                onChange={(e) => handleQuickLinkChange(index, 'url', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                                placeholder="Enter link URL"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addQuickLink}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Link
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
                                                label="Footer Image"
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
                                <h1 className="text-2xl font-bold text-gray-800">Home Page Preview</h1>
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
                                    pageUrl="/" 
                                    title="Home Page Preview"
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
