import React, { useRef, useEffect, useState } from 'react';

interface PagePreviewProps {
    pageUrl: string;
    title?: string;
    className?: string;
}

export default function PagePreview({ pageUrl, title = "Page Preview", className = "" }: PagePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true); // Reset loading state when component mounts/remounts
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => {
            setIsLoading(false);
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    // Inject CSS to disable navigation links
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                        /* Disable navigation links in header */
                        header a, nav a, .navigation a {
                            pointer-events: none !important;
                            cursor: default !important;
                        }
                        
                        /* Allow scrolling but disable navigation */
                        body {
                            overflow-y: auto !important;
                        }
                        
                        /* Specifically target PUP header navigation */
                        .header-nav a, .nav-link {
                            pointer-events: none !important;
                            cursor: default !important;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                }
            } catch {
                // Cross-origin restrictions - fallback to overlay approach
                console.log('Cross-origin restrictions apply');
            }
        };

        iframe.addEventListener('load', handleLoad);
        return () => iframe.removeEventListener('load', handleLoad);
    }, []);

    return (
        <div className={`w-full h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col ${className}`}>
            {/* Preview Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
            </div>
            
            {/* Preview Content */}
            <div className="relative flex-1 min-h-0">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-8 h-8 border-4 border-[#7F0404] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">Refreshing preview...</span>
                        </div>
                    </div>
                )}
                <iframe
                    ref={iframeRef}
                    src={pageUrl}
                    className="w-full h-full border-0"
                    style={{ 
                        transform: 'scale(0.8)',
                        transformOrigin: 'top left',
                        width: '125%',
                        height: '125%'
                    }}
                    title={title}
                    sandbox="allow-same-origin allow-scripts"
                    onLoad={() => setIsLoading(false)}
                />
                
                {/* Fallback overlay for navigation area if CSS injection fails */}
                <div 
                    className="absolute bg-transparent pointer-events-auto z-10"
                    style={{ 
                        top: '0',
                        left: '0',
                        right: '0',
                        height: '64px', // Height of navigation bar
                        transform: 'scale(0.8)',
                        transformOrigin: 'top left',
                        width: '125%'
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => e.preventDefault()}
                ></div>
            </div>
        </div>
    );
}
