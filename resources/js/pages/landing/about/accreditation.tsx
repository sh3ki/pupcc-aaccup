import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';
import { useScrollAnimation as useOptimizedScrollAnimation, getAnimationClasses } from '@/hooks/useOptimizedIntersection';
import { preloadCriticalAccreditationResources, preloadAccreditationResources, onPreloadProgress } from '@/utils/resourcePreloader';
import LoadingScreen from '@/components/LoadingScreen';
import type { PreloadProgress } from '@/utils/resourcePreloader';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface AccreditationContent {
    hero_image?: string;
    hero_title: string;
    hero_subtitle: string;
    faculty_section_title: string;
    faculty_data: Array<{
        image: string;
        name: string;
    }>;
    mula_sayo_title: string;
    mula_sayo_image?: string;
}

interface Props {
    accreditationContent: AccreditationContent;
}

export default function AccreditationFaculty({ accreditationContent }: Props) {
    // Loading state management
    const [isPreloading, setIsPreloading] = useState(true);
    const [preloadProgress, setPreloadProgress] = useState<PreloadProgress>({
        loaded: 0,
        total: 0,
        percentage: 0,
        currentResource: '',
        isComplete: false
    });

    // Preload critical resources and show loading screen
    useEffect(() => {
        const initializeLoading = async () => {
            // Subscribe to preload progress
            const unsubscribe = onPreloadProgress((progress) => {
                setPreloadProgress(progress);
            });

            try {
                // Preload ALL critical images first - must complete before page shows
                if (accreditationContent) {
                    console.log('🚀 Starting accreditation page critical image preloading...');
                    await preloadCriticalAccreditationResources(accreditationContent as unknown as Record<string, unknown>);
                    console.log('✅ All critical accreditation page images loaded successfully!');
                    
                    // Then start preloading all other resources in background
                    preloadAccreditationResources(accreditationContent as unknown as Record<string, unknown>);
                }
                
                // Hide loading screen after ensuring all critical images are ready
                setTimeout(() => {
                    setIsPreloading(false);
                }, 500); // Slightly longer to ensure smooth transition
                
            } catch (error) {
                console.warn('Resource preloading failed:', error);
                // Still allow page to display even if preloading fails
                setIsPreloading(false);
            }

            return unsubscribe;
        };

        const cleanup = initializeLoading();
        
        return () => {
            cleanup.then(unsubscribe => unsubscribe?.());
        };
    }, [accreditationContent]);

    // Use optimized scroll animations
    const facultyAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });

    // Scroll direction detection
    const [scrollDirection, setScrollDirection] = useState('down');
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>
            {/* Loading Screen - Shows until ALL critical images are loaded */}
            <LoadingScreen 
                isVisible={isPreloading}
                progress={preloadProgress}
                onComplete={() => setIsPreloading(false)}
                title="Loading Accreditation"
                subtitle={preloadProgress.currentResource ? `${preloadProgress.currentResource}` : "Loading hero and faculty images..."}
                minimumDisplayTime={1000}
            />

            <Head title={accreditationContent.hero_title}>
                <meta name="description" content="Accreditation Task Force information" />
                
                {/* Preload hero image with HIGH priority */}
                {accreditationContent?.hero_image && (
                    <link 
                        rel="preload" 
                        as="image" 
                        href={accreditationContent.hero_image}
                        fetchPriority="high" // Hero image is critical
                    />
                )}
                
                {/* Preload ALL faculty images with HIGH priority for instant display */}
                {accreditationContent?.faculty_data?.map((faculty, index) => (
                    faculty.image && (
                        <link 
                            key={`preload-faculty-${index}`}
                            rel="preload" 
                            as="image" 
                            href={faculty.image}
                            fetchPriority="high" // ALL faculty images are critical
                        />
                    )
                )) || []}
                
                {/* Preload mula sayo image */}
                {accreditationContent?.mula_sayo_image && (
                    <link 
                        rel="preload" 
                        as="image" 
                        href={accreditationContent.mula_sayo_image}
                        fetchPriority="low"
                    />
                )}
                
                {/* Performance hints */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link rel="dns-prefetch" href="//api.placeholder" />
            </Head>
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="accreditation" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <div className="absolute inset-0">
                            <OptimizedImage
                                src={accreditationContent.hero_image || "/api/placeholder/1600/800"}
                                alt={accreditationContent.hero_title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                critical={true} // Hero image is critical for instant display
                                priority={true}
                                lazy={false} // No lazy loading for hero image
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 max-w-6xl mx-auto">
                            <Link
                                href="/about"
                                className="absolute top-8 left-8 flex items-center text-white/80 hover:text-white transition-all duration-300 hover:scale-105 group"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                                <span className="text-sm font-medium">Back to About</span>
                            </Link>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 animate-fade-in-up transform transition-all duration-300 hover:scale-102">
                                {accreditationContent.hero_title}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102">
                                {accreditationContent.hero_subtitle}
                            </p>
                        </div>
                    </section>

                    {/* Faculty Members Section */}
                    <section
                        ref={facultyAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${getAnimationClasses(facultyAnimation.isVisible, scrollDirection as 'up' | 'down')}`}
                        style={{ 
                            background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                        }}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primaryMaroon} 2px, transparent 2px)`,
                                backgroundSize: '50px 50px'
                            }}></div>
                        </div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {accreditationContent.faculty_section_title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
                                {accreditationContent.faculty_data.map((member, index) => (
                                    <div
                                        key={`faculty-${index}`}
                                        className={`text-center transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${getAnimationClasses(facultyAnimation.isVisible, scrollDirection as 'up' | 'down')}`}
                                        style={{ transitionDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 hover:shadow-xl transition-all duration-500 group h-full flex flex-col" style={{ borderTopColor: COLORS.primaryMaroon }}>
                                            <div className="relative mb-4 sm:mb-6 group/image">
                                                <OptimizedImage
                                                    src={member.image || "/api/placeholder/300/400"}
                                                    alt={member.name}
                                                    className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto rounded-full shadow-lg border-4 group-hover/image:shadow-xl transition-all duration-300 group-hover/image:scale-105"
                                                    style={{ borderColor: COLORS.primaryMaroon }}
                                                    critical={true} // ALL faculty images are critical for instant display
                                                    lazy={false} // No lazy loading - preload ALL faculty images
                                                    priority={true}
                                                    sizes="(max-width: 640px) 96px, (max-width: 1024px) 144px, 160px"
                                                />
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center">
                                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                    {member.name}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan Section */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0 transition-all duration-1200">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={accreditationContent.mula_sayo_image || "/api/placeholder/1600/400"}
                                alt={accreditationContent.mula_sayo_title}
                                className="w-full h-full object-cover object-center opacity-70"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {accreditationContent.mula_sayo_title}
                            </h2>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
            <style>{`
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
                @keyframes fade-in-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animation-delay-300 {
                    animation-delay: 0.3s;
                }
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </>
    );
}
