/**
 * Enhanced resource preloader utility for lightning-fast page loads
 * Preloads critical images, fonts, videos, and other resources with progress tracking
 */

export interface PreloadResource {
    url: string;
    type: 'image' | 'font' | 'script' | 'style' | 'video';
    priority?: 'critical' | 'high' | 'low';
    crossorigin?: boolean;
    size?: number; // Expected file size for progress calculation
}

export interface PreloadProgress {
    loaded: number;
    total: number;
    percentage: number;
    currentResource: string;
    isComplete: boolean;
}

export type ProgressCallback = (progress: PreloadProgress) => void;

class ResourcePreloader {
    private preloadedResources = new Set<string>();
    private preloadQueue: PreloadResource[] = [];
    private isProcessing = false;
    private progressCallbacks = new Set<ProgressCallback>();
    private currentProgress: PreloadProgress = {
        loaded: 0,
        total: 0,
        percentage: 0,
        currentResource: '',
        isComplete: false
    };
    private cacheKey = 'pup-preloaded-resources';
    private cacheVersion = '1.0.0'; // Update when assets change
    private isCacheEnabled = true;

    constructor() {
        this.loadCachedResources();
        this.setupPerformanceObserver();
    }

    /**
     * Load previously cached resources from localStorage
     */
    private loadCachedResources(): void {
        if (!this.isCacheEnabled) return;
        
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const { version, resources } = JSON.parse(cached);
                if (version === this.cacheVersion) {
                    resources.forEach((url: string) => this.preloadedResources.add(url));
                } else {
                    // Clear outdated cache
                    localStorage.removeItem(this.cacheKey);
                }
            }
        } catch (error) {
            console.warn('Failed to load cached resources:', error);
            localStorage.removeItem(this.cacheKey);
        }
    }

    /**
     * Save preloaded resources to cache with size management
     */
    private saveCachedResources(): void {
        if (!this.isCacheEnabled) return;
        
        try {
            // Limit cache to 1000 resources to prevent localStorage bloat
            const resourceArray = Array.from(this.preloadedResources);
            const limitedResources = resourceArray.slice(-1000); // Keep most recent 1000
            
            const cacheData = {
                version: this.cacheVersion,
                resources: limitedResources,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
            
            // Update the in-memory set to match
            if (resourceArray.length > 1000) {
                this.preloadedResources.clear();
                limitedResources.forEach(url => this.preloadedResources.add(url));
            }
        } catch (error) {
            console.warn('Failed to save cached resources:', error);
            // Clear cache if storage is full
            this.clearCache();
        }
    }

    /**
     * Setup performance observer to track resource loading
     */
    private setupPerformanceObserver(): void {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (entry.name && (entry.name.includes('.jpg') || entry.name.includes('.png') || 
                            entry.name.includes('.webp') || entry.name.includes('.avif'))) {
                            this.preloadedResources.add(entry.name);
                        }
                    });
                    this.saveCachedResources();
                });
                observer.observe({ entryTypes: ['resource'] });
            } catch (error) {
                console.warn('Performance observer not supported:', error);
            }
        }
    }

    /**
     * Subscribe to preload progress updates
     */
    onProgress(callback: ProgressCallback): () => void {
        this.progressCallbacks.add(callback);
        return () => this.progressCallbacks.delete(callback);
    }

    /**
     * Update progress and notify callbacks
     */
    private updateProgress(loaded: number, total: number, currentResource: string) {
        this.currentProgress = {
            loaded,
            total,
            percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
            currentResource,
            isComplete: loaded >= total && total > 0
        };

        this.progressCallbacks.forEach(callback => {
            try {
                callback({ ...this.currentProgress });
            } catch (error) {
                console.warn('Progress callback error:', error);
            }
        });
    }

    /**
     * Check if resource is cached and available
     */
    private isResourceCached(url: string): boolean {
        // Check localStorage cache
        if (this.preloadedResources.has(url)) {
            return true;
        }

        // Check browser cache via performance API
        if ('performance' in window) {
            try {
                const entries = performance.getEntriesByName(url);
                if (entries.length > 0) {
                    const entry = entries[0] as PerformanceResourceTiming;
                    // If transfer size is 0, resource was served from cache
                    return entry.transferSize === 0 && entry.decodedBodySize > 0;
                }
            } catch {
                // Ignore errors - performance API may not be available
            }
        }

        return false;
    }

    /**
     * Preload a single resource with enhanced loading and caching
     */
    preload(resource: PreloadResource): Promise<void> {
        return new Promise((resolve, reject) => {
            // Skip if already preloaded or cached
            if (this.isResourceCached(resource.url)) {
                resolve();
                return;
            }

            // For images and videos, use fetch for better progress tracking
            if (resource.type === 'image' || resource.type === 'video') {
                this.preloadWithFetch(resource)
                    .then(() => {
                        this.preloadedResources.add(resource.url);
                        this.saveCachedResources();
                        resolve();
                    })
                    .catch(reject);
                return;
            }

            // For other resources, use traditional preload link
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.url;

            // Set appropriate attributes based on resource type
            switch (resource.type) {
                case 'font':
                    link.as = 'font';
                    link.type = 'font/woff2';
                    link.crossOrigin = 'anonymous';
                    break;
                case 'script':
                    link.as = 'script';
                    break;
                case 'style':
                    link.as = 'style';
                    break;
            }

            // Set priority if supported
            if (resource.priority && 'fetchPriority' in link) {
                const linkElement = link as HTMLLinkElement & { fetchPriority?: string };
                linkElement.fetchPriority = resource.priority === 'critical' ? 'high' : resource.priority;
            }

            link.onload = () => {
                this.preloadedResources.add(resource.url);
                this.saveCachedResources();
                resolve();
            };

            link.onerror = () => {
                console.warn(`Failed to preload resource: ${resource.url}`);
                reject(new Error(`Failed to preload: ${resource.url}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Preload with fetch for better progress tracking
     */
    private async preloadWithFetch(resource: PreloadResource): Promise<void> {
        try {
            const response = await fetch(resource.url, {
                method: 'GET',
                mode: resource.crossorigin ? 'cors' : 'same-origin',
                credentials: resource.crossorigin ? 'omit' : 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // For images, create image element to ensure proper decoding
            if (resource.type === 'image') {
                const blob = await response.blob();
                const img = new Image();
                return new Promise((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Image decode failed'));
                    img.src = URL.createObjectURL(blob);
                });
            }

            // For videos, just fetch the blob
            if (resource.type === 'video') {
                await response.blob();
            }
        } catch (error) {
            console.warn(`Failed to preload ${resource.url}:`, error);
            throw error;
        }
    }

    /**
     * Preload multiple resources with priority handling and progress tracking
     */
    async preloadBatch(resources: PreloadResource[]): Promise<void> {
        // Sort by priority (critical > high > low)
        const sortedResources = [...resources].sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, low: 2 };
            const aPriority = priorityOrder[a.priority || 'low'];
            const bPriority = priorityOrder[b.priority || 'low'];
            return aPriority - bPriority;
        });

        // Separate by priority levels
        const criticalResources = sortedResources.filter(r => r.priority === 'critical');
        const highPriorityResources = sortedResources.filter(r => r.priority === 'high');
        const lowPriorityResources = sortedResources.filter(r => r.priority === 'low' || !r.priority);

        let loaded = 0;
        const total = resources.length;

        // Process critical resources first (blocking)
        for (const resource of criticalResources) {
            this.updateProgress(loaded, total, resource.url);
            try {
                await this.preload(resource);
            } catch (error) {
                console.warn(`Failed to preload critical resource: ${resource.url}`, error);
            }
            loaded++;
        }

        // Process high priority resources concurrently
        await Promise.allSettled(
            highPriorityResources.map(async (resource) => {
                this.updateProgress(loaded, total, resource.url);
                try {
                    await this.preload(resource);
                } finally {
                    loaded++;
                    this.updateProgress(loaded, total, resource.url);
                }
            })
        );

        // Update progress for high priority completion
        this.updateProgress(loaded, total, 'High priority assets loaded');

        // Process low priority resources with requestIdleCallback
        if (lowPriorityResources.length > 0) {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(async () => {
                    await Promise.allSettled(
                        lowPriorityResources.map(async (resource) => {
                            try {
                                await this.preload(resource);
                            } finally {
                                loaded++;
                                this.updateProgress(loaded, total, resource.url);
                            }
                        })
                    );
                });
            } else {
                // Fallback for browsers without requestIdleCallback
                setTimeout(async () => {
                    await Promise.allSettled(
                        lowPriorityResources.map(async (resource) => {
                            try {
                                await this.preload(resource);
                            } finally {
                                loaded++;
                                this.updateProgress(loaded, total, resource.url);
                            }
                        })
                    );
                }, 100);
            }
        }

        // Mark as complete if all critical and high priority resources are loaded
        this.updateProgress(loaded, total, 'Critical assets ready');
    }

    /**
     * Preload critical resources only (blocking method)
     */
    async preloadCriticalResources(resources: PreloadResource[]): Promise<void> {
        const criticalResources = resources.filter(r => r.priority === 'critical');
        let loaded = 0;
        const total = criticalResources.length;

        for (const resource of criticalResources) {
            this.updateProgress(loaded, total, resource.url);
            try {
                await this.preload(resource);
            } catch (error) {
                console.warn(`Failed to preload critical resource: ${resource.url}`, error);
            }
            loaded++;
        }

        this.updateProgress(loaded, total, 'Critical resources ready');
    }

    /**
     * Preload images with WebP detection
     */
    preloadImages(images: string[], priority: 'high' | 'low' = 'low'): void {
        const resources: PreloadResource[] = images.map(url => ({
            url,
            type: 'image',
            priority,
            crossorigin: true
        }));

        this.preloadBatch(resources);
    }

    /**
     * Preload critical landing page resources with enhanced prioritization
     */
    preloadLandingPageResources(landingData: Record<string, unknown>): void {
        const resources: PreloadResource[] = [];

        // Preload ALL carousel images (CRITICAL priority - all must load before page display)
        if (landingData?.carousel_data && Array.isArray(landingData.carousel_data)) {
            landingData.carousel_data.forEach((item: Record<string, unknown>) => {
                if (item.image && typeof item.image === 'string') {
                    resources.push({
                        url: item.image,
                        type: 'image',
                        priority: 'critical', // ALL carousel images are critical
                        crossorigin: true
                    });
                }
            });
        }

        // Preload hero images (CRITICAL priority)
        if (landingData?.hero_image && typeof landingData.hero_image === 'string') {
            resources.push({
                url: landingData.hero_image,
                type: 'image',
                priority: 'critical',
                crossorigin: true
            });
        }

        // Preload director image (high priority - likely above fold)
        if (landingData?.director_image && typeof landingData.director_image === 'string') {
            resources.push({
                url: landingData.director_image,
                type: 'image',
                priority: 'high',
                crossorigin: true
            });
        }

        // Preload ALL video thumbnails (CRITICAL priority - all must load before page display)
        if (landingData?.videos_data && Array.isArray(landingData.videos_data)) {
            landingData.videos_data.forEach((video: Record<string, unknown>) => {
                if (video.video_type === 'youtube' && video.video && typeof video.video === 'string') {
                    const thumbnailUrl = video.thumbnail 
                        ? String(video.thumbnail)
                        : `https://img.youtube.com/vi/${video.video}/maxresdefault.jpg`;
                    resources.push({
                        url: thumbnailUrl,
                        type: 'image',
                        priority: 'critical', // ALL video thumbnails are critical
                        crossorigin: true
                    });
                } else if (video.thumbnail && typeof video.thumbnail === 'string') {
                    resources.push({
                        url: video.thumbnail,
                        type: 'image',
                        priority: 'critical', // ALL video thumbnails are critical
                        crossorigin: true
                    });
                }
            });
        }

        // Preload ALL accreditor images (CRITICAL priority - all must load before page display)
        if (landingData?.accreditors_data && Array.isArray(landingData.accreditors_data)) {
            landingData.accreditors_data.forEach((accreditor: Record<string, unknown>) => {
                if (accreditor.image && typeof accreditor.image === 'string') {
                    resources.push({
                        url: accreditor.image,
                        type: 'image',
                        priority: 'critical', // ALL accreditor images are critical
                        crossorigin: true
                    });
                }
            });
        }

        // Preload ALL program images (CRITICAL priority - all must load before page display)
        if (landingData?.programs_data && Array.isArray(landingData.programs_data)) {
            landingData.programs_data.forEach((program: Record<string, unknown>) => {
                if (program.image && typeof program.image === 'string') {
                    resources.push({
                        url: program.image,
                        type: 'image',
                        priority: 'critical', // ALL program images are critical
                        crossorigin: true
                    });
                }
            });
        }

        // Preload footer/mula sayo image (CRITICAL priority - all must load before page display)
        if (landingData?.mula_sayo_image && typeof landingData.mula_sayo_image === 'string') {
            resources.push({
                url: landingData.mula_sayo_image,
                type: 'image',
                priority: 'critical', // ALL images are critical for complete loading
                crossorigin: true
            });
        }

        // Start preloading with progress tracking
        this.preloadBatch(resources);
    }

    /**
     * Preload program page resources
     */
    preloadProgramPageResources(programData: Record<string, unknown>): void {
        const resources: PreloadResource[] = [];

        // Hero image (high priority)
        if (programData?.hero_image && typeof programData.hero_image === 'string') {
            resources.push({
                url: programData.hero_image,
                type: 'image',
                priority: 'high',
                crossorigin: true
            });
        }

        // Program image (high priority)
        if (programData?.program_image && typeof programData.program_image === 'string') {
            resources.push({
                url: programData.program_image,
                type: 'image',
                priority: 'high',
                crossorigin: true
            });
        }

        // Action images (lower priority)
        if (programData?.action_images && Array.isArray(programData.action_images)) {
            programData.action_images.forEach((image: unknown) => {
                if (typeof image === 'string') {
                    resources.push({
                        url: image,
                        type: 'image',
                        priority: 'low',
                        crossorigin: true
                    });
                }
            });
        }

        // Accreditation area images (lower priority)
        if (programData?.accreditation_areas && Array.isArray(programData.accreditation_areas)) {
            programData.accreditation_areas.forEach((area: unknown) => {
                if (typeof area === 'object' && area !== null) {
                    const areaObj = area as Record<string, unknown>;
                    if (areaObj.image && typeof areaObj.image === 'string') {
                        resources.push({
                            url: areaObj.image,
                            type: 'image',
                            priority: 'low',
                            crossorigin: true
                        });
                    }
                }
            });
        }

        this.preloadBatch(resources);
    }

    /**
     * Check if resource is already preloaded
     */
    isPreloaded(url: string): boolean {
        return this.preloadedResources.has(url);
    }

    /**
     * Clear preloaded resources cache
     */
    clearCache(): void {
        this.preloadedResources.clear();
        if (this.isCacheEnabled) {
            localStorage.removeItem(this.cacheKey);
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; version: string; enabled: boolean } {
        return {
            size: this.preloadedResources.size,
            version: this.cacheVersion,
            enabled: this.isCacheEnabled
        };
    }

    /**
     * Enable or disable caching
     */
    setCacheEnabled(enabled: boolean): void {
        this.isCacheEnabled = enabled;
        if (!enabled) {
            localStorage.removeItem(this.cacheKey);
        }
    }
}

// Create singleton instance
const resourcePreloader = new ResourcePreloader();

export default resourcePreloader;

// Export utility functions
export const preloadImage = (url: string, priority: 'high' | 'low' = 'low') => {
    resourcePreloader.preload({
        url,
        type: 'image',
        priority,
        crossorigin: true
    });
};

export const preloadImages = (urls: string[], priority: 'high' | 'low' = 'low') => {
    resourcePreloader.preloadImages(urls, priority);
};

// Add method to preload ALL critical resources and return promise
export const preloadCriticalLandingResources = async (landingData: Record<string, unknown>): Promise<void> => {
    const resources: PreloadResource[] = [];

    // ALL carousel images are critical
    if (landingData?.carousel_data && Array.isArray(landingData.carousel_data)) {
        landingData.carousel_data.forEach((item: Record<string, unknown>) => {
            if (item.image && typeof item.image === 'string') {
                resources.push({
                    url: item.image,
                    type: 'image',
                    priority: 'critical',
                    crossorigin: true
                });
            }
        });
    }

    // Hero/Director image
    if (landingData?.hero_image && typeof landingData.hero_image === 'string') {
        resources.push({
            url: landingData.hero_image,
            type: 'image',
            priority: 'critical',
            crossorigin: true
        });
    }

    if (landingData?.director_image && typeof landingData.director_image === 'string') {
        resources.push({
            url: landingData.director_image,
            type: 'image',
            priority: 'critical',
            crossorigin: true
        });
    }

    // ALL video thumbnails are critical
    if (landingData?.videos_data && Array.isArray(landingData.videos_data)) {
        landingData.videos_data.forEach((video: Record<string, unknown>) => {
            if (video.video_type === 'youtube' && video.video && typeof video.video === 'string') {
                const thumbnailUrl = video.thumbnail 
                    ? String(video.thumbnail)
                    : `https://img.youtube.com/vi/${video.video}/maxresdefault.jpg`;
                resources.push({
                    url: thumbnailUrl,
                    type: 'image',
                    priority: 'critical',
                    crossorigin: true
                });
            } else if (video.thumbnail && typeof video.thumbnail === 'string') {
                resources.push({
                    url: video.thumbnail,
                    type: 'image',
                    priority: 'critical',
                    crossorigin: true
                });
            }
        });
    }

    // ALL accreditor images are critical
    if (landingData?.accreditors_data && Array.isArray(landingData.accreditors_data)) {
        landingData.accreditors_data.forEach((accreditor: Record<string, unknown>) => {
            if (accreditor.image && typeof accreditor.image === 'string') {
                resources.push({
                    url: accreditor.image,
                    type: 'image',
                    priority: 'critical',
                    crossorigin: true
                });
            }
        });
    }

    // ALL program images are critical
    if (landingData?.programs_data && Array.isArray(landingData.programs_data)) {
        landingData.programs_data.forEach((program: Record<string, unknown>) => {
            if (program.image && typeof program.image === 'string') {
                resources.push({
                    url: program.image,
                    type: 'image',
                    priority: 'critical',
                    crossorigin: true
                });
            }
        });
    }

    // Mula sayo image is critical
    if (landingData?.mula_sayo_image && typeof landingData.mula_sayo_image === 'string') {
        resources.push({
            url: landingData.mula_sayo_image,
            type: 'image',
            priority: 'critical',
            crossorigin: true
        });
    }

    return resourcePreloader.preloadCriticalResources(resources);
};

export const preloadLandingResources = (landingData: Record<string, unknown>) => {
    resourcePreloader.preloadLandingPageResources(landingData);
};

export const preloadProgramResources = (programData: Record<string, unknown>) => {
    resourcePreloader.preloadProgramPageResources(programData);
};

// Export progress subscription method
export const onPreloadProgress = (callback: ProgressCallback) => {
    return resourcePreloader.onProgress(callback);
};

// Export cache management functions
export const clearResourceCache = () => {
    resourcePreloader.clearCache();
};

export const getResourceCacheStats = () => {
    return resourcePreloader.getCacheStats();
};

export const setResourceCacheEnabled = (enabled: boolean) => {
    resourcePreloader.setCacheEnabled(enabled);
};
