import { useState, useRef, useEffect, memo } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    priority?: boolean; // For above-the-fold images
    lazy?: boolean; // For below-the-fold images
    placeholder?: string; // Base64 or low-quality placeholder
    sizes?: string; // Responsive sizes
    onLoad?: () => void;
    onError?: () => void;
    webpSrc?: string; // WebP version if available
    avifSrc?: string; // AVIF version if available (future-proofing)
}

const OptimizedImage = memo(({
    src,
    alt,
    className = '',
    style,
    priority = false,
    lazy = true,
    placeholder,
    sizes,
    onLoad,
    onError,
    webpSrc,
    avifSrc
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!lazy || priority);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageSrc, setImageSrc] = useState(priority ? src : placeholder || '');

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || priority || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before image comes into view
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [lazy, priority, isInView]);

    // Load image when in view
    useEffect(() => {
        if (!isInView && !priority) return;

        const img = new Image();
        
        // Handle load
        img.onload = () => {
            setIsLoaded(true);
            setImageSrc(src);
            onLoad?.();
        };

        // Handle error
        img.onerror = () => {
            setError(true);
            onError?.();
        };

        // Set source with format detection
        img.src = src;

        // Preload for priority images
        if (priority) {
            img.decoding = 'async';
            img.loading = 'eager';
        }

    }, [isInView, priority, src, onLoad, onError]);

    // Create optimized sources for modern formats
    const renderPicture = () => {
        if (!isInView && !priority) {
            return (
                <div 
                    ref={imgRef}
                    className={`${className} bg-gray-200 animate-pulse`}
                    style={style}
                />
            );
        }

        return (
            <picture>
                {/* AVIF for maximum compression (future-proofing) */}
                {avifSrc && (
                    <source srcSet={avifSrc} type="image/avif" sizes={sizes} />
                )}
                
                {/* WebP for modern browsers */}
                {webpSrc && (
                    <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
                )}
                
                {/* Fallback image */}
                <img
                    ref={imgRef}
                    src={imageSrc || src}
                    alt={alt}
                    className={`${className} transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={style}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes={sizes}
                    onLoad={() => {
                        setIsLoaded(true);
                        onLoad?.();
                    }}
                    onError={() => {
                        setError(true);
                        onError?.();
                    }}
                />
            </picture>
        );
    };

    return (
        <div className="relative overflow-hidden">
            {/* Placeholder/blur effect */}
            {!isLoaded && placeholder && (
                <img
                    src={placeholder}
                    alt=""
                    className={`${className} absolute inset-0 scale-105 blur-md opacity-50`}
                    style={style}
                    aria-hidden="true"
                />
            )}
            
            {/* Main image */}
            {renderPicture()}
            
            {/* Error fallback */}
            {error && (
                <div 
                    className={`${className} bg-gray-200 flex items-center justify-center text-gray-500`}
                    style={style}
                >
                    <span className="text-sm">Image unavailable</span>
                </div>
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
