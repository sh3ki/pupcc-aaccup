import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import { useState, useEffect, ChangeEvent } from 'react';

export default function LayoutHome() {
    // State for all homepage content
    const [carousel, setCarousel] = useState([
        { image: '', title: '', subtitle: '' },
        { image: '', title: '', subtitle: '' },
        { image: '', title: '', subtitle: '' },
        { image: '', title: '', subtitle: '' },
    ]);
    const [accreditors, setAccreditors] = useState([
        { image: '', name: '', position: '' },
        { image: '', name: '', position: '' },
        { image: '', name: '', position: '' },
        { image: '', name: '', position: '' },
    ]);
    const [director, setDirector] = useState({
        image: '', title: '', message: '', name: '', position: ''
    });
    const [videos, setVideos] = useState([
        { youtubeId: '', title: '' },
        { youtubeId: '', title: '' },
        { youtubeId: '', title: '' },
    ]);
    const [videosSectionTitle, setVideosSectionTitle] = useState('');
    const [programs, setPrograms] = useState([
        { image: '', title: '', description: '' },
        { image: '', title: '', description: '' },
        { image: '', title: '', description: '' },
    ]);
    const [programsSectionTitle, setProgramsSectionTitle] = useState('');
    const [mulaSayoImage, setMulaSayoImage] = useState('');
    const [saving, setSaving] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        fetch('/api/home')
            .then(res => res.json())
            .then(data => {
                if (!data) return;
                setCarousel([
                    { image: data.carousel_image_1 || '', title: data.carousel_title_1 || '', subtitle: data.carousel_subtitle_1 || '' },
                    { image: data.carousel_image_2 || '', title: data.carousel_title_2 || '', subtitle: data.carousel_subtitle_2 || '' },
                    { image: data.carousel_image_3 || '', title: data.carousel_title_3 || '', subtitle: data.carousel_subtitle_3 || '' },
                    { image: data.carousel_image_4 || '', title: data.carousel_title_4 || '', subtitle: data.carousel_subtitle_4 || '' },
                ]);
                setAccreditors([
                    { image: data.accreditor_image_1 || '', name: data.accreditor_name_1 || '', position: data.accreditor_position_1 || '' },
                    { image: data.accreditor_image_2 || '', name: data.accreditor_name_2 || '', position: data.accreditor_position_2 || '' },
                    { image: data.accreditor_image_3 || '', name: data.accreditor_name_3 || '', position: data.accreditor_position_3 || '' },
                    { image: data.accreditor_image_4 || '', name: data.accreditor_name_4 || '', position: data.accreditor_position_4 || '' },
                ]);
                setDirector({
                    image: data.director_image || '',
                    title: data.director_title || '',
                    message: data.director_message || '',
                    name: data.director_name || '',
                    position: data.director_position || '',
                });
                setVideos([
                    { youtubeId: data.video_youtube_id_1 || '', title: data.video_title_1 || '' },
                    { youtubeId: data.video_youtube_id_2 || '', title: data.video_title_2 || '' },
                    { youtubeId: data.video_youtube_id_3 || '', title: data.video_title_3 || '' },
                ]);
                setVideosSectionTitle(data.videos_section_title || '');
                setPrograms([
                    { image: data.program_image_1 || '', title: data.program_title_1 || '', description: data.program_description_1 || '' },
                    { image: data.program_image_2 || '', title: data.program_title_2 || '', description: data.program_description_2 || '' },
                    { image: data.program_image_3 || '', title: data.program_title_3 || '', description: data.program_description_3 || '' },
                ]);
                setProgramsSectionTitle(data.programs_section_title || '');
                setMulaSayoImage(data.mula_sayo_image || '');
            });
    }, []);

    // File upload handlers
    const handleFileUpload = (
        e: ChangeEvent<HTMLInputElement>,
        callback: (file: File) => void
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            callback(file);
        }
    };

    // Carousel handlers
    const handleCarouselChange = (idx: number, field: string, value: string) => {
        const updated = [...carousel];
        updated[idx][field] = value;
        setCarousel(updated);
    };
    const handleCarouselImage = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e, file => {
            const updated = [...carousel];
            updated[idx].image = file;
            setCarousel(updated);
        });
    };

    // Accreditors handlers
    const handleAccreditorChange = (idx: number, field: string, value: string) => {
        const updated = [...accreditors];
        updated[idx][field] = value;
        setAccreditors(updated);
    };
    const handleAccreditorImage = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e, file => {
            const updated = [...accreditors];
            updated[idx].image = file;
            setAccreditors(updated);
        });
    };

    // Director handlers
    const handleDirectorChange = (field: string, value: string) => {
        setDirector({ ...director, [field]: value });
    };
    const handleDirectorImage = (e: ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e, file => setDirector({ ...director, image: file }));
    };

    // Programs handlers
    const handleProgramChange = (idx: number, field: string, value: string) => {
        const updated = [...programs];
        updated[idx][field] = value;
        setPrograms(updated);
    };
    const handleProgramImage = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e, file => {
            const updated = [...programs];
            updated[idx].image = file;
            setPrograms(updated);
        });
    };

    // Mula Sayo image handler
    const handleMulaSayoImage = (e: ChangeEvent<HTMLInputElement>) => {
        handleFileUpload(e, file => setMulaSayoImage(file));
    };

    // Save handler
    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();

        // Carousel
        carousel.forEach((item, idx) => {
            const i = idx + 1;
            formData.append(`carousel_title_${i}`, item.title);
            formData.append(`carousel_subtitle_${i}`, item.subtitle);
            if (item.image instanceof File) {
                formData.append(`carousel_image_${i}`, item.image);
            } else if (typeof item.image === 'string' && item.image) {
                formData.append(`carousel_image_${i}`, item.image);
            }
        });

        // Accreditors
        accreditors.forEach((item, idx) => {
            const i = idx + 1;
            formData.append(`accreditor_name_${i}`, item.name);
            formData.append(`accreditor_position_${i}`, item.position);
            if (item.image instanceof File) {
                formData.append(`accreditor_image_${i}`, item.image);
            } else if (typeof item.image === 'string' && item.image) {
                formData.append(`accreditor_image_${i}`, item.image);
            }
        });

        // Director
        if (director.image instanceof File) {
            formData.append('director_image', director.image);
        } else if (typeof director.image === 'string' && director.image) {
            formData.append('director_image', director.image);
        }
        formData.append('director_title', director.title);
        formData.append('director_message', director.message);
        formData.append('director_name', director.name);
        formData.append('director_position', director.position);

        // Videos
        formData.append('videos_section_title', videosSectionTitle);
        videos.forEach((item, idx) => {
            const i = idx + 1;
            formData.append(`video_youtube_id_${i}`, item.youtubeId);
            formData.append(`video_title_${i}`, item.title);
        });

        // Programs
        formData.append('programs_section_title', programsSectionTitle);
        programs.forEach((item, idx) => {
            const i = idx + 1;
            formData.append(`program_title_${i}`, item.title);
            formData.append(`program_description_${i}`, item.description);
            if (item.image instanceof File) {
                formData.append(`program_image_${i}`, item.image);
            } else if (typeof item.image === 'string' && item.image) {
                formData.append(`program_image_${i}`, item.image);
            }
        });

        // Mula Sayo Image
        if (mulaSayoImage instanceof File) {
            formData.append('mula_sayo_image', mulaSayoImage);
        } else if (typeof mulaSayoImage === 'string' && mulaSayoImage) {
            formData.append('mula_sayo_image', mulaSayoImage);
        }

        router.post('/admin/home', formData, {
            forceFormData: true,
            onFinish: () => setSaving(false),
        });
    };

    // Helper to show preview for both File and string path
    const getImagePreview = (img: any) => {
        if (!img) return '';
        if (img instanceof File) return URL.createObjectURL(img);
        if (typeof img === 'string' && img.startsWith('uploads/')) return `/storage/${img}`;
        return img;
    };

    return (
        <>
            <Head title="Layout: Home" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar */}
                    <aside className="w-[370px] min-w-[320px] max-w-[400px] bg-white/90 border-r border-gray-200 shadow-lg h-full sticky top-16 self-start flex flex-col">
                        <div className="flex flex-col h-full">
                            {/* Sidebar Header */}
                            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold shadow-sm">
                                    <svg width="24" height="24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M8 12h8M12 8v8" strokeWidth="2" strokeLinecap="round"/></svg>
                                </span>
                                <h2 className="font-bold text-2xl text-gray-800 tracking-tight">Home Page Editor</h2>
                            </div>
                            <hr className="my-2 border-gray-200" />
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-4 pb-32">
                                {/* Carousel */}
                                <section className="mb-8 bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-yellow-500"><svg width="20" height="20" fill="none" stroke="currentColor"><rect x="3" y="5" width="14" height="10" rx="2" strokeWidth="2"/><path d="M3 7l7 5 7-5" strokeWidth="2"/></svg></span>
                                        <h3 className="font-semibold text-lg text-gray-700">Carousel <span className="text-xs text-gray-400">(4 Images)</span></h3>
                                    </div>
                                    <div className="space-y-6">
                                        {carousel.map((item, idx) => (
                                            <div key={idx} className="rounded-lg bg-white/80 border border-gray-200 p-3 shadow-sm">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Carousel Image {idx + 1}</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleCarouselImage(idx, e)}
                                                    className="mb-2 w-full border border-gray-300 rounded file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
                                                />
                                                {item.image && (
                                                    <>
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Preview</label>
                                                        <img src={getImagePreview(item.image)} alt={`Carousel ${idx + 1}`} className="mb-2 w-full h-24 object-cover rounded-lg border" />
                                                    </>
                                                )}
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Title"
                                                    value={item.title}
                                                    onChange={e => handleCarouselChange(idx, 'title', e.target.value)}
                                                    className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                                                />
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                                                <input
                                                    type="text"
                                                    placeholder="Subtitle"
                                                    value={item.subtitle}
                                                    onChange={e => handleCarouselChange(idx, 'subtitle', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                {/* Accreditors */}
                                <section className="mb-8 bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-pink-500"><svg width="20" height="20" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="4" strokeWidth="2"/><path d="M16 16v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" strokeWidth="2"/></svg></span>
                                        <h3 className="font-semibold text-lg text-gray-700">Accreditors <span className="text-xs text-gray-400">(4)</span></h3>
                                    </div>
                                    <div className="space-y-6">
                                        {accreditors.map((item, idx) => (
                                            <div key={idx} className="rounded-lg bg-white/80 border border-gray-200 p-3 shadow-sm">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Accreditor {idx + 1} Image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleAccreditorImage(idx, e)}
                                                    className="mb-2 w-full border border-gray-300 rounded file:rounded file:border-0 file:bg-pink-50 file:text-pink-700 file:font-semibold"
                                                />
                                                {item.image && (
                                                    <>
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Preview</label>
                                                        <img src={getImagePreview(item.image)} alt={`Accreditor ${idx + 1}`} className="mb-2 w-20 h-20 object-cover rounded-full border mx-auto" />
                                                    </>
                                                )}
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    value={item.name}
                                                    onChange={e => handleAccreditorChange(idx, 'name', e.target.value)}
                                                    className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200"
                                                />
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Position</label>
                                                <input
                                                    type="text"
                                                    placeholder="Position"
                                                    value={item.position}
                                                    onChange={e => handleAccreditorChange(idx, 'position', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                {/* Director */}
                                <section className="mb-8 bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-blue-500"><svg width="20" height="20" fill="none" stroke="currentColor"><circle cx="10" cy="7" r="4" strokeWidth="2"/><path d="M2 18v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" strokeWidth="2"/></svg></span>
                                        <h3 className="font-semibold text-lg text-gray-700">Director</h3>
                                    </div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Director Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleDirectorImage}
                                        className="mb-2 w-full border border-gray-300 rounded file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
                                    />
                                    {director.image && (
                                        <>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Preview</label>
                                            <img src={getImagePreview(director.image)} alt="Director" className="mb-2 w-24 h-24 object-cover rounded-full border mx-auto" />
                                        </>
                                    )}
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={director.title}
                                        onChange={e => handleDirectorChange('title', e.target.value)}
                                        className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                                    />
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Message</label>
                                    <textarea
                                        placeholder="Message"
                                        value={director.message}
                                        onChange={e => handleDirectorChange('message', e.target.value)}
                                        className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                                    />
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={director.name}
                                        onChange={e => handleDirectorChange('name', e.target.value)}
                                        className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                                    />
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Position</label>
                                    <input
                                        type="text"
                                        placeholder="Position"
                                        value={director.position}
                                        onChange={e => handleDirectorChange('position', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                                    />
                                </section>
                                {/* Videos */}
                                <section className="mb-8 bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-red-500"><svg width="20" height="20" fill="none" stroke="currentColor"><rect x="3" y="5" width="14" height="10" rx="2" strokeWidth="2"/><path d="M10 9l5 3-5 3V9z" strokeWidth="2"/></svg></span>
                                        <h3 className="font-semibold text-lg text-gray-700">Campus Videos <span className="text-xs text-gray-400">(3)</span></h3>
                                    </div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        placeholder="Section Title"
                                        value={videosSectionTitle}
                                        onChange={e => setVideosSectionTitle(e.target.value)}
                                        className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200"
                                    />
                                    <div className="space-y-6">
                                        {videos.map((item, idx) => (
                                            <div key={idx} className="rounded-lg bg-white/80 border border-gray-200 p-3 shadow-sm">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube Video ID {idx + 1}</label>
                                                <input
                                                    type="text"
                                                    placeholder="YouTube Video ID"
                                                    value={item.youtubeId}
                                                    onChange={e => {
                                                        const updated = [...videos];
                                                        updated[idx].youtubeId = e.target.value;
                                                        setVideos(updated);
                                                    }}
                                                    className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200"
                                                />
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Video Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Video Title"
                                                    value={item.title}
                                                    onChange={e => {
                                                        const updated = [...videos];
                                                        updated[idx].title = e.target.value;
                                                        setVideos(updated);
                                                    }}
                                                    className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                {/* Programs */}
                                <section className="mb-8 bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-green-500"><svg width="20" height="20" fill="none" stroke="currentColor"><rect x="3" y="5" width="14" height="10" rx="2" strokeWidth="2"/><path d="M7 9h6M7 13h6" strokeWidth="2"/></svg></span>
                                        <h3 className="font-semibold text-lg text-gray-700">Programs <span className="text-xs text-gray-400">(3)</span></h3>
                                    </div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Section Title</label>
                                    <input
                                        type="text"
                                        placeholder="Section Title"
                                        value={programsSectionTitle}
                                        onChange={e => setProgramsSectionTitle(e.target.value)}
                                        className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200"
                                    />
                                    <div className="space-y-6">
                                        {programs.map((item, idx) => (
                                            <div key={idx} className="rounded-lg bg-white/80 border border-gray-200 p-3 shadow-sm">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Program {idx + 1} Image</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleProgramImage(idx, e)}
                                                    className="mb-2 w-full border border-gray-300 rounded file:rounded file:border-0 file:bg-green-50 file:text-green-700 file:font-semibold"
                                                />
                                                {item.image && (
                                                    <>
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Preview</label>
                                                        <img src={getImagePreview(item.image)} alt={`Program ${idx + 1}`} className="mb-2 w-full h-20 object-cover rounded-lg border" />
                                                    </>
                                                )}
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    placeholder="Title"
                                                    value={item.title}
                                                    onChange={e => handleProgramChange(idx, 'title', e.target.value)}
                                                    className="mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200"
                                                />
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                                                <textarea
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={e => handleProgramChange(idx, 'description', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                {/* Mula Sayo, Para Sa Bayan */}
                                <section className="mb-8 bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-yellow-600"><svg width="20" height="20" fill="none" stroke="currentColor"><rect x="3" y="5" width="14" height="10" rx="2" strokeWidth="2"/><path d="M7 9h6M7 13h6" strokeWidth="2"/></svg></span>
                                        <h3 className="font-semibold text-lg text-gray-700">Mula Sayo, Para Sa Bayan Image</h3>
                                    </div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMulaSayoImage}
                                        className="mb-2 w-full border border-gray-300 rounded file:rounded file:border-0 file:bg-yellow-50 file:text-yellow-700 file:font-semibold"
                                    />
                                    {mulaSayoImage && (
                                        <>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Preview</label>
                                            <img src={getImagePreview(mulaSayoImage)} alt="Mula Sayo, Para Sa Bayan" className="w-full h-32 object-cover rounded-lg border mb-2" />
                                        </>
                                    )}
                                </section>
                            </div>
                            {/* Save Button */}
                            <div className="px-6 py-4 bg-white rounded-b-lg shadow-inner">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-500 disabled:opacity-50 transition"
                                >
                                    {saving && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" strokeLinecap="round"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4zm16 0a8 8 0 01-8 8v-4a4 4 0 004-4h4z"/></svg>}
                                    {saving ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </div>
                    </aside>
                    {/* Main Content */}
                    <section className="flex-1 w-full px-8 py-4 pb-2 text-left flex flex-col h-full">
                        {/* Preview Container */}
                        <div className="flex-1 min-h-0 flex justify-center">
                            <div className="h-full aspect-video">
                                <PagePreview 
                                    pageUrl="/"
                                    homepageData={{
                                        carousel,
                                        accreditors,
                                        director,
                                        videos,
                                        videosSectionTitle,
                                        programs,
                                        programsSectionTitle,
                                        mulaSayoImage
                                    }}
                                    title="Home Page Preview"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        </>
    );
}