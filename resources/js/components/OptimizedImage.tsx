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
    critical?: boolean; // For critical images that must load before page display
    preloadHint?: boolean; // Add resource hints for this image
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
    avifSrc,
    critical = false,
    preloadHint = false
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!lazy || priority || critical);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imageSrc, setImageSrc] = useState(priority || critical ? src : placeholder || '');
    const [hasAddedPreloadHint, setHasAddedPreloadHint] = useState(false);

    // Add preload hint to document head for critical/priority images
    useEffect(() => {
        if ((preloadHint || critical || priority) && !hasAddedPreloadHint && src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            link.crossOrigin = 'anonymous';
            
            if (critical) {
                link.fetchPriority = 'high';
            }

            document.head.appendChild(link);
            setHasAddedPreloadHint(true);

            return () => {
                // Clean up the preload link when component unmounts
                if (document.head.contains(link)) {
                    document.head.removeChild(link);
                }
            };
        }
    }, [src, preloadHint, critical, priority, hasAddedPreloadHint]);

    // Enhanced Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || priority || critical || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                // More aggressive loading for better UX
                rootMargin: critical ? '200px' : priority ? '100px' : '50px',
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [lazy, priority, critical, isInView]);

    // Enhanced image loading for critical/priority images
    useEffect(() => {
        if (!isInView && !priority && !critical) return;

        const img = new Image();
        
        // Enhanced loading attributes for critical images
        if (critical) {
            img.decoding = 'sync'; // Synchronous decoding for critical images
            img.loading = 'eager';
            img.fetchPriority = 'high';
        } else if (priority) {
            img.decoding = 'async';
            img.loading = 'eager';
            img.fetchPriority = 'high';
        } else {
            img.decoding = 'async';
            img.loading = 'lazy';
        }

        // Handle successful load
        img.onload = () => {
            setIsLoaded(true);
            setImageSrc(src);
            onLoad?.();
        };

        // Handle load error with retry logic for critical images
        img.onerror = () => {
            if (critical) {
                // Retry critical images once
                console.warn(`Retrying critical image: ${src}`);
                setTimeout(() => {
                    const retryImg = new Image();
                    retryImg.onload = () => {
                        setIsLoaded(true);
                        setImageSrc(src);
                        onLoad?.();
                    };
                    retryImg.onerror = () => {
                        setError(true);
                        onError?.();
                    };
                    retryImg.src = src;
                }, 100);
            } else {
                setError(true);
                onError?.();
            }
        };

        // Start loading
        img.src = src;

    }, [isInView, priority, critical, src, onLoad, onError]);

    // Create optimized sources for modern formats
    const renderPicture = () => {
        if (!isInView && !priority && !critical) {
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
                    loading={critical || priority ? 'eager' : 'lazy'}
                    decoding={critical ? 'sync' : 'async'}
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
