import React, { useState, useEffect } from 'react';

interface PdfPerformanceMonitorProps {
    url: string;
    onMetrics?: (metrics: PdfMetrics) => void;
}

interface PdfMetrics {
    loadTime: number;
    fileSize: number;
    renderTime: number;
    memoryUsage?: number;
    errorDetails?: string;
}

export const PdfPerformanceMonitor: React.FC<PdfPerformanceMonitorProps> = ({ 
    url, 
    onMetrics 
}) => {
    const [metrics, setMetrics] = useState<PdfMetrics | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);

    useEffect(() => {
        const measurePdfPerformance = async () => {
            if (isMonitoring) return;
            
            setIsMonitoring(true);
            let loadEndTime: number;
            let renderStartTime: number;
            let renderEndTime: number;

            try {
                // Measure file size
                const response = await fetch(url, { method: 'HEAD' });
                const fileSize = parseInt(response.headers.get('content-length') || '0');
                
                // Measure load time
                const loadStart = performance.now();
                await fetch(url);
                loadEndTime = performance.now();
                
                // Simulate render time measurement
                renderStartTime = performance.now();
                // This would normally measure actual PDF rendering
                await new Promise(resolve => setTimeout(resolve, 100));
                renderEndTime = performance.now();
                
                // Get memory usage if available
                const memoryInfo = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
                const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize : undefined;
                
                const pdfMetrics: PdfMetrics = {
                    loadTime: loadEndTime - loadStart,
                    fileSize: fileSize,
                    renderTime: renderEndTime - renderStartTime,
                    memoryUsage: memoryUsage
                };
                
                setMetrics(pdfMetrics);
                onMetrics?.(pdfMetrics);
                
            } catch (error) {
                const errorMetrics: PdfMetrics = {
                    loadTime: -1,
                    fileSize: -1,
                    renderTime: -1,
                    errorDetails: (error as Error).message
                };
                
                setMetrics(errorMetrics);
                onMetrics?.(errorMetrics);
            } finally {
                setIsMonitoring(false);
            }
        };

        if (url) {
            measurePdfPerformance();
        }
    }, [url, isMonitoring, onMetrics]);

    const formatSize = (bytes: number) => {
        if (bytes < 0) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const formatTime = (ms: number) => {
        if (ms < 0) return 'Error';
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatMemory = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    if (!metrics && !isMonitoring) return null;

    return (
        <div className="bg-gray-100 border border-gray-300 rounded p-3 text-xs text-gray-600 mb-4">
            <div className="font-semibold mb-2">📊 PDF Performance Metrics</div>
            
            {isMonitoring ? (
                <div className="text-blue-600">⏱️ Measuring performance...</div>
            ) : metrics?.errorDetails ? (
                <div className="text-red-600">❌ Error: {metrics.errorDetails}</div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <span className="font-medium">Load Time:</span>
                        <span className={`ml-1 ${metrics!.loadTime > 2000 ? 'text-red-600' : metrics!.loadTime > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {formatTime(metrics!.loadTime)}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">File Size:</span>
                        <span className="ml-1">{formatSize(metrics!.fileSize)}</span>
                    </div>
                    <div>
                        <span className="font-medium">Render Time:</span>
                        <span className={`ml-1 ${metrics!.renderTime > 1000 ? 'text-red-600' : metrics!.renderTime > 500 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {formatTime(metrics!.renderTime)}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Memory:</span>
                        <span className="ml-1">{formatMemory(metrics!.memoryUsage)}</span>
                    </div>
                </div>
            )}
            
            {metrics && !metrics.errorDetails && (
                <div className="mt-2 text-xs">
                    {metrics.loadTime > 5000 && 
                        <div className="text-red-600">⚠️ Slow loading detected. Consider optimizing PDF size or using CDN.</div>
                    }
                    {metrics.fileSize > 10 * 1024 * 1024 && 
                        <div className="text-yellow-600">💡 Large file size. Consider compression or pagination.</div>
                    }
                </div>
            )}
        </div>
    );
};

export default PdfPerformanceMonitor;
