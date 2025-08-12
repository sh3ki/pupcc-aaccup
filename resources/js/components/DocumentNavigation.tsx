import React, { useEffect, useRef } from 'react';
import { VideoNavigation, VideoItem } from './VideoNavigation';

export interface DocumentItem {
    id: number;
    filename: string;
    url: string;
    uploaded_at: string;
}

export interface DocumentNavigationProps {
    // Document info
    currentDocument: DocumentItem | null;
    
    // PDF page navigation
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    
    // Document actions
    onDownload: () => void;
    onPrint: () => void;
    onRotate: (dir: 'left' | 'right') => void;
    onFitMode: () => void;
    onZoom: (dir: 'in' | 'out') => void;
    onInfo: () => void;
    onGrid: () => void;
    onFullscreen: () => void;
    fitMode: 'width' | 'height' | null;
    rotate: number;
    zoom: number;
    isFullscreen: boolean;
    infoOpen: boolean;
    setInfoOpen: (open: boolean) => void;
    gridOpen: boolean;
    setGridOpen: (open: boolean) => void;
    
    // Video-specific props (optional) - if these are provided, render VideoNavigation
    onRewind?: () => void;
    onPlayPause?: () => void;
    onFastForward?: () => void;
    onVolumeChange?: (volume: number) => void;
    onMuteToggle?: () => void;
    onSpeedChange?: (speed: number) => void;
    onPictureInPicture?: () => void;
    onTimeUpdate?: (time: number) => void;
    isPlaying?: boolean;
    volume?: number;
    isMuted?: boolean;
    playbackSpeed?: number;
    currentTime?: number;
    duration?: number;
    
    // Force video mode flag (added for explicit control)
    forceVideoMode?: boolean;
}

export const DocumentNavigation: React.FC<DocumentNavigationProps> = (props) => {
    const {
        currentDocument,
        currentPage,
        totalPages,
        onPageChange,
        onDownload,
        onPrint,
        onRotate,
        onFitMode,
        onZoom,
        onInfo,
        onFullscreen,
        fitMode,
        zoom,
        // Video props
        onRewind,
        onPlayPause,
        onFastForward,
        onVolumeChange,
        onMuteToggle,
        onSpeedChange,
        onPictureInPicture,
        onTimeUpdate,
        isPlaying = false,
        volume = 1,
        isMuted = false,
        playbackSpeed = 1,
        currentTime = 0,
        duration = 0,
        forceVideoMode = false,
    } = props;

    const pageInputRef = useRef<HTMLInputElement>(null);
    
    // For page input
    const [pageInput, setPageInput] = React.useState(currentPage);
    useEffect(() => {
        setPageInput(currentPage);
    }, [currentPage]);

    // Check if we should render video navigation
    // Either forced or all video props are provided
    const shouldRenderVideoNavigation = forceVideoMode || (
        onRewind && onPlayPause && onFastForward && 
        onVolumeChange && onMuteToggle && onSpeedChange
    );

    // If video navigation should be rendered, render VideoNavigation
    if (shouldRenderVideoNavigation) {
        return (
            <VideoNavigation
                currentVideo={currentDocument as VideoItem}
                onRewind={onRewind!}
                onPlayPause={onPlayPause!}
                onFastForward={onFastForward!}
                onVolumeChange={onVolumeChange!}
                onMuteToggle={onMuteToggle!}
                onSpeedChange={onSpeedChange!}
                onInfo={onInfo}
                onFullscreen={onFullscreen}
                onDownload={onDownload}
                onPictureInPicture={onPictureInPicture}
                onTimeUpdate={onTimeUpdate}
                isPlaying={isPlaying}
                volume={volume}
                isMuted={isMuted}
                playbackSpeed={playbackSpeed}
                currentTime={currentTime}
                duration={duration}
            />
        );
    }

    // Page navigation helpers
    const goToPage = (page: number) => {
        if (totalPages === 0) return;
        onPageChange(Math.max(1, Math.min(page, totalPages)));
    };
    const goFirstPage = () => goToPage(1);
    const goLastPage = () => goToPage(totalPages);
    const goPrevPage = () => goToPage(currentPage - 1);
    const goNextPage = () => goToPage(currentPage + 1);

    return (
        <>
            <div
                className="w-full flex items-center gap-1 bg-[#7F0404] rounded-t-lg shadow px-3 py-1"
                style={{
                    minHeight: 38, // Reduced from 44 to 38
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                }}
            >
                {/* Jump to First - Double left arrow */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="First Page" onClick={goFirstPage} disabled={currentPage === 1}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
                {/* Previous - Single left arrow */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Previous Page" onClick={goPrevPage} disabled={currentPage === 1}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {/* Page Number */}
                <input
                    type="number"
                    min={1}
                    max={totalPages || 1}
                    value={pageInput}
                    ref={pageInputRef}
                    onChange={e => setPageInput(Number(e.target.value))}
                    onBlur={() => {
                        const val = Math.max(1, Math.min(totalPages, pageInput));
                        goToPage(val);
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            const val = Math.max(1, Math.min(totalPages, pageInput));
                            goToPage(val);
                        }
                    }}
                    className="w-6 text-center rounded bg-white text-[#7F0404] font-bold"
                    style={{ height: 17, fontSize: 11 }} // Reduced from 28 to 24
                    disabled={totalPages === 0}
                />
                <span className="text-xs" style={{ color: '#F8F8F8' }}>{`/ ${totalPages || 1}`}</span>
                
                <style>{`
                  input[type=number]::-webkit-outer-spin-button,
                  input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                  input[type=number] {
                    -moz-appearance: textfield;
                  }
                `}</style>
                {/* Next - Single right arrow */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Next Page" onClick={goNextPage} disabled={currentPage >= totalPages}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {/* Jump to Last - Double right arrow */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Last Page" onClick={goLastPage} disabled={currentPage === totalPages}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
                {/* Download - Download arrow */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Download" onClick={onDownload} disabled={!currentDocument}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>
                {/* Print - Printer icon */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Print" onClick={onPrint} disabled={!currentDocument}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                </button>
                {/* Rotate Left - Refresh counter-clockwise */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Rotate Left" onClick={() => onRotate('left')} disabled={!currentDocument}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                {/* Rotate Right - Refresh clockwise */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Rotate Right" onClick={() => onRotate('right')} disabled={!currentDocument}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                    </svg>
                </button>
                {/* Fit to Width/Height - Arrows expand/contract */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title={fitMode === 'width' ? 'Fit to Height' : 'Fit to Width'}
                    onClick={onFitMode} disabled={!currentDocument}>
                    {fitMode === 'width' ? (
                        // Currently fit to width - show arrows for fit to height (vertical)
                        <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                        </svg>
                    ) : (
                        // Currently fit to height - show arrows for fit to width (horizontal)
                        <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8l-4 4m0 0l4 4m-4-4h18" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H3" />
                        </svg>
                    )}
                </button>
                {/* Zoom Out - Magnifying glass with minus */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Zoom Out" onClick={() => onZoom('out')} disabled={zoom <= 0.5}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M8 11h6" />
                    </svg>
                </button>
                
                {/* Zoom Percentage Indicator */}
                <span className="text-xs font-medium py-0.5 bg-white/20 rounded text-white" 
                      style={{ width: 40, textAlign: 'center' }}>
                    {Math.round(zoom * 100)}%
                </span>
                
                {/* Zoom In - Magnifying glass with plus */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Zoom In" onClick={() => onZoom('in')} disabled={zoom >= 1}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6m-3-3h6" />
                    </svg>
                </button>
                {/* Grid - Grid layout icon */}
                {/* <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Grid View" onClick={onGrid} disabled={!currentDocument}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button> */}
                {/* Fullscreen - Expand arrows */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Fullscreen" onClick={onFullscreen}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
                {/* Info - Information circle */}
                <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition"
                    title="Document Info" onClick={onInfo} disabled={!currentDocument}>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                {/* Volume - Speaker icon (disabled) */}
                {/* <button className="hover:bg-[#C46B02]/20 p-0.5 rounded transition opacity-50" title="Audio (not available)" disabled>
                    <svg className="w-4 h-4" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 10H4a2 2 0 00-2 2v4a2 2 0 002 2h2l4 4V6l-4 4z" />
                    </svg>
                </button> */}
                {/* Spacer */}
                <div className="flex-1" />
            </div>
        </>
    );
};
