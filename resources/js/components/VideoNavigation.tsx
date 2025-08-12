import React, { useState, useRef, useEffect } from 'react';

export interface VideoItem {
    id: number;
    filename: string;
    url: string;
    uploaded_at: string;
}

interface VideoNavigationProps {
    currentVideo: VideoItem | null;
    onInfo: () => void;
    onDownload?: () => void;
    onPictureInPicture?: () => void;
}

export const VideoNavigation: React.FC<VideoNavigationProps> = ({
    currentVideo,
    onInfo,
    onDownload,
    onPictureInPicture,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [lastVolume, setLastVolume] = useState(1);
    const speedMenuRef = useRef<HTMLDivElement>(null);
    const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [volume, isMuted, playbackSpeed]);

    useEffect(() => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
        }
    }, [currentVideo]);

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    };

    const handleRewind = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
    };

    const handleFastForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        if (newVolume > 0) setLastVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleMuteToggle = () => {
        if (isMuted || volume === 0) {
            const restoreVolume = lastVolume > 0 ? lastVolume : 0.5;
            setVolume(restoreVolume);
            setIsMuted(false);
        } else {
            setLastVolume(volume);
            setVolume(0);
            setIsMuted(true);
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        setShowSpeedMenu(false);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (duration > 0 && videoRef.current) {
            const newTime = (parseFloat(e.target.value) / 100) * duration;
            videoRef.current.currentTime = newTime;
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleDownload = () => {
        if (onDownload && currentVideo) {
            onDownload();
        } else if (currentVideo) {
            const link = document.createElement('a');
            link.href = currentVideo.url;
            link.download = currentVideo.filename;
            link.click();
        }
    };

    const handlePictureInPicture = () => {
        if (videoRef.current && (videoRef.current as any).requestPictureInPicture) {
            (videoRef.current as any).requestPictureInPicture();
        } else if (onPictureInPicture) {
            onPictureInPicture();
        }
    };

    useEffect(() => {
        if (!videoRef.current) return;
        const v = videoRef.current;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        return () => {
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
        };
    }, [currentVideo]);
    // Close speed menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
                setShowSpeedMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div>
            <div className="w-full flex flex-col">
                {/* Video Element */}
                <div className="w-full bg-black rounded-t-lg overflow-hidden" style={{ minHeight: 200, maxHeight: 400 }}>
                    {currentVideo ? (
                        <video
                            ref={videoRef}
                            src={currentVideo.url}
                            controls={false}
                            className="w-full h-full bg-black"
                            style={{ objectFit: 'contain', minHeight: 200, maxHeight: 400 }}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                        />
                    ) : (
                        <div className="text-gray-400 text-center py-10">No video selected.</div>
                    )}
                </div>
                <div
                    className="w-full flex items-center gap-2 bg-[#7F0404] shadow px-3 py-2 rounded-b-lg"
                    style={{
                        minHeight: 48,
                        borderBottomLeftRadius: 14,
                        borderBottomRightRadius: 14,
                    }}
                >
                    {/* Left Controls */}
                    <div className="flex items-center gap-2">
                        {/* Rewind 10s */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title="Rewind 10s" 
                            onClick={handleRewind} 
                            disabled={!currentVideo}
                        >
                            <svg className="w-5 h-5" fill="#F8F8F8" viewBox="0 0 24 24">
                                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                <text x="12" y="16" fontSize="6" fill="#7F0404" textAnchor="middle" fontWeight="bold">10</text>
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title={isPlaying ? "Pause" : "Play"} 
                            onClick={handlePlayPause} 
                            disabled={!currentVideo}
                        >
                            {isPlaying ? (
                                <svg className="w-6 h-6" fill="#F8F8F8" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="#F8F8F8" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>

                        {/* Fast Forward 10s */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title="Fast Forward 10s" 
                            onClick={handleFastForward} 
                            disabled={!currentVideo}
                        >
                            <svg className="w-5 h-5" fill="#F8F8F8" viewBox="0 0 24 24">
                                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                                <text x="12" y="16" fontSize="6" fill="#7F0404" textAnchor="middle" fontWeight="bold">10</text>
                            </svg>
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                            {/* Volume Icon/Mute Toggle */}
                            <button 
                                className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                                title={isMuted || volume === 0 ? "Unmute" : "Mute"} 
                                onClick={handleMuteToggle} 
                                disabled={!currentVideo}
                            >
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : volume < 0.5 ? (
                                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M6 10H4a2 2 0 00-2 2v4a2 2 0 002 2h2l4 4V6l-4 4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 10H4a2 2 0 00-2 2v4a2 2 0 002 2h2l4 4V6l-4 4z" />
                                    </svg>
                                )}
                            </button>

                            {/* Volume Slider */}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #F8F8F8 0%, #F8F8F8 ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                                }}
                                disabled={!currentVideo}
                            />
                        </div>

                        {/* Speed Control */}
                        <div className="relative" ref={speedMenuRef}>
                            <button 
                                className="hover:bg-[#C46B02]/20 p-1 rounded transition flex items-center gap-1"
                                title="Playback Speed" 
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
                                disabled={!currentVideo}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12,6 12,12 16,14"/>
                                </svg>
                                <span className="text-xs text-white font-medium">{playbackSpeed}x</span>
                            </button>

                            {/* Speed Menu */}
                            {showSpeedMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg border z-50 min-w-[80px]">
                                    {speedOptions.map((speed) => (
                                        <button
                                            key={speed}
                                            className={`block w-full px-3 py-1 text-left text-sm hover:bg-gray-100 ${
                                                speed === playbackSpeed ? 'bg-[#7F0404] text-white' : 'text-gray-700'
                                            }`}
                                            onClick={() => handleSpeedChange(speed)}
                                        >
                                            {speed}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center - Video Progress */}
                    <div className="flex-1 flex items-center gap-2 mx-4">
                        <span className="text-xs text-white font-mono">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progressPercentage}
                            onChange={handleProgressChange}
                            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer progress-slider"
                            style={{
                                background: `linear-gradient(to right, #FFD600 0%, #FFD600 ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`
                            }}
                            disabled={!currentVideo || duration === 0}
                        />
                        <span className="text-xs text-white font-mono">{formatTime(duration)}</span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                        {/* Fullscreen */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title="Fullscreen" 
                            onClick={handleFullscreen} 
                            disabled={!currentVideo}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                        {/* Download */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title="Download" 
                            onClick={handleDownload} 
                            disabled={!currentVideo}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                        {/* Picture in Picture */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title="Picture in Picture" 
                            onClick={handlePictureInPicture} 
                            disabled={!currentVideo}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h11a1 1 0 011 1v11a1 1 0 01-1 1h-2M7 4H4a1 1 0 00-1 1v11a1 1 0 001 1h11a1 1 0 001-1v-2M7 4v13h10V4H7z" />
                                <rect x="14" y="14" width="6" height="4" rx="1" stroke="#F8F8F8" strokeWidth={2} fill="none"/>
                            </svg>
                        </button>

                        {/* Info */}
                        <button 
                            className="hover:bg-[#C46B02]/20 p-1 rounded transition"
                            title="Video Info" 
                            onClick={onInfo} 
                            disabled={!currentVideo}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="#F8F8F8" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #F8F8F8;
                    cursor: pointer;
                    border: 2px solid #7F0404;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #F8F8F8;
                    cursor: pointer;
                    border: 2px solid #7F0404;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .progress-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #FFD600;
                    cursor: pointer;
                    border: 2px solid #7F0404;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }
                .progress-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #FFD600;
                    cursor: pointer;
                    border: 2px solid #7F0404;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }
            `}</style>
        </div>
    );
}
