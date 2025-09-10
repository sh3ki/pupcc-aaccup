/**
 * Resource preloader utility for lightning-fast page loads
 * Preloads critical images, fonts, and other resources
 */

export interface PreloadResource {
    url: string;
    type: 'image' | 'font' | 'script' | 'style';
    priority?: 'high' | 'low';
    crossorigin?: boolean;
}

class ResourcePreloader {
    private preloadedResources = new Set<string>();
    private preloadQueue: PreloadResource[] = [];
    private isProcessing = false;

    /**
     * Preload a single resource
     */
    preload(resource: PreloadResource): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.preloadedResources.has(resource.url)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.url;

            // Set appropriate attributes based on resource type
            switch (resource.type) {
                case 'image':
                    link.as = 'image';
                    if (resource.crossorigin) {
                        link.crossOrigin = 'anonymous';
                    }
                    break;
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
                (link as any).fetchPriority = resource.priority;
            }

            link.onload = () => {
                this.preloadedResources.add(resource.url);
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
     * Preload multiple resources with priority handling
     */
    async preloadBatch(resources: PreloadResource[]): Promise<void> {
        // Sort by priority (high priority first)
        const sortedResources = [...resources].sort((a, b) => {
            const priorityOrder = { high: 0, low: 1 };
            const aPriority = priorityOrder[a.priority || 'low'];
            const bPriority = priorityOrder[b.priority || 'low'];
            return aPriority - bPriority;
        });

        // Process high priority resources first
        const highPriorityResources = sortedResources.filter(r => r.priority === 'high');
        const lowPriorityResources = sortedResources.filter(r => r.priority !== 'high');

        // Preload high priority resources immediately
        await Promise.allSettled(
            highPriorityResources.map(resource => this.preload(resource))
        );

        // Preload low priority resources with requestIdleCallback if available
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                Promise.allSettled(
                    lowPriorityResources.map(resource => this.preload(resource))
                );
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                Promise.allSettled(
                    lowPriorityResources.map(resource => this.preload(resource))
                );
            }, 100);
        }
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
     * Preload critical landing page resources
     */
    preloadLandingPageResources(landingData: any): void {
        const resources: PreloadResource[] = [];

        // Preload carousel images (high priority - above the fold)
        if (landingData?.carousel_data) {
            landingData.carousel_data.forEach((item: any) => {
                if (item.image) {
                    resources.push({
                        url: item.image,
                        type: 'image',
                        priority: 'high',
                        crossorigin: true
                    });
                }
            });
        }

        // Preload hero images (high priority)
        if (landingData?.hero_image) {
            resources.push({
                url: landingData.hero_image,
                type: 'image',
                priority: 'high',
                crossorigin: true
            });
        }

        // Preload accreditor images (lower priority)
        if (landingData?.accreditors_data) {
            landingData.accreditors_data.forEach((accreditor: any) => {
                if (accreditor.image) {
                    resources.push({
                        url: accreditor.image,
                        type: 'image',
                        priority: 'low',
                        crossorigin: true
                    });
                }
            });
        }

        // Preload director image
        if (landingData?.director_image) {
            resources.push({
                url: landingData.director_image,
                type: 'image',
                priority: 'low',
                crossorigin: true
            });
        }

        // Preload program images
        if (landingData?.programs_data) {
            landingData.programs_data.forEach((program: any) => {
                if (program.image) {
                    resources.push({
                        url: program.image,
                        type: 'image',
                        priority: 'low',
                        crossorigin: true
                    });
                }
            });
        }

        // Start preloading
        this.preloadBatch(resources);
    }

    /**
     * Preload program page resources
     */
    preloadProgramPageResources(programData: any): void {
        const resources: PreloadResource[] = [];

        // Hero image (high priority)
        if (programData?.hero_image) {
            resources.push({
                url: programData.hero_image,
                type: 'image',
                priority: 'high',
                crossorigin: true
            });
        }

        // Program image (high priority)
        if (programData?.program_image) {
            resources.push({
                url: programData.program_image,
                type: 'image',
                priority: 'high',
                crossorigin: true
            });
        }

        // Action images (lower priority)
        if (programData?.action_images) {
            programData.action_images.forEach((image: string) => {
                resources.push({
                    url: image,
                    type: 'image',
                    priority: 'low',
                    crossorigin: true
                });
            });
        }

        // Accreditation area images (lower priority)
        if (programData?.accreditation_areas) {
            programData.accreditation_areas.forEach((area: any) => {
                if (area.image) {
                    resources.push({
                        url: area.image,
                        type: 'image',
                        priority: 'low',
                        crossorigin: true
                    });
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

export const preloadLandingResources = (landingData: any) => {
    resourcePreloader.preloadLandingPageResources(landingData);
};

export const preloadProgramResources = (programData: any) => {
    resourcePreloader.preloadProgramPageResources(programData);
};
