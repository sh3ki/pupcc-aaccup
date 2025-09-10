import { useRef, useEffect, useState, useCallback } from 'react';

interface UseOptimizedIntersectionOptions {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
    delay?: number;
    fallbackInView?: boolean;
}

/**
 * Optimized intersection observer hook for better performance
 * Uses a single observer instance and throttling for better performance
 */
export function useOptimizedIntersection({
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
    fallbackInView = false
}: UseOptimizedIntersectionOptions = {}) {
    const [isInView, setIsInView] = useState(fallbackInView);
    const [hasTriggered, setHasTriggered] = useState(false);
    const ref = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const setInView = useCallback((inView: boolean) => {
        if (triggerOnce && hasTriggered && !inView) return;
        
        if (delay > 0) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsInView(inView);
                if (inView) setHasTriggered(true);
            }, delay);
        } else {
            setIsInView(inView);
            if (inView) setHasTriggered(true);
        }
    }, [triggerOnce, hasTriggered, delay]);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            setIsInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [threshold, rootMargin, setInView]);

    return [ref, isInView] as const;
}

/**
 * Enhanced scroll animation hook with direction detection and performance optimizations
 */
export function useScrollAnimation(options: UseOptimizedIntersectionOptions & {
    enableDirectionDetection?: boolean;
} = {}) {
    const { enableDirectionDetection = true, ...intersectionOptions } = options;
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
    const [lastScrollY, setLastScrollY] = useState(0);
    const [ref, isInView] = useOptimizedIntersection(intersectionOptions);

    useEffect(() => {
        if (!enableDirectionDetection) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
                    setLastScrollY(currentScrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, enableDirectionDetection]);

    return {
        ref,
        isVisible: isInView,
        scrollDirection
    };
}

/**
 * Optimized animation classes for better performance
 */
export const getAnimationClasses = (
    isVisible: boolean,
    scrollDirection: 'up' | 'down' = 'down',
    animationType: 'fadeIn' | 'slideUp' | 'slideIn' | 'scaleIn' = 'fadeIn',
    delay: number = 0
) => {
    const baseClasses = 'transition-all duration-700 ease-out will-change-transform';
    const delayClass = delay > 0 ? `delay-${Math.min(delay, 1000)}` : '';

    const animations = {
        fadeIn: {
            visible: 'opacity-100 translate-y-0',
            hidden: 'opacity-0 translate-y-4'
        },
        slideUp: {
            visible: 'opacity-100 translate-y-0',
            hidden: scrollDirection === 'down' 
                ? 'opacity-0 translate-y-8' 
                : 'opacity-0 -translate-y-8'
        },
        slideIn: {
            visible: 'opacity-100 translate-x-0',
            hidden: scrollDirection === 'down'
                ? 'opacity-0 translate-x-8'
                : 'opacity-0 -translate-x-8'
        },
        scaleIn: {
            visible: 'opacity-100 scale-100',
            hidden: 'opacity-0 scale-95'
        }
    };

    const animationClasses = animations[animationType];
    const stateClass = isVisible ? animationClasses.visible : animationClasses.hidden;

    return `${baseClasses} ${stateClass} ${delayClass}`.trim();
};

/**
 * Performance-optimized image loading hook
 */
export function useImagePreload(src: string, priority: boolean = false) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setError(true);
        
        img.src = src;

        // For priority images, set loading attributes
        if (priority) {
            img.decoding = 'async';
        }

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, priority]);

    return { isLoaded, error };
}
