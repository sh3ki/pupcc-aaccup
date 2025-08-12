import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export interface VideoPlayerRef {
    play(): Promise<void> | void;
    pause(): void;
    getCurrentTime(): number;
    setCurrentTime(time: number): void;
    getDuration(): number;
    getVolume(): number;
    setVolume(volume: number): void;
    mute(): void;
    unmute(): void;
    isMuted(): boolean;
    isPaused(): boolean;
    setPlaybackRate(rate: number): void;
    getPlaybackRate(): number;
    dispose(): void;
    isDisposed(): boolean;
    requestFullscreen(): void;
    requestPictureInPicture(): Promise<unknown>;
}

interface VideoViewerProps {
    url: string;
    className?: string;
    onReady?: (player: VideoPlayerRef) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onVolumeChange?: (volume: number) => void;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onRateChange?: (rate: number) => void;
}

export const VideoViewer = forwardRef<VideoPlayerRef, VideoViewerProps>((props, ref) => {
    const {
        url,
        className = '',
        onReady,
        onPlay,
        onPause,
        onVolumeChange,
        onTimeUpdate,
        onRateChange
    } = props;
    
    const videoRef = useRef<HTMLVideoElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const playerInitialized = useRef<boolean>(false);

    // Helper function to determine video type
    const getVideoType = (url: string): string => {
        const extension = url.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'mp4':
                return 'video/mp4';
            case 'webm':
                return 'video/webm';
            case 'ogg':
                return 'video/ogg';
            default:
                return 'video/mp4';
        }
    };

    useImperativeHandle(ref, () => ({
        play: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.play();
            }
        },
        pause: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.pause();
            }
        },
        getCurrentTime: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.currentTime() || 0;
            }
            return 0;
        },
        setCurrentTime: (time: number) => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.currentTime(time);
            }
        },
        getDuration: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.duration() || 0;
            }
            return 0;
        },
        getVolume: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.volume() || 0;
            }
            return 0;
        },
        setVolume: (volume: number) => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.volume(volume);
                // Also update muted state based on volume
                if (volume === 0) {
                    playerRef.current.muted(true);
                } else {
                    playerRef.current.muted(false);
                }
            }
        },
        mute: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.muted(true);
            }
        },
        unmute: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.muted(false);
            }
        },
        isMuted: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.muted() || false;
            }
            return false;
        },
        isPaused: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.paused() || true;
            }
            return true;
        },
        setPlaybackRate: (rate: number) => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.playbackRate(rate);
            }
        },
        getPlaybackRate: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                return playerRef.current.playbackRate() || 1;
            }
            return 1;
        },
        dispose: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        },
        isDisposed: () => !playerRef.current || playerRef.current.isDisposed(),
        requestFullscreen: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.requestFullscreen();
            }
        },
        requestPictureInPicture: () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                const videoEl = playerRef.current.el()?.querySelector('video') as HTMLVideoElement;
                if (videoEl && 'requestPictureInPicture' in videoEl) {
                    return (videoEl as HTMLVideoElement & { requestPictureInPicture(): Promise<PictureInPictureWindow> }).requestPictureInPicture();
                }
            }
            return Promise.reject('Picture-in-picture not supported');
        }
    }));

    useEffect(() => {
        // Clean up function for both timeout and player
        let cleanupTimeout: NodeJS.Timeout;
        
        // Make sure we clean up any existing player first 
        if (playerRef.current && !playerRef.current.isDisposed()) {
            console.log("Disposing existing player");
            playerRef.current.dispose();
            playerRef.current = null;
            playerInitialized.current = false;
        }
        
        // Give DOM time to fully render before initializing player
        cleanupTimeout = setTimeout(() => {
            // Make sure Video.js player is only initialized once
            if (!playerInitialized.current && videoRef.current) {
                const videoElement = videoRef.current;

                // Ensure video element has proper attributes
                videoElement.crossOrigin = 'anonymous';
                videoElement.preload = 'auto';
                
                try {
                    // Log initialization to debug
                    console.log('Initializing video.js player');
                    
                    const player = videojs(videoElement, {
                        controls: false, // We'll use our custom controls
                        responsive: true,
                        fluid: true,
                        preload: 'metadata', // Changed to metadata for faster initial load
                        autoplay: false,
                        muted: false,
                        playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
                        sources: [{
                            src: url,
                            type: getVideoType(url)
                        }],
                        width: '100%',
                        height: '100%'
                    });

                    // Wait for player to be ready before setting up events
                    player.ready(function() {
                        console.log('Video player is ready');
                        playerInitialized.current = true;
                        
                        // Set up event listeners
                        player.on('play', () => {
                            console.log('Video started playing');
                            onPlay?.();
                        });
                        
                        player.on('pause', () => {
                            console.log('Video paused');
                            onPause?.();
                        });
                        
                        player.on('volumechange', () => {
                            const volume = player.volume() || 0;
                            onVolumeChange?.(volume);
                        });
                        
                        player.on('timeupdate', () => {
                            const currentTime = player.currentTime() || 0;
                            const duration = player.duration() || 0;
                            onTimeUpdate?.(currentTime, duration);
                        });

                        player.on('ratechange', () => {
                            const rate = player.playbackRate() || 1;
                            onRateChange?.(rate);
                        });

                        player.on('loadstart', () => {
                            console.log('Video load started');
                        });

                        player.on('loadedmetadata', () => {
                            console.log('Video metadata loaded');
                        });

                        player.on('canplay', () => {
                            console.log('Video can start playing');
                        });

                        player.on('canplaythrough', () => {
                            console.log('Video can play through');
                        });

                        player.on('error', (e: Event) => {
                            console.error('Video player error:', e);
                            const error = player.error();
                            if (error) {
                                console.error('Player error details:', error);
                            }
                        });
                        
                        // Force load metadata immediately
                        player.load();

                        // Store the player reference
                        playerRef.current = player;
                        
                        // Call onReady callback if provided
                        if (onReady) {
                            onReady({
                                play: () => {
                                    console.log("Play requested via ref");
                                    if (player && !player.isDisposed()) {
                                        return player.play();
                                    }
                                    return Promise.reject('Player not ready');
                                },
                                pause: () => {
                                    if (player && !player.isDisposed()) {
                                        player.pause();
                                    }
                                },
                                isPaused: () => {
                                    return player && !player.isDisposed() ? player.paused() : true;
                                },
                                getCurrentTime: () => player && !player.isDisposed() ? player.currentTime() || 0 : 0,
                                setCurrentTime: (time: number) => {
                                    if (player && !player.isDisposed()) {
                                        player.currentTime(time);
                                    }
                                },
                                getDuration: () => player && !player.isDisposed() ? player.duration() || 0 : 0,
                                getVolume: () => player && !player.isDisposed() ? player.volume() || 0 : 0,
                                setVolume: (volume: number) => {
                                    if (player && !player.isDisposed()) {
                                        player.volume(volume);
                                        if (volume === 0) {
                                            player.muted(true);
                                        } else {
                                            player.muted(false);
                                        }
                                    }
                                },
                                mute: () => {
                                    if (player && !player.isDisposed()) {
                                        player.muted(true);
                                    }
                                },
                                unmute: () => {
                                    if (player && !player.isDisposed()) {
                                        player.muted(false);
                                    }
                                },
                                isMuted: () => player && !player.isDisposed() ? !!player.muted() : false,
                                setPlaybackRate: (rate: number) => {
                                    if (player && !player.isDisposed()) {
                                        player.playbackRate(rate);
                                    }
                                },
                                getPlaybackRate: () => player && !player.isDisposed() ? player.playbackRate() || 1 : 1,
                                dispose: () => {
                                    if (player && !player.isDisposed()) {
                                        player.dispose();
                                    }
                                },
                                isDisposed: () => !player || player.isDisposed(),
                                requestFullscreen: () => {
                                    if (player && !player.isDisposed()) {
                                        player.requestFullscreen();
                                    }
                                },
                                requestPictureInPicture: () => {
                                    if (player && !player.isDisposed()) {
                                        const videoEl = player.el().querySelector('video');
                                        if (videoEl && 'requestPictureInPicture' in videoEl) {
                                            return (videoEl as HTMLVideoElement & { requestPictureInPicture(): Promise<PictureInPictureWindow> }).requestPictureInPicture();
                                        }
                                    }
                                    return Promise.reject('Picture-in-picture not supported');
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.error("Error initializing video.js player:", error);
                }
            }
        }, 100); // Small delay to ensure DOM is ready

        // Cleanup function
        return () => {
            clearTimeout(cleanupTimeout);
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [url, onReady, onPlay, onPause, onVolumeChange, onTimeUpdate, onRateChange]);

    // Only render a plain video element, not the video.js player DOM
    return (
        <video
            ref={videoRef}
            className={className}
            playsInline
            style={{ width: '100%', height: '100%' }}
        />
    );
});

VideoViewer.displayName = 'VideoViewer';

export default VideoViewer;
