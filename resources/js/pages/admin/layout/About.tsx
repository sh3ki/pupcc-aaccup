import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import FileUpload from '@/components/FileUpload';

interface FacultyItem {
    image: string | File;
    name: string;
    description: string;
}

interface AboutContent {
    hero_image: string | File;
    hero_title: string;
    hero_subtitle: string;
    story_title: string;
    story_content: string;
    mission_title: string;
    mission_content: string;
    vision_title: string;
    vision_content: string;
    faculty_title: string;
    faculty_data: FacultyItem[];
    mula_sayo_title: string;
    mula_sayo_image: string | File;
}

interface Props {
    aboutContent: AboutContent;
}

export default function LayoutAbout({ aboutContent }: Props) {
    const [activeSection, setActiveSection] = useState('hero');
    const [saving, setSaving] = useState(false);
    const [previewKey, setPreviewKey] = useState(Date.now()); // Used to force refresh preview
    const [saveSuccess, setSaveSuccess] = useState(false); // Show success indicator

    // State for all sections
    const [heroImage, setHeroImage] = useState<string | File>(aboutContent.hero_image || '');
    const [heroTitle, setHeroTitle] = useState(aboutContent.hero_title || '');
    const [heroSubtitle, setHeroSubtitle] = useState(aboutContent.hero_subtitle || '');
    const [storyTitle, setStoryTitle] = useState(aboutContent.story_title || '');
    const [storyContent, setStoryContent] = useState(aboutContent.story_content || '');
    const [missionTitle, setMissionTitle] = useState(aboutContent.mission_title || '');
    const [missionContent, setMissionContent] = useState(aboutContent.mission_content || '');
    const [visionTitle, setVisionTitle] = useState(aboutContent.vision_title || '');
    const [visionContent, setVisionContent] = useState(aboutContent.vision_content || '');
    const [facultyTitle, setFacultyTitle] = useState(aboutContent.faculty_title || '');
    const [faculty, setFaculty] = useState<FacultyItem[]>(aboutContent.faculty_data || []);
    const [mulaSayoTitle, setMulaSayoTitle] = useState(aboutContent.mula_sayo_title || '');
    const [mulaSayoImage, setMulaSayoImage] = useState<string | File>(aboutContent.mula_sayo_image || '');

    // Faculty handlers
    const handleFacultyChange = (idx: number, field: keyof FacultyItem, value: string | File | null) => {
        const updated = [...faculty];
        if (field === 'image') {
            updated[idx] = { ...updated[idx], [field]: value || '' };
        } else {
            updated[idx] = { ...updated[idx], [field]: value as string };
        }
        setFaculty(updated);
    };

    const addFaculty = () => {
        setFaculty([...faculty, { image: '', name: '', description: '' }]);
    };

    const removeFaculty = (idx: number) => {
        if (faculty.length > 1) {
            setFaculty(faculty.filter((_, i) => i !== idx));
        }
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();
        
        // Hero data
        formData.append('hero_title', heroTitle);
        formData.append('hero_subtitle', heroSubtitle);
        if (heroImage instanceof File) {
            formData.append('hero_image', heroImage);
        }
        
        // Story data
        formData.append('story_title', storyTitle);
        formData.append('story_content', storyContent);
        
        // Mission data
        formData.append('mission_title', missionTitle);
        formData.append('mission_content', missionContent);
        
        // Vision data
        formData.append('vision_title', visionTitle);
        formData.append('vision_content', visionContent);
        
        // Faculty data
        formData.append('faculty_title', facultyTitle);
        const facultyForSubmit = faculty.map(item => ({
            name: item.name,
            description: item.description,
            image: typeof item.image === 'string' ? item.image : ''
        }));
        formData.append('faculty_data', JSON.stringify(facultyForSubmit));
        
        // Handle faculty images
        faculty.forEach((item, index) => {
            if (item.image instanceof File) {
                formData.append(`faculty_image_${index}`, item.image);
            }
        });
        
        // Mula Sayo data
        formData.append('mula_sayo_title', mulaSayoTitle);
        if (mulaSayoImage instanceof File) {
            formData.append('mula_sayo_image', mulaSayoImage);
        }

        router.post('/admin/layout/about', formData, {
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
        { id: 'story', name: 'Our Story' },
        { id: 'mission', name: 'Mission' },
        { id: 'vision', name: 'Vision' },
        { id: 'faculty', name: 'Faculty' },
        { id: 'mulasayo', name: 'Mula Sayo' }
    ];

    return (
        <>
            <Head title="Layout: About" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Content Management */}
                    <aside className="w-1/4 bg-white border-r border-gray-200 h-full sticky top-16 self-start overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-800">About Page Editor</h2>
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
                                                label="Hero Image"
                                                value={heroImage}
                                                onChange={(file) => setHeroImage(file || '')}
                                                accept="image/*"
                                                allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                maxSize={5}
                                            />

                                            <div>
                                                <input
                                                    type="text"
                                                    value={heroTitle}
                                                    onChange={(e) => setHeroTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="About PUP Calauan"
                                                />
                                            </div>

                                            <div>
                                                <input
                                                    type="text"
                                                    value={heroSubtitle}
                                                    onChange={(e) => setHeroSubtitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Excellence in Education and Community Service"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Story Section */}
                                {activeSection === 'story' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Our Story</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={storyTitle}
                                                    onChange={(e) => setStoryTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Our Story"
                                                />
                                            </div>

                                            <div>
                                                <textarea
                                                    value={storyContent}
                                                    onChange={(e) => setStoryContent(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Tell the story of PUP Calauan..."
                                                    rows={6}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mission Section */}
                                {activeSection === 'mission' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Mission</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={missionTitle}
                                                    onChange={(e) => setMissionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Our Mission"
                                                />
                                            </div>

                                            <div>
                                                <textarea
                                                    value={missionContent}
                                                    onChange={(e) => setMissionContent(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter the mission statement..."
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Vision Section */}
                                {activeSection === 'vision' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Vision</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={visionTitle}
                                                    onChange={(e) => setVisionTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Our Vision"
                                                />
                                            </div>

                                            <div>
                                                <textarea
                                                    value={visionContent}
                                                    onChange={(e) => setVisionContent(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Enter the vision statement..."
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Faculty Section */}
                                {activeSection === 'faculty' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#7F0404] mb-4">Faculty</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={facultyTitle}
                                                    onChange={(e) => setFacultyTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Our Faculty"
                                                />
                                            </div>

                                            {faculty.map((item, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-medium text-gray-700">Faculty #{index + 1}</span>
                                                        {faculty.length > 1 && (
                                                            <button
                                                                onClick={() => removeFaculty(index)}
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <FileUpload
                                                            label="Faculty Image"
                                                            value={item.image}
                                                            onChange={(file) => handleFacultyChange(index, 'image', file)}
                                                            accept="image/*"
                                                            allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                                                            maxSize={2}
                                                        />

                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => handleFacultyChange(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                            placeholder="Faculty Name"
                                                        />

                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => handleFacultyChange(index, 'description', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                            placeholder="Faculty description..."
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={addFaculty}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#C46B02] hover:text-[#C46B02] transition-colors"
                                            >
                                                + Add Faculty
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
                                                <input
                                                    type="text"
                                                    value={mulaSayoTitle}
                                                    onChange={(e) => setMulaSayoTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#C46B02] focus:border-transparent"
                                                    placeholder="Mula Sayo, Para sa Bayan"
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
                                <h1 className="text-2xl font-bold text-gray-800">About Page Preview</h1>
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
                                    pageUrl="/about" 
                                    title="About Page Preview"
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