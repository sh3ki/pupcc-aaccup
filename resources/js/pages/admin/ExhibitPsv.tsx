import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PdfViewer from '@/components/PdfViewer';

interface PsvContent {
    hero_image?: string;
    hero_title: string;
    hero_subtitle: string;
    section_title: string;
    psv_document?: string;
    footer_section_title: string;
    footer_image?: string;
}

interface Props {
    psvContent: PsvContent;
}

// Helper functions
const getFileExtension = (url: string) => {
    if (!url) return '';
    return url.split('.').pop()?.toLowerCase() || '';
};

const isPDF = (url: string) => {
    const extension = getFileExtension(url);
    return extension === 'pdf';
};

const isImage = (url: string) => {
    const extension = getFileExtension(url);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
};

export default function ExhibitPsv({ psvContent }: Props) {
    const heroImageRef = useRef<HTMLInputElement>(null);
    const documentRef = useRef<HTMLInputElement>(null);
    const footerImageRef = useRef<HTMLInputElement>(null);
    const [previewUrls, setPreviewUrls] = useState<{
        hero_image?: string;
        psv_document?: string;
        footer_image?: string;
    }>({});

    const { data, setData, post, processing, errors } = useForm({
        hero_title: psvContent.hero_title || '',
        hero_subtitle: psvContent.hero_subtitle || '',
        section_title: psvContent.section_title || '',
        footer_section_title: psvContent.footer_section_title || '',
        hero_image: null as File | null,
        psv_document: null as File | null,
        footer_image: null as File | null,
    });

    const handleFileChange = (field: 'hero_image' | 'psv_document' | 'footer_image', file: File | null) => {
        setData(field, file);
        
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrls(prev => ({
                ...prev,
                [field]: url
            }));
        } else {
            setPreviewUrls(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/exhibit-psv', {
            forceFormData: true,
            onSuccess: () => {
                // Clear preview URLs
                Object.values(previewUrls).forEach(url => {
                    if (url) URL.revokeObjectURL(url);
                });
                setPreviewUrls({});
            }
        });
    };

    const getCurrentDocument = () => {
        return previewUrls.psv_document || psvContent.psv_document;
    };

    const getCurrentHeroImage = () => {
        return previewUrls.hero_image || psvContent.hero_image;
    };

    const getCurrentFooterImage = () => {
        return previewUrls.footer_image || psvContent.footer_image;
    };

    return (
        <DashboardLayout>
            <Head title="Manage PSV Exhibit" />
            
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Manage PSV Exhibit</h1>
                        <p className="text-gray-600 mt-2">Update the Program Self-Verification exhibit content</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Edit Content</h2>
                            
                            <form onSubmit={submit} className="space-y-6">
                                {/* Hero Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Hero Section</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hero Title
                                        </label>
                                        <input
                                            type="text"
                                            value={data.hero_title}
                                            onChange={(e) => setData('hero_title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter hero title"
                                        />
                                        {errors.hero_title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.hero_title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hero Subtitle
                                        </label>
                                        <textarea
                                            value={data.hero_subtitle}
                                            onChange={(e) => setData('hero_subtitle', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter hero subtitle"
                                        />
                                        {errors.hero_subtitle && (
                                            <p className="text-red-500 text-sm mt-1">{errors.hero_subtitle}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hero Background Image
                                        </label>
                                        <input
                                            ref={heroImageRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('hero_image', e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.hero_image && (
                                            <p className="text-red-500 text-sm mt-1">{errors.hero_image}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Document Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Document Section</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section Title
                                        </label>
                                        <input
                                            type="text"
                                            value={data.section_title}
                                            onChange={(e) => setData('section_title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter section title"
                                        />
                                        {errors.section_title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.section_title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PSV Document
                                        </label>
                                        <input
                                            ref={documentRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileChange('psv_document', e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Accepted formats: PDF, DOC, DOCX, JPG, PNG
                                        </p>
                                        {errors.psv_document && (
                                            <p className="text-red-500 text-sm mt-1">{errors.psv_document}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Footer Section</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Footer Section Title
                                        </label>
                                        <input
                                            type="text"
                                            value={data.footer_section_title}
                                            onChange={(e) => setData('footer_section_title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter footer section title"
                                        />
                                        {errors.footer_section_title && (
                                            <p className="text-red-500 text-sm mt-1">{errors.footer_section_title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Footer Background Image
                                        </label>
                                        <input
                                            ref={footerImageRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange('footer_image', e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.footer_image && (
                                            <p className="text-red-500 text-sm mt-1">{errors.footer_image}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update PSV Exhibit'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Preview Section */}
                        <div className="space-y-6">
                            {/* Hero Image Preview */}
                            {getCurrentHeroImage() && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Hero Image Preview</h3>
                                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={getCurrentHeroImage()}
                                            alt="Hero preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Document Preview */}
                            {getCurrentDocument() && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Document Preview</h3>
                                    {isPDF(getCurrentDocument()!) ? (
                                        <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                                            <PdfViewer
                                                url={getCurrentDocument()!}
                                                currentPage={1}
                                                onTotalPagesChange={() => {}}
                                                zoom={0.6}
                                                rotate={0}
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ) : isImage(getCurrentDocument()!) ? (
                                        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={getCurrentDocument()}
                                                alt="Document preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-gray-500 mb-2">Document uploaded</div>
                                                <div className="text-sm text-gray-400">Preview not available for this file type</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer Image Preview */}
                            {getCurrentFooterImage() && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Footer Image Preview</h3>
                                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={getCurrentFooterImage()}
                                            alt="Footer preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <a
                                        href="/exhibit/psv"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        View Public Page
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            heroImageRef.current?.click();
                                        }}
                                        className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        Change Hero Image
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            documentRef.current?.click();
                                        }}
                                        className="block w-full text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        Change Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
