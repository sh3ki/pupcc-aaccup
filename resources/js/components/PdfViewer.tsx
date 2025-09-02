import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with multiple fallback options
if (typeof window !== 'undefined') {
    // Primary: Use the copied worker file in public directory
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.mjs';
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
    const [pageCanvases, setPageCanvases] = useState<HTMLCanvasElement[]>([]);

    // Load PDF document
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        const loadPdfWithFallback = async () => {
            const workerSources = [
                '/js/pdf.worker.mjs', // Local copied worker
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`, // CDN fallback
                `https://mozilla.github.io/pdf.js/build/pdf.worker.js` // Mozilla CDN fallback
            ];

            for (let i = 0; i < workerSources.length; i++) {
                try {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[i];
                    const pdf = await pdfjsLib.getDocument(url).promise;
                    
                    if (!mounted) return;
                    setPdfDoc(pdf);
                    onTotalPagesChange(pdf.numPages);
                    
                    // Create canvas elements for all pages
                    const canvases: HTMLCanvasElement[] = [];
                    for (let j = 0; j < pdf.numPages; j++) {
                        const canvas = document.createElement('canvas');
                        canvas.style.display = 'block';
                        canvas.style.margin = '0 auto 10px auto';
                        canvas.style.maxWidth = '100%';
                        canvas.style.height = 'auto';
                        canvases.push(canvas);
                    }
                    setPageCanvases(canvases);
                    setLoading(false);
                    return; // Success, exit the loop
                } catch (err) {
                    console.warn(`Failed to load PDF with worker ${i + 1}:`, err);
                    if (i === workerSources.length - 1) {
                        // Last attempt failed
                        if (!mounted) return;
                        setError('Failed to load PDF: ' + (err as Error).message);
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
        if (!pdfDoc || !containerRef.current || pageCanvases.length === 0) return;

        try {
            const container = containerRef.current;
            const containerWidth = container.clientWidth;
            
            // Clear container
            container.innerHTML = '';

            // Render each page
            for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const canvas = pageCanvases[pageNum - 1];
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
    }, [pdfDoc, pageCanvases, zoom, rotate]);

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
            <div className={`flex items-center justify-center ${className}`}>
                <div className="text-gray-500">Loading PDF...</div>
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
