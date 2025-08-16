import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import FileUpload from '@/components/FileUpload';

interface GraduateItem {
    name: string;
    video: string | File;
    video_type: 'youtube' | 'upload';
}

interface AccreditationArea {
    title: string;
    image: string | File;
}

interface BsentContent {
    hero_image: string | File;
    hero_title: string;
    hero_subtitle: string;
    overview_section_title: string;
    program_description: string;
    program_image: string | File;
    objectives_section_title: string;
    objectives_data: string[];
    avp_section_title: string;
    program_video: string;
    program_video_type: 'youtube' | 'upload';
    action_section_title: string;
    action_images: string[];
    graduates_section_title: string;
    graduates_data: GraduateItem[];
    accreditation_section_title: string;
    accreditation_areas: AccreditationArea[];
    mula_sayo_title: string;
    mula_sayo_image: string | File;
}

interface Props {
    bsentContent: BsentContent;
}

export default function ProgramsBSENT({ bsentContent }: Props) {
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now());

    // Hero Section State
    const [heroTitle, setHeroTitle] = useState(bsentContent.hero_title || 'Bachelor of Science in Entrepreneurship (BSENT)');
    const [heroSubtitle, setHeroSubtitle] = useState(bsentContent.hero_subtitle || 'Nurturing innovative and entrepreneurial mindsets, preparing students to launch and manage successful business ventures.');
    const [heroImage, setHeroImage] = useState<string | File>(bsentContent.hero_image || '');

    // Overview Section State
    const [overviewSectionTitle, setOverviewSectionTitle] = useState(bsentContent.overview_section_title || 'Program Overview');
    const [programDescription, setProgramDescription] = useState(bsentContent.program_description || '');
    const [programImage, setProgramImage] = useState<string | File>(bsentContent.program_image || '');

    // Objectives Section State
    const [objectivesSectionTitle, setObjectivesSectionTitle] = useState(bsentContent.objectives_section_title || 'Program Objectives');
    const [objectives, setObjectives] = useState<string[]>(
        bsentContent.objectives_data && bsentContent.objectives_data.length > 0 
            ? bsentContent.objectives_data 
            : ['']
    );

    // AVP Section State
    const [avpSectionTitle, setAvpSectionTitle] = useState(bsentContent.avp_section_title || 'Program AVP');
    const [programVideo, setProgramVideo] = useState(bsentContent.program_video || '');
    const [programVideoType, setProgramVideoType] = useState<'youtube' | 'upload'>(bsentContent.program_video_type || 'youtube');
    const [programVideoFile, setProgramVideoFile] = useState<File | null>(null);

    // Action Section State
    const [actionSectionTitle, setActionSectionTitle] = useState(bsentContent.action_section_title || 'Program in Action');
    const [actionImages, setActionImages] = useState<(string | File)[]>(
        bsentContent.action_images && bsentContent.action_images.length > 0 
            ? bsentContent.action_images 
            : ['', '', '', '']
    );

    // Graduates Section State
    const [graduatesSectionTitle, setGraduatesSectionTitle] = useState(bsentContent.graduates_section_title || 'Notable Graduates');
    const [graduates, setGraduates] = useState<GraduateItem[]>(
        bsentContent.graduates_data && bsentContent.graduates_data.length > 0 
            ? bsentContent.graduates_data 
            : [{ name: '', video: '', video_type: 'youtube' }]
    );

    // Accreditation Section State
    const [accreditationSectionTitle, setAccreditationSectionTitle] = useState(bsentContent.accreditation_section_title || 'Accreditation Areas');
    const [accreditationAreas, setAccreditationAreas] = useState<AccreditationArea[]>(
        bsentContent.accreditation_areas && bsentContent.accreditation_areas.length > 0 
            ? bsentContent.accreditation_areas 
            : [{ title: '', image: '' }]
    );

    // Mula Sayo Section State
    const [mulaSayoTitle, setMulaSayoTitle] = useState(bsentContent.mula_sayo_title || 'Mula Sayo, Para Sa Bayan');
    const [mulaSayoImage, setMulaSayoImage] = useState<string | File>(bsentContent.mula_sayo_image || '');

    // Objectives handlers
    const handleObjectiveChange = (idx: number, value: string) => {
        const updated = [...objectives];
        updated[idx] = value;
        setObjectives(updated);
    };

    const addObjective = () => {
        setObjectives([...objectives, '']);
    };

    const removeObjective = (idx: number) => {
        if (objectives.length > 1) {
            setObjectives(objectives.filter((_, i) => i !== idx));
        }
    };

    // Action Images handlers
    const handleActionImageChange = (idx: number, value: string | File | null) => {
        const updated = [...actionImages];
        updated[idx] = value || '';
        setActionImages(updated);
    };

    const addActionImage = () => {
        setActionImages([...actionImages, '']);
    };

    const removeActionImage = (idx: number) => {
        if (actionImages.length > 1) {
            setActionImages(actionImages.filter((_, i) => i !== idx));
        }
    };

    // Graduates handlers
    const handleGraduateChange = (idx: number, field: keyof GraduateItem, value: string | File | null) => {
        const updated = [...graduates];
        if (field === 'video') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setGraduates(updated);
    };

    const addGraduate = () => {
        setGraduates([...graduates, { name: '', video: '', video_type: 'youtube' }]);
    };

    const removeGraduate = (idx: number) => {
        if (graduates.length > 1) {
            setGraduates(graduates.filter((_, i) => i !== idx));
        }
    };

    // Accreditation Areas handlers
    const handleAreaChange = (idx: number, field: keyof AccreditationArea, value: string | File | null) => {
        const updated = [...accreditationAreas];
        if (field === 'image') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setAccreditationAreas(updated);
    };

    const addArea = () => {
        setAccreditationAreas([...accreditationAreas, { title: '', image: '' }]);
    };

    const removeArea = (idx: number) => {
        if (accreditationAreas.length > 1) {
            setAccreditationAreas(accreditationAreas.filter((_, i) => i !== idx));
        }
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();
        
        // Add basic fields
        formData.append('hero_title', heroTitle);
        formData.append('hero_subtitle', heroSubtitle);
        formData.append('overview_section_title', overviewSectionTitle);
        formData.append('program_description', programDescription);
        formData.append('objectives_section_title', objectivesSectionTitle);
        formData.append('avp_section_title', avpSectionTitle);
        formData.append('program_video_type', programVideoType);
        formData.append('action_section_title', actionSectionTitle);
        formData.append('graduates_section_title', graduatesSectionTitle);
        formData.append('accreditation_section_title', accreditationSectionTitle);
        formData.append('mula_sayo_title', mulaSayoTitle);

        // Add hero image
        if (heroImage instanceof File) {
            formData.append('hero_image', heroImage);
        }

        // Add program image
        if (programImage instanceof File) {
            formData.append('program_image', programImage);
        }

        // Add program video
        if (programVideoType === 'youtube') {
            formData.append('program_video', programVideo);
        } else if (programVideoFile) {
            formData.append('program_video_file', programVideoFile);
        }

        // Add objectives data
        formData.append('objectives_data', JSON.stringify(objectives.filter(obj => obj.trim())));

        // Add action images data
        const actionImagesData = actionImages.map(img => typeof img === 'string' ? img : '');
        formData.append('action_images_data', JSON.stringify(actionImagesData));
        actionImages.forEach((image, index) => {
            if (image instanceof File) {
                formData.append(`action_image_${index}`, image);
            }
        });

        // Add graduates data
        const graduatesData = graduates.map(grad => ({
            name: grad.name,
            video: typeof grad.video === 'string' ? grad.video : '',
            video_type: grad.video_type
        }));
        formData.append('graduates_data', JSON.stringify(graduatesData));
        graduates.forEach((graduate, index) => {
            if (graduate.video instanceof File) {
                formData.append(`graduate_video_${index}`, graduate.video);
            }
        });

        // Add accreditation areas data
        const areasData = accreditationAreas.map(area => ({
            title: area.title,
            image: typeof area.image === 'string' ? area.image : ''
        }));
        formData.append('accreditation_areas', JSON.stringify(areasData));
        accreditationAreas.forEach((area, index) => {
            if (area.image instanceof File) {
                formData.append(`area_image_${index}`, area.image);
            }
        });

        // Add mula sayo image
        if (mulaSayoImage instanceof File) {
            formData.append('mula_sayo_image', mulaSayoImage);
        }

        router.post('/admin/layout/programs/bsent', formData, {
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
        { id: 'overview', name: 'Program Overview' },
        { id: 'objectives', name: 'Program Objectives' },
        { id: 'avp', name: 'Program AVP' },
        { id: 'action', name: 'Program in Action' },
        { id: 'graduates', name: 'Notable Graduates' },
        { id: 'accreditation', name: 'Accreditation Areas' },
        { id: 'mulasayo', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: BSENT Program" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">BSENT Program Editor</h2>
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

                                {/* Program Overview Section */}
                                {activeSection === 'overview' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Program Overview</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={overviewSectionTitle}
                                                    onChange={(e) => setOverviewSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Program Description</label>
                                                <textarea
                                                    value={programDescription}
                                                    onChange={(e) => setProgramDescription(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter program description"
                                                    rows={4}
                                                />
                                            </div>

                                            <FileUpload
                                                label="Program Image"
                                                value={programImage}
                                                onChange={(file) => setProgramImage(file || '')}
                                                accept="image/*"
                                                allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                maxSize={5}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Program Objectives Section */}
                                {activeSection === 'objectives' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Program Objectives</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={objectivesSectionTitle}
                                                    onChange={(e) => setObjectivesSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {objectives.map((objective, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Objective {index + 1}</span>
                                                        {objectives.length > 1 && (
                                                            <button
                                                                onClick={() => removeObjective(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <textarea
                                                        value={objective}
                                                        onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                        placeholder="Enter objective"
                                                        rows={2}
                                                    />
                                                </div>
                                            ))}

                                            <button
                                                onClick={addObjective}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Objective
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Program AVP Section */}
                                {activeSection === 'avp' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Program AVP</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={avpSectionTitle}
                                                    onChange={(e) => setAvpSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Video Type</label>
                                                <div className="flex space-x-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value="youtube"
                                                            checked={programVideoType === 'youtube'}
                                                            onChange={(e) => setProgramVideoType(e.target.value as 'youtube' | 'upload')}
                                                            className="mr-2"
                                                        />
                                                        YouTube Link
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value="upload"
                                                            checked={programVideoType === 'upload'}
                                                            onChange={(e) => setProgramVideoType(e.target.value as 'youtube' | 'upload')}
                                                            className="mr-2"
                                                        />
                                                        Upload Video
                                                    </label>
                                                </div>
                                            </div>

                                            {programVideoType === 'youtube' ? (
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#7F0404]">YouTube Video ID</label>
                                                    <input
                                                        type="text"
                                                        value={programVideo}
                                                        onChange={(e) => setProgramVideo(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                        placeholder="Enter YouTube video ID (e.g., dQw4w9WgXcQ)"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Upload Video File</label>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setProgramVideoFile(e.target.files?.[0] || null)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Program in Action Section */}
                                {activeSection === 'action' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Program in Action</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={actionSectionTitle}
                                                    onChange={(e) => setActionSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {actionImages.map((image, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Action Image {index + 1}</span>
                                                        {actionImages.length > 1 && (
                                                            <button
                                                                onClick={() => removeActionImage(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <FileUpload
                                                        label={`Action Image ${index + 1}`}
                                                        value={image}
                                                        onChange={(file) => handleActionImageChange(index, file)}
                                                        accept="image/*"
                                                        allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                        maxSize={2}
                                                    />
                                                </div>
                                            ))}

                                            <button
                                                onClick={addActionImage}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Action Image
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Notable Graduates Section */}
                                {activeSection === 'graduates' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Notable Graduates</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={graduatesSectionTitle}
                                                    onChange={(e) => setGraduatesSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {graduates.map((graduate, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Graduate {index + 1}</span>
                                                        {graduates.length > 1 && (
                                                            <button
                                                                onClick={() => removeGraduate(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Graduate Name</label>
                                                            <input
                                                                type="text"
                                                                value={graduate.name}
                                                                onChange={(e) => handleGraduateChange(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter graduate name"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Video Type</label>
                                                            <div className="flex space-x-4">
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        value="youtube"
                                                                        checked={graduate.video_type === 'youtube'}
                                                                        onChange={(e) => handleGraduateChange(index, 'video_type', e.target.value)}
                                                                        className="mr-2"
                                                                    />
                                                                    YouTube
                                                                </label>
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        value="upload"
                                                                        checked={graduate.video_type === 'upload'}
                                                                        onChange={(e) => handleGraduateChange(index, 'video_type', e.target.value)}
                                                                        className="mr-2"
                                                                    />
                                                                    Upload
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {graduate.video_type === 'youtube' ? (
                                                            <div>
                                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">YouTube Video ID</label>
                                                                <input
                                                                    type="text"
                                                                    value={typeof graduate.video === 'string' ? graduate.video : ''}
                                                                    onChange={(e) => handleGraduateChange(index, 'video', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                    placeholder="Enter YouTube video ID"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Upload Video</label>
                                                                <input
                                                                    type="file"
                                                                    accept="video/*"
                                                                    onChange={(e) => handleGraduateChange(index, 'video', e.target.files?.[0] || null)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addGraduate}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Graduate
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Accreditation Areas Section */}
                                {activeSection === 'accreditation' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Accreditation Areas</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Section Title</label>
                                                <input
                                                    type="text"
                                                    value={accreditationSectionTitle}
                                                    onChange={(e) => setAccreditationSectionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter section title"
                                                />
                                            </div>

                                            {accreditationAreas.map((area, index) => (
                                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Area {index + 1}</span>
                                                        {accreditationAreas.length > 1 && (
                                                            <button
                                                                onClick={() => removeArea(index)}
                                                                className="text-red-600 hover:text-red-800 text-xs"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold mb-1 text-[#7F0404]">Area Title</label>
                                                            <input
                                                                type="text"
                                                                value={area.title}
                                                                onChange={(e) => handleAreaChange(index, 'title', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent text-sm"
                                                                placeholder="Enter area title (e.g., Area I: Vision, Mission, Goals and Objectives)"
                                                            />
                                                        </div>

                                                        <FileUpload
                                                            label="Area Image"
                                                            value={area.image}
                                                            onChange={(file) => handleAreaChange(index, 'image', file)}
                                                            accept="image/*"
                                                            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                            maxSize={2}
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addArea}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Accreditation Area
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
                                <h1 className="text-2xl font-bold text-gray-800">BSENT Program Preview</h1>
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
                                    pageUrl="/programs/bsent" 
                                    title="BSENT Program Preview"
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
