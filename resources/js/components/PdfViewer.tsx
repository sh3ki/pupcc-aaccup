import React, { useEffect, useRef, useState, useCallback } from 'react';
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

interface PdfViewerProps {
    url: string;
    currentPage: number;
    onTotalPagesChange: (totalPages: number) => void;
    zoom: number;
    rotate: number;
    className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
    url,
    currentPage,
    onTotalPagesChange,
    zoom,
    rotate,
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Load PDF document
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        const loadPdfWithFallback = async () => {
            const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            
            // More robust worker sources with local .js first for production
            const workerSources = isProduction ? [
                // Production: Use local .js worker first (best compatibility)
                '/js/pdf.worker.min.js',
                '/js/pdf.worker.js', // Fallback if .min version not found
                // CDN fallbacks
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
                'https://unpkg.com/pdfjs-dist@5.4.54/legacy/build/pdf.worker.min.js',
                'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/legacy/build/pdf.worker.min.js',
            ] : [
                // Development: Try local files first
                '/js/pdf.worker.mjs',
                '/js/pdf.worker.min.js',
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
            ];

            for (let i = 0; i < workerSources.length; i++) {
                try {
                    console.log(`Trying worker source ${i + 1}/${workerSources.length}: ${workerSources[i]}`);
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[i];
                    
                    // Optimized configuration for faster loading
                    const loadingTask = pdfjsLib.getDocument({
                        url: url,
                        cMapUrl: isProduction 
                            ? `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`
                            : 'https://unpkg.com/pdfjs-dist@5.4.54/cmaps/',
                        cMapPacked: true,
                        // Performance optimizations
                        useSystemFonts: true,
                        isEvalSupported: false,
                        maxImageSize: 1024 * 1024, // 1MB max image size
                        disableFontFace: false,
                        // Enable progressive loading
                        disableAutoFetch: false,
                        disableStream: false,
                        disableRange: false,
                        // Reduce memory usage
                        verbosity: 0, // Disable debug logs
                    });

                    // Add progress tracking
                    loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
                        if (progress.total > 0) {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            setLoadingProgress(percent);
                        }
                    };

                    const pdf = await loadingTask.promise;
                    
                    if (!mounted) return;
                    setPdfDoc(pdf);
                    onTotalPagesChange(pdf.numPages);
                    setLoading(false);
                    console.log(`Successfully loaded PDF with worker source ${i + 1}`);
                    return; // Success, exit the loop
                } catch (err) {
                    console.warn(`Failed to load PDF with worker ${i + 1} (${workerSources[i]}):`, err);
                    
                    // Log specific error details for debugging
                    if (err instanceof Error) {
                        console.warn(`Error type: ${err.name}, Message: ${err.message}`);
                        if (err.message.includes('Failed to fetch dynamically imported module')) {
                            console.warn('This is likely a MIME type or module loading issue');
                        }
                        if (err.message.includes('CORS')) {
                            console.warn('This is a CORS policy issue');
                        }
                    }
                    
                    if (i === workerSources.length - 1) {
                        // Last attempt failed, try one more fallback with blob worker
                        try {
                            console.log('Trying blob worker as final fallback...');
                            // Create a blob-based worker as absolute fallback
                            const workerCode = `
                                importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js');
                            `;
                            const blob = new Blob([workerCode], { type: 'application/javascript' });
                            const blobUrl = URL.createObjectURL(blob);
                            pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
                            
                            const blobTask = pdfjsLib.getDocument({
                                url: url,
                                cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
                                cMapPacked: true,
                                useSystemFonts: false,
                                isEvalSupported: false,
                                maxImageSize: 1024 * 1024,
                            });
                            
                            const blobPdf = await blobTask.promise;
                            
                            // Clean up blob URL
                            URL.revokeObjectURL(blobUrl);
                            
                            if (!mounted) return;
                            setPdfDoc(blobPdf);
                            onTotalPagesChange(blobPdf.numPages);
                            setLoading(false);
                            console.log('Successfully loaded PDF with blob worker');
                            return;
                        } catch (blobErr) {
                            console.error('Blob worker also failed:', blobErr);
                        }
                        
                        // Absolutely final fallback
                        if (!mounted) return;
                        setError(`Unable to load PDF viewer. This may be due to browser security restrictions or network issues. Please try refreshing the page or use a different browser.`);
                        setLoading(false);
                    }
                    // Continue to next worker source
                }
            }
        };

        loadPdfWithFallback();

        return () => {
            mounted = false;
        };
    }, [url, onTotalPagesChange]);

    // Render all pages
    const renderAllPages = useCallback(async () => {
        if (!pdfDoc || !containerRef.current) return;

        try {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            
            // Clear container
            container.innerHTML = '';

            // Render each page
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                
                // Create a new canvas for each render to avoid reuse issues
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                if (!context) continue;

                // Get page viewport
                const viewport = page.getViewport({ scale: 1, rotation: rotate });
                
                // Calculate scale based on zoom percentage of container width
                const containerPadding = 40; // Account for padding
                const availableWidth = containerWidth - containerPadding;
                const scale = (zoom * availableWidth) / viewport.width;

                // Update viewport with calculated scale and rotation
                const scaledViewport = page.getViewport({ scale, rotation: rotate });

                // Set canvas dimensions
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;

                // Set canvas styles
                canvas.style.display = 'block';
                canvas.style.margin = '0 auto 10px auto';
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';

                // Clear canvas
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Render page
                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport,
                    canvas: canvas
                };

                await page.render(renderContext).promise;

                // Create page wrapper with page number indicator
                const pageWrapper = document.createElement('div');
                pageWrapper.style.position = 'relative';
                pageWrapper.style.marginBottom = '20px';
                pageWrapper.style.display = 'flex';
                pageWrapper.style.flexDirection = 'column';
                pageWrapper.style.alignItems = 'center';
                pageWrapper.id = `pdf-page-${pageNum}`;
                
                // Add page number indicator
                const pageIndicator = document.createElement('div');
                pageIndicator.style.fontSize = '12px';
                pageIndicator.style.color = '#666';
                pageIndicator.style.backgroundColor = '#f0f0f0';
                pageIndicator.style.padding = '4px 8px';
                pageIndicator.style.borderRadius = '4px';
                pageIndicator.style.marginBottom = '8px';
                pageIndicator.style.alignSelf = 'flex-start';
                pageIndicator.textContent = `Page ${pageNum}`;
                
                pageWrapper.appendChild(pageIndicator);
                pageWrapper.appendChild(canvas);
                container.appendChild(pageWrapper);
            }
        } catch (err) {
            console.error('Error rendering pages:', err);
            setError('Failed to render pages: ' + (err as Error).message);
        }
    }, [pdfDoc, zoom, rotate]);

    // Re-render when dependencies change
    useEffect(() => {
        renderAllPages();
    }, [renderAllPages]);

    // Scroll to current page
    useEffect(() => {
        if (containerRef.current && currentPage > 0) {
            const pageElement = containerRef.current.querySelector(`#pdf-page-${currentPage}`);
            if (pageElement) {
                pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [currentPage]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            // Small delay to ensure container has updated dimensions
            setTimeout(renderAllPages, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [renderAllPages]);

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center ${className}`}>
                <div className="text-gray-500 mb-4">Loading PDF...</div>
                {loadingProgress > 0 && (
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                )}
                {loadingProgress > 0 && (
                    <div className="text-sm text-gray-400 mt-2">{loadingProgress}%</div>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className={`overflow-auto ${className}`}
            style={{ 
                width: '100%', 
                height: '100%',
                padding: '20px 0',
                backgroundColor: '#f5f5f5'
            }}
        >
            {/* PDF pages will be rendered here dynamically */}
        </div>
    );
};

export default PdfViewer;
