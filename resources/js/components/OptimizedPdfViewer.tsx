import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Production-optimized PDF.js configuration
if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    // Set worker source immediately to prevent fallback delays
    pdfjsLib.GlobalWorkerOptions.workerSrc = isProduction 
        ? '/js/pdf.worker.min.js'
        : '/js/pdf.worker.mjs';
}

interface OptimizedPdfViewerProps {
    url: string;
    currentPage: number;
    onTotalPagesChange: (totalPages: number) => void;
    zoom: number;
    rotate: number;
    className?: string;
}

export const OptimizedPdfViewer: React.FC<OptimizedPdfViewerProps> = ({
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
    const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]));
    const [renderedPages, setRenderedPages] = useState<Map<number, HTMLCanvasElement>>(new Map());

    // Optimized PDF loading with minimal configuration
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        const loadPdf = async () => {
            try {
                // Streamlined loading task with production optimizations
                const loadingTask = pdfjsLib.getDocument({
                    url: url,
                    // Disable expensive features for faster loading
                    disableAutoFetch: true,  // Don't auto-fetch all pages
                    disableStream: false,    // Enable streaming for faster initial load
                    disableRange: false,     // Enable range requests
                    useSystemFonts: true,    // Use system fonts
                    isEvalSupported: false,  // Disable eval for security/performance
                    maxImageSize: 512 * 512, // Reduce max image size for faster rendering
                    verbosity: 0,            // Disable logging
                    // Only load CMaps when needed
                    cMapUrl: undefined,
                    cMapPacked: true,
                });

                // Progress tracking
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
                
                console.log(`PDF loaded successfully: ${pdf.numPages} pages`);
            } catch (err) {
                console.error('Failed to load PDF:', err);
                if (!mounted) return;
                setError(`Failed to load PDF: ${(err as Error).message}`);
                setLoading(false);
            }
        };

        loadPdf();

        return () => {
            mounted = false;
        };
    }, [url, onTotalPagesChange]);

    // Calculate which pages should be visible based on viewport
    const calculateVisiblePages = useCallback(() => {
        if (!containerRef.current || !pdfDoc) return;

        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const pageHeight = containerHeight; // Approximate page height

        // Calculate visible page range with buffer
        const firstVisible = Math.max(1, Math.floor(scrollTop / pageHeight) + 1);
        const lastVisible = Math.min(pdfDoc.numPages, Math.ceil((scrollTop + containerHeight) / pageHeight) + 1);
        
        // Add buffer pages for smooth scrolling
        const bufferSize = 2;
        const startPage = Math.max(1, firstVisible - bufferSize);
        const endPage = Math.min(pdfDoc.numPages, lastVisible + bufferSize);

        const newVisiblePages = new Set<number>();
        for (let i = startPage; i <= endPage; i++) {
            newVisiblePages.add(i);
        }

        setVisiblePages(newVisiblePages);
    }, [pdfDoc]);

    // Render a specific page
    const renderPage = useCallback(async (pageNumber: number) => {
        if (!pdfDoc || !containerRef.current || renderedPages.has(pageNumber)) return;

        try {
            const page = await pdfDoc.getPage(pageNumber);
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;

            // Calculate optimal scale
            const viewport = page.getViewport({ scale: 1, rotation: rotate });
            const scale = (zoom * (containerWidth - 40)) / viewport.width;
            const scaledViewport = page.getViewport({ scale, rotation: rotate });

            // Set canvas dimensions
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto 20px auto';
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            canvas.style.border = '1px solid #ddd';
            canvas.id = `pdf-page-${pageNumber}`;

            // Render page
            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport,
                canvas: canvas
            };

            await page.render(renderContext).promise;
            
            // Store rendered page
            setRenderedPages(prev => new Map(prev).set(pageNumber, canvas));
            
            console.log(`Rendered page ${pageNumber}`);
        } catch (err) {
            console.error(`Error rendering page ${pageNumber}:`, err);
        }
    }, [pdfDoc, zoom, rotate, renderedPages]);

    // Update container with visible pages
    useEffect(() => {
        if (!containerRef.current || !pdfDoc) return;

        const container = containerRef.current;
        container.innerHTML = '';

        // Create placeholder for all pages
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const pageWrapper = document.createElement('div');
            pageWrapper.style.minHeight = '800px'; // Placeholder height
            pageWrapper.style.display = 'flex';
            pageWrapper.style.flexDirection = 'column';
            pageWrapper.style.alignItems = 'center';
            pageWrapper.style.justifyContent = 'center';
            pageWrapper.style.marginBottom = '20px';
            pageWrapper.id = `page-wrapper-${pageNum}`;

            if (visiblePages.has(pageNum)) {
                const canvas = renderedPages.get(pageNum);
                if (canvas) {
                    pageWrapper.innerHTML = '';
                    pageWrapper.appendChild(canvas.cloneNode(true));
                    pageWrapper.style.minHeight = 'auto';
                } else {
                    // Show loading placeholder
                    pageWrapper.innerHTML = `
                        <div style="background: #f0f0f0; border: 1px solid #ddd; width: 80%; height: 600px; display: flex; align-items: center; justify-content: center;">
                            <div style="text-align: center;">
                                <div style="margin-bottom: 10px;">Loading Page ${pageNum}...</div>
                                <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite;"></div>
                            </div>
                        </div>
                    `;
                    // Trigger page rendering
                    renderPage(pageNum);
                }
            } else {
                // Show placeholder
                pageWrapper.innerHTML = `
                    <div style="background: #f8f8f8; border: 1px solid #ddd; width: 80%; height: 600px; display: flex; align-items: center; justify-content: center; color: #666;">
                        Page ${pageNum}
                    </div>
                `;
            }

            container.appendChild(pageWrapper);
        }
    }, [visiblePages, renderedPages, pdfDoc, renderPage]);

    // Scroll handler for virtual scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            calculateVisiblePages();
        };

        // Throttle scroll events
        let scrollTimeout: NodeJS.Timeout;
        const throttledScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScroll, 100);
        };

        container.addEventListener('scroll', throttledScroll);
        
        // Initial calculation
        calculateVisiblePages();

        return () => {
            container.removeEventListener('scroll', throttledScroll);
            clearTimeout(scrollTimeout);
        };
    }, [calculateVisiblePages]);

    // Scroll to current page
    useEffect(() => {
        if (containerRef.current && currentPage > 0) {
            const pageWrapper = containerRef.current.querySelector(`#page-wrapper-${currentPage}`);
            if (pageWrapper) {
                pageWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [currentPage]);

    // Cleanup rendered pages when component unmounts
    useEffect(() => {
        return () => {
            renderedPages.clear();
        };
    }, [renderedPages]);

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center ${className}`}>
                <div className="text-gray-500 mb-4">Loading PDF...</div>
                {loadingProgress > 0 && (
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                )}
                {loadingProgress > 0 && (
                    <div className="text-sm text-gray-400 mt-2">{loadingProgress}%</div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                    Optimized loading - only renders visible pages
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <div className="text-red-500 text-center">
                    <div className="mb-2">{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
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
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default OptimizedPdfViewer;
