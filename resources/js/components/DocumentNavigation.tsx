import React, { Fragment, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export interface DocumentItem {
    id: number;
    filename: string;
    url: string;
    uploaded_at: string;
}

interface DocumentNavigationProps {
    documents: DocumentItem[];
    currentIndex: number;
    onChangeIndex: (idx: number) => void;
    onDownload: () => void;
    onPrint: () => void;
    onRotate: (dir: 'left' | 'right') => void;
    onFitMode: () => void;
    onZoom: (dir: 'in' | 'out') => void;
    onInfo: () => void;
    onGrid: () => void;
    onFullscreen: () => void;
    fitMode: 'width' | 'page';
    rotate: number;
    zoom: number;
    isFullscreen: boolean;
    infoOpen: boolean;
    setInfoOpen: (open: boolean) => void;
    gridOpen: boolean;
    setGridOpen: (open: boolean) => void;
    search: string;
    setSearch: (s: string) => void;
    onSearch: (e: React.FormEvent) => void;
}

export const DocumentNavigation: React.FC<DocumentNavigationProps> = ({
    documents,
    currentIndex,
    onChangeIndex,
    onDownload,
    onPrint,
    onRotate,
    onFitMode,
    onZoom,
    onInfo,
    onGrid,
    onFullscreen,
    fitMode,
    rotate,
    zoom,
    isFullscreen,
    infoOpen,
    setInfoOpen,
    gridOpen,
    setGridOpen,
    search,
    setSearch,
    onSearch,
}) => {
    const currentDoc = documents[currentIndex] || null;
    const pageInputRef = useRef<HTMLInputElement>(null);

    // For page input
    const [pageInput, setPageInput] = React.useState(currentIndex + 1);
    useEffect(() => {
        setPageInput(currentIndex + 1);
    }, [currentIndex, documents]);

    // Navigation helpers
    const goTo = (idx: number) => {
        if (documents.length === 0) return;
        onChangeIndex(Math.max(0, Math.min(idx, documents.length - 1)));
    };
    const goFirst = () => goTo(0);
    const goLast = () => goTo(documents.length - 1);
    const goPrev = () => goTo(currentIndex - 1);
    const goNext = () => goTo(currentIndex + 1);

    return (
        <>
            <div
                className="w-full flex items-center gap-2 bg-[#7F0404] rounded-t-lg shadow px-4 py-2"
                style={{
                    minHeight: 48,
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                }}
            >
                {/* Jump to First - Double left arrow */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="First Document" onClick={goFirst} disabled={currentIndex === 0}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
                {/* Previous - Single left arrow */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Previous" onClick={goPrev} disabled={currentIndex === 0}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {/* Page Number */}
                <input
                    type="number"
                    min={1}
                    max={documents.length || 1}
                    value={pageInput}
                    ref={pageInputRef}
                    onChange={e => setPageInput(Number(e.target.value))}
                    onBlur={() => {
                        let val = Math.max(1, Math.min(documents.length, pageInput));
                        goTo(val - 1);
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            let val = Math.max(1, Math.min(documents.length, pageInput));
                            goTo(val - 1);
                        }
                    }}
                    className="w-12 text-center rounded bg-white text-[#7F0404] font-bold mx-1 border border-gray-200 shadow-sm"
                    style={{ height: 32, fontSize: 15 }}
                    disabled={documents.length === 0}
                />
                <span className="text-sm" style={{ color: '#F8F8F8' }}>{`/ ${documents.length || 1}`}</span>
                {/* Next - Single right arrow */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Next" onClick={goNext} disabled={currentIndex >= documents.length - 1}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                {/* Jump to Last - Double right arrow */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Last Document" onClick={goLast} disabled={currentIndex === documents.length - 1}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
                {/* Download - Download arrow */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Download" onClick={onDownload} disabled={!currentDoc}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>
                {/* Print - Printer icon */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Print" onClick={onPrint} disabled={!currentDoc}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                </button>
                {/* Rotate Left - Refresh counter-clockwise */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Rotate Left" onClick={() => onRotate('left')} disabled={!currentDoc}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                {/* Rotate Right - Refresh clockwise */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Rotate Right" onClick={() => onRotate('right')} disabled={!currentDoc}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                    </svg>
                </button>
                {/* Fit to Width/Page - Arrows expand/contract */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title={fitMode === 'width' ? 'Fit to Page' : 'Fit to Width'}
                    onClick={onFitMode} disabled={!currentDoc}>
                    {fitMode === 'width' ? (
                        // Fit to Page - Arrows pointing inward
                        <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                        </svg>
                    ) : (
                        // Fit to Width - Arrows pointing outward horizontally
                        <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8l-4 4m0 0l4 4m-4-4h18" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H3" />
                        </svg>
                    )}
                </button>
                {/* Info - Information circle */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Document Info" onClick={onInfo} disabled={!currentDoc}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
                {/* Zoom Out - Magnifying glass with minus */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Zoom Out" onClick={() => onZoom('out')} disabled={zoom <= 0.5}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M8 11h6" />
                    </svg>
                </button>
                {/* Zoom In - Magnifying glass with plus */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Zoom In" onClick={() => onZoom('in')} disabled={zoom >= 2}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 8v6m-3-3h6" />
                    </svg>
                </button>
                {/* Grid - Grid layout icon */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Grid View" onClick={onGrid} disabled={documents.length === 0}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>
                {/* Fullscreen - Expand arrows */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition"
                    title="Fullscreen" onClick={onFullscreen}>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
                {/* Volume - Speaker icon (disabled) */}
                <button className="hover:bg-[#C46B02]/20 p-2 rounded transition opacity-50" title="Audio (not available)" disabled>
                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 10H4a2 2 0 00-2 2v4a2 2 0 002 2h2l4 4V6l-4 4z" />
                    </svg>
                </button>
                {/* Spacer */}
                <div className="flex-1" />
                {/* Search */}
                <form className="flex items-center" onSubmit={onSearch}>
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="rounded px-3 py-1 text-sm bg-white text-[#7F0404] placeholder-[#C46B02] border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
                        style={{ width: 180, height: 32 }}
                    />
                    <button type="submit" className="ml-2 hover:bg-[#FFD600]/20 p-2 rounded transition" title="Search">
                        <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
};
