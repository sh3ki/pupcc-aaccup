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
    const embedRef = useRef<HTMLEmbedElement>(null);
    const objectRef = useRef<HTMLObjectElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);
    const [currentRotation, setCurrentRotation] = useState(0);
    const [viewerMethod, setViewerMethod] = useState<'embed' | 'object' | 'iframe'>('embed');

    // Create PDF URL with proper parameters
    const createPdfUrl = useCallback(() => {
        let pdfUrl = url;
        
        // Add page parameter for browsers that support it
        if (currentPage > 1) {
            const separator = url.includes('#') ? '&' : '#';
            pdfUrl += `${separator}page=${currentPage}`;
        }
        
        return pdfUrl;
    }, [url, currentPage]);

    // Load PDF with multiple fallback methods
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        setLoadingProgress(0);

        const loadPdf = async () => {
            try {
                // Quick progress simulation
                const progressSteps = [20, 40, 60, 80, 100];
                let currentStep = 0;
                
                const progressInterval = setInterval(() => {
                    if (currentStep < progressSteps.length) {
                        setLoadingProgress(progressSteps[currentStep]);
                        currentStep++;
                    } else {
                        clearInterval(progressInterval);
                    }
                }, 150);

                // Test PDF accessibility
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    if (!response.ok) {
                        throw new Error(`PDF not accessible: ${response.status}`);
                    }
                } catch (fetchErr) {
                    console.warn('Could not verify PDF accessibility:', fetchErr);
                }

                // Set default page count
                onTotalPagesChange(10); // Default reasonable page count

                if (!mounted) return;

                clearInterval(progressInterval);
                setLoadingProgress(100);
                
                // Complete loading after a short delay
                setTimeout(() => {
                    if (mounted) {
                        setLoading(false);
                    }
                }, 500);
                
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
    }, [url, onTotalPagesChange]);

    // Update scale when zoom changes
    useEffect(() => {
        setCurrentScale(zoom);
    }, [zoom]);

    // Update rotation when rotate changes
    useEffect(() => {
        setCurrentRotation(rotate);
    }, [rotate]);

    // Handle PDF load success
    const handlePdfLoad = useCallback(() => {
        setLoading(false);
        setError(null);
        console.log('PDF loaded successfully');
    }, []);

    // Handle PDF load error and try fallback methods
    const handlePdfError = useCallback(() => {
        console.warn(`PDF loading failed with method: ${viewerMethod}, trying fallback...`);
        
        if (viewerMethod === 'embed') {
            setViewerMethod('object');
        } else if (viewerMethod === 'object') {
            setViewerMethod('iframe');
        } else {
            // All methods failed
            setError('Unable to display PDF. Your browser may not support PDF viewing or the file may be corrupted.');
            setLoading(false);
        }
    }, [viewerMethod]);

    // Get container styles
    const getContainerStyle = (): React.CSSProperties => {
        return {
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        };
    };

    // Get viewer styles with transforms
    const getViewerStyle = (): React.CSSProperties => {
        return {
            width: '100%',
            height: '100%',
            border: 'none',
            transform: `scale(${currentScale}) rotate(${currentRotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease',
        };
    };

    // Render PDF viewer based on current method
    const renderPdfViewer = () => {
        const pdfUrl = createPdfUrl();
        const style = getViewerStyle();

        switch (viewerMethod) {
            case 'embed':
                return (
                    <embed
                        ref={embedRef}
                        src={pdfUrl}
                        type="application/pdf"
                        style={style}
                        onLoad={handlePdfLoad}
                        onError={handlePdfError}
                        title="PDF Document"
                    />
                );
            
            case 'object':
                return (
                    <object
                        ref={objectRef}
                        data={pdfUrl}
                        type="application/pdf"
                        style={style}
                        onLoad={handlePdfLoad}
                        onError={handlePdfError}
                        title="PDF Document"
                    >
                        <p>
                            Your browser doesn't support embedded PDFs. 
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                Click here to download the PDF
                            </a>
                        </p>
                    </object>
                );
            
            case 'iframe':
            default:
                return (
                    <iframe
                        src={pdfUrl}
                        style={style}
                        onLoad={handlePdfLoad}
                        onError={handlePdfError}
                        title="PDF Document"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
                        allow="fullscreen"
                    />
                );
        }
    };

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
            <div className={`flex flex-col items-center justify-center ${className}`}>
                <div className="text-red-500 text-center mb-4">
                    <div className="mb-2">{error}</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Open PDF in New Tab
                    </a>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                        Refresh Page
                    </button>
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
            {renderPdfViewer()}
        </div>
    );
};

export default PdfViewer;
