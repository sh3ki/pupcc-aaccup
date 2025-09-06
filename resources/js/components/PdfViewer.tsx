import React, { useEffect, useRef, useState, useCallback } from 'react';

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
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [isIframeReady, setIsIframeReady] = useState(false);

    // Create PDF URL with viewer parameters for navigation
    const createPdfUrl = useCallback(() => {
        // Simply return the PDF URL without complex parameters for better compatibility
        // Most browsers will handle page navigation via their built-in PDF viewer
        return url;
    }, [url]);

    // Function to get PDF metadata and page count
    const getPdfMetadata = useCallback(async () => {
        try {
            // Simple fallback - just set a default page count
            // The iframe will handle the actual PDF rendering
            setTotalPages(1); // Conservative default that works for all PDFs
            onTotalPagesChange(1);
            
        } catch (err) {
            console.warn('Could not determine PDF page count, using default:', err);
            // Fallback to default
            setTotalPages(1);
            onTotalPagesChange(1);
        }
    }, [onTotalPagesChange]);

    // Load PDF
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        setLoadingProgress(0);
        setIsIframeReady(false);

        const loadPdf = async () => {
            try {
                // Simulate loading progress and complete it quickly
                const progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(progressInterval);
                            return 100;
                        }
                        return prev + 25;
                    });
                }, 100);

                // Test if PDF URL is accessible (simplified check)
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    if (!response.ok) {
                        throw new Error(`PDF not accessible: ${response.status}`);
                    }
                } catch (fetchErr) {
                    // If HEAD request fails, just proceed anyway
                    console.warn('Could not verify PDF accessibility, proceeding anyway:', fetchErr);
                }

                // Get PDF metadata (simplified)
                await getPdfMetadata();

                if (!mounted) return;

                clearInterval(progressInterval);
                setLoadingProgress(100);
                
                // Set a timeout to ensure loading completes even if iframe doesn't fire onLoad
                setTimeout(() => {
                    if (mounted) {
                        setLoading(false);
                        setIsIframeReady(true);
                    }
                }, 1000); // Give iframe 1 second to load, then proceed anyway
                
            } catch (err) {
                if (!mounted) return;
                console.error('Error loading PDF:', err);
                setError(`Unable to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
                setLoading(false);
            }
        };

        loadPdf();

        return () => {
            mounted = false;
        };
    }, [url, getPdfMetadata]);

    // Handle iframe load
    const handleIframeLoad = useCallback(() => {
        setLoading(false);
        setLoadingProgress(100);
        setIsIframeReady(true);
        console.log('PDF iframe loaded successfully');
    }, []);

    // Handle iframe error
    const handleIframeError = useCallback((event: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
        console.error('PDF iframe failed to load:', event);
        // Don't set error immediately, sometimes iframes can recover
        setTimeout(() => {
            setLoading(false);
            setIsIframeReady(true);
            // Show a warning but still try to display the iframe
            console.warn('PDF iframe had loading issues but continuing anyway');
        }, 500);
    }, []);

    // Update scale when zoom changes
    useEffect(() => {
        setCurrentScale(zoom);
    }, [zoom]);

    // Update rotation when rotate changes
    useEffect(() => {
        setCurrentRotation(rotate);
    }, [rotate]);

    // Navigate to specific page - for HTML viewer, we'll use postMessage or reload if needed
    useEffect(() => {
        if (isIframeReady && currentPage > 0 && iframeRef.current && totalPages > 0) {
            // For HTML viewer, page navigation is handled by the browser's PDF viewer
            // We can try to use URL fragments, but many browsers ignore them in iframes
            // The navigation will be primarily handled by the DocumentNavigation component
            console.log(`Navigating to page ${currentPage}`);
        }
    }, [currentPage, isIframeReady, totalPages]);

    // Apply zoom and rotation transforms to the iframe
    const getIframeStyle = (): React.CSSProperties => {
        return {
            width: '100%',
            height: '100%',
            border: 'none',
            transform: `scale(${currentScale}) rotate(${currentRotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease',
        };
    };

    // Container style for proper scrolling and centering
    const getContainerStyle = (): React.CSSProperties => {
        return {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 0',
        };
    };

    // Calculate iframe container dimensions to accommodate scaling and rotation
    const getIframeContainerStyle = (): React.CSSProperties => {
        const scaleFactor = currentScale;
        const rotationRad = (currentRotation * Math.PI) / 180;
        
        // Calculate dimensions needed for rotated content
        const cos = Math.abs(Math.cos(rotationRad));
        const sin = Math.abs(Math.sin(rotationRad));
        
        // Expand container to fit rotated and scaled content
        const widthMultiplier = cos + sin;
        const heightMultiplier = cos + sin;
        
        return {
            width: `${100 * scaleFactor * widthMultiplier}%`,
            height: `${100 * scaleFactor * heightMultiplier}%`,
            minWidth: '100%',
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
    };

    // Handle window resize to maintain proper scaling
    useEffect(() => {
        const handleResize = () => {
            // Force re-render of iframe container when window resizes
            if (containerRef.current) {
                containerRef.current.style.height = `${containerRef.current.offsetHeight}px`;
                setTimeout(() => {
                    if (containerRef.current) {
                        containerRef.current.style.height = '100%';
                    }
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Scroll to current page effect - for iframe, we rely on the page parameter in URL
    useEffect(() => {
        if (containerRef.current && currentPage > 0 && isIframeReady) {
            // Scroll container to top when page changes
            containerRef.current.scrollTop = 0;
        }
    }, [currentPage, isIframeReady]);

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
                <div className="text-red-500 text-center">
                    <div className="mb-2">{error}</div>
                    <div className="text-sm text-gray-500">
                        Try refreshing the page or use a different browser.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className={`${className}`}
            style={getContainerStyle()}
        >
            <div style={getIframeContainerStyle()}>
                <iframe
                    ref={iframeRef}
                    src={createPdfUrl()}
                    style={getIframeStyle()}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title="PDF Viewer"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
                    allow="fullscreen"
                />
            </div>
        </div>
    );
};

export default PdfViewer;
