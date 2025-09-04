import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with multiple fallback options
if (typeof window !== 'undefined') {
    // For production environments, use CDN workers which are more reliable
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Use local .js worker for production (better compatibility than .mjs)
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
    } else {
        // Use local worker for development
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.mjs';
    }
}

interface PDFThumbnailProps {
    url: string;
    className?: string;
    scale?: number; // Optional scale parameter, defaults to 0.5
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ url, className = '', scale = 0.5 }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const currentThumbnailRef = useRef<string | null>(null);

    useEffect(() => {
        const generateThumbnail = async () => {
            try {
                setLoading(true);
                setError(false);
                
                // Clean up any existing thumbnail
                if (currentThumbnailRef.current) {
                    URL.revokeObjectURL(currentThumbnailRef.current);
                    currentThumbnailRef.current = null;
                }
                
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1); // Get first page
                
                const viewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context!,
                    viewport: viewport,
                    canvas: canvas
                };
                
                await page.render(renderContext).promise;
                
                // Convert canvas to blob URL
                canvas.toBlob((blob) => {
                    if (blob) {
                        const blobUrl = URL.createObjectURL(blob);
                        currentThumbnailRef.current = blobUrl;
                        setThumbnailUrl(blobUrl);
                    }
                }, 'image/png');
                
            } catch (err) {
                console.error('Error generating PDF thumbnail:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        generateThumbnail();

        // Cleanup function
        return () => {
            if (currentThumbnailRef.current) {
                URL.revokeObjectURL(currentThumbnailRef.current);
                currentThumbnailRef.current = null;
            }
        };
    }, [url, scale]);

    if (loading) {
        return (
            <div className={`${className} bg-gray-100 animate-pulse flex items-center justify-center`}>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l4-4 4 4V4z" />
                </svg>
            </div>
        );
    }

    if (error || !thumbnailUrl) {
        return <img src="/thumbnails/pdf.svg" alt="PDF thumbnail" className={className} />;
    }

    return <img src={thumbnailUrl} alt="PDF preview" className={className} />;
};

export default PDFThumbnail;
