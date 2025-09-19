import React, { useState, useEffect, useRef } from 'react';
import { PreloadProgress } from '@/utils/resourcePreloader';

interface LoadingScreenProps {
    isVisible: boolean;
    progress: PreloadProgress;
    onComplete?: () => void;
    title?: string;
    subtitle?: string;
    minimumDisplayTime?: number; // Minimum time to show loading screen (prevents flashing)
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    isVisible,
    progress,
    onComplete,
    title = "Loading PUP Calauan",
    subtitle = "Preparing your experience...",
    minimumDisplayTime = 500 // 500ms minimum
}) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [shouldHide, setShouldHide] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isVisible) {
            startTimeRef.current = Date.now();
            setShouldHide(false);
            setIsAnimatingOut(false);
        }
    }, [isVisible]);

    useEffect(() => {
        if (progress.isComplete && isVisible && !isAnimatingOut) {
            const elapsed = Date.now() - startTimeRef.current;
            const remainingTime = Math.max(0, minimumDisplayTime - elapsed);

            timeoutRef.current = setTimeout(() => {
                setIsAnimatingOut(true);
                
                // After animation completes, hide completely
                setTimeout(() => {
                    setShouldHide(true);
                    onComplete?.();
                }, 800); // Match animation duration
            }, remainingTime);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [progress.isComplete, isVisible, isAnimatingOut, minimumDisplayTime, onComplete]);

    if (!isVisible || shouldHide) {
        return null;
    }

    return (
        <div 
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-all duration-800 ${
                isAnimatingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{
                background: 'linear-gradient(135deg, #7F0404 0%, #4D1414 50%, #7F0404 100%)',
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-radial from-white/5 to-transparent rounded-full blur-2xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
                {/* Logo/Icon Area */}
                <div className="mb-8 relative">
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                        {/* Animated University Seal Placeholder */}
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                        <div className="absolute inset-2 rounded-full bg-white/30 animate-ping animation-delay-300"></div>
                        <div className="absolute inset-4 rounded-full bg-white/40 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">PUP</span>
                        </div>
                    </div>
                    
                    {/* Loading Spinner */}
                    <div className="absolute -top-2 -right-2 w-8 h-8">
                        <div className="w-full h-full border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                </div>

                {/* Title and Subtitle */}
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 animate-fade-in-up">
                    {title}
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mb-8 animate-fade-in-up animation-delay-200">
                    {subtitle}
                </p>

                {/* Progress Section */}
                <div className="space-y-4 animate-fade-in-up animation-delay-400">
                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-all duration-500 ease-out shadow-lg"
                            style={{ 
                                width: `${Math.max(5, progress.percentage)}%`,
                                boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                            }}
                        ></div>
                    </div>

                    {/* Progress Text */}
                    <div className="flex justify-between items-center text-sm text-white/70">
                        <span>
                            {progress.loaded} / {progress.total} assets
                        </span>
                        <span className="font-semibold text-white">
                            {progress.percentage}%
                        </span>
                    </div>

                    {/* Current Resource */}
                    {progress.currentResource && !progress.isComplete && (
                        <div className="text-xs text-white/60 truncate max-w-xs mx-auto">
                            Loading: {progress.currentResource.split('/').pop()}
                        </div>
                    )}

                    {/* Completion Message */}
                    {progress.isComplete && (
                        <div className="text-sm text-white font-medium animate-fade-in-up">
                            ✓ Ready to display
                        </div>
                    )}
                </div>

                {/* Loading Tips (Optional) */}
                <div className="mt-8 text-xs text-white/50 animate-fade-in-up animation-delay-600">
                    <p>Optimizing images and resources for the best experience</p>
                </div>
            </div>

            {/* Bottom Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
    );
};

export default LoadingScreen;