import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PagePreview from '@/components/PagePreview';
import { useState } from 'react';

export default function LayoutAbout() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            console.log('Layout saved!');
        }, 1000);
    };

    return (
        <>
            <Head title="Layout: About" />
            <DashboardLayout>
                <div className="flex w-full h-[calc(100vh-64px-40px)]">
                    {/* Sidebar - Blank for now */}
                    <aside className="w-1/5 bg-gray-50 p-4 h-full sticky top-16 self-start overflow-y-auto border-r border-gray-200">
                        <div className="text-center text-gray-500 mt-8">
                            <p className="text-sm">Sidebar Content</p>
                            <p className="text-xs mt-2">Coming Soon...</p>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <section className="flex-1 w-full px-8 py-4 pb-2 text-left flex flex-col h-full">
                        {/* Save Button */}
                        <div className="flex justify-end mb-2 flex-shrink-0">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center bg-[#7F0404] hover:bg-[#a00a0a] disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded shadow transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-sm"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Save
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Preview Container */}
                        <div className="flex-1 min-h-0 flex justify-center">
                            <div className="h-full aspect-video">
                                <PagePreview 
                                    pageUrl="/about" 
                                    title="About Page Preview"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        </>
    );
}
