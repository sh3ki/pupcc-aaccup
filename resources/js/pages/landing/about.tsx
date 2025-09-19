import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, memo } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { useScrollAnimation as useOptimizedScrollAnimation, getAnimationClasses } from '@/hooks/useOptimizedIntersection';
import { preloadCriticalAboutResources, preloadAboutResources, onPreloadProgress } from '@/utils/resourcePreloader';
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

interface AboutData {
    hero_image: string;
    hero_title: string;
    hero_subtitle: string;
    story_title: string;
    story_content: string;
    mission_title: string;
    mission_content: string;
    vision_title: string;
    vision_content: string;
    faculty_title: string;
    faculty_data: Array<{
        image: string;
        name: string;
        description: string;
    }>;
    mula_sayo_title: string;
    mula_sayo_image: string;
}

interface Props {
    aboutContent: AboutData;
}

// Memoized components for better performance
const OptimizedFacultyCard = memo(({ faculty, index, isVisible, color }: { 
    faculty: { image: string; name: string; description: string; }; 
    index: number; 
    isVisible: boolean; 
    color: string;
}) => (
    <div
        className={`group block transform transition-all duration-700 hover:scale-105 hover:-translate-y-3 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
        style={{ transitionDelay: `${index * 0.15}s` }}
    >
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col" style={{ borderTopColor: color }}>
            <div className="relative overflow-hidden">
                <OptimizedImage
                    src={faculty.image || "/api/placeholder/400/300"}
                    alt={faculty.name}
                    className="w-full h-48 sm:h-52 lg:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    critical={true} // ALL faculty images are critical for instant display
                    lazy={false} // No lazy loading - preload ALL faculty images
                    priority={true}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-105" style={{ color }}>
                    {faculty.name}
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                    {faculty.description}
                </p>
            </div>
        </div>
    </div>
));
OptimizedFacultyCard.displayName = 'OptimizedFacultyCard';



export default function About({ aboutContent }: Props) {
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
                if (aboutContent) {
                    console.log('🚀 Starting about page critical image preloading...');
                    await preloadCriticalAboutResources(aboutContent as unknown as Record<string, unknown>);
                    console.log('✅ All critical about page images loaded successfully!');
                    
                    // Then start preloading all other resources in background
                    preloadAboutResources(aboutContent as unknown as Record<string, unknown>);
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
    }, [aboutContent]);

    // Use optimized scroll animations
    const aboutAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const missionAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
    const visionAnimation = useOptimizedScrollAnimation({ 
        threshold: 0.15, 
        rootMargin: '0px 0px -50px 0px',
        triggerOnce: false
    });
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
                title="Loading PUP Calauan About"
                subtitle={preloadProgress.currentResource ? `${preloadProgress.currentResource}` : "Loading hero and faculty images..."}
                minimumDisplayTime={1000}
            />

            <Head title="About - PUP Calauan Campus">
                {/* Critical resource hints for better performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link rel="dns-prefetch" href="//api.placeholder" />
                
                {/* Preload hero image with HIGH priority */}
                {aboutContent?.hero_image && (
                    <link 
                        rel="preload" 
                        as="image" 
                        href={aboutContent.hero_image}
                        fetchPriority="high" // Hero image is critical
                    />
                )}
                
                {/* Preload ALL faculty images with HIGH priority for instant display */}
                {aboutContent?.faculty_data?.map((faculty, index) => (
                    faculty.image && (
                        <link 
                            key={index}
                            rel="preload" 
                            as="image" 
                            href={faculty.image}
                            fetchPriority="high" // ALL faculty images are critical
                        />
                    )
                )) || []}
                
                {/* Preload mula sayo image */}
                {aboutContent?.mula_sayo_image && (
                    <link 
                        rel="preload" 
                        as="image" 
                        href={aboutContent.mula_sayo_image}
                        fetchPriority="low"
                    />
                )}
            </Head>
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="about" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section with Background Image */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <div className="absolute inset-0">
                            <OptimizedImage
                                src={aboutContent.hero_image || "/api/placeholder/1600/800"}
                                alt="PUP Calauan Campus"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                critical={true} // Hero image is critical for instant display
                                priority={true}
                                lazy={false} // No lazy loading for hero image
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 flex items-center justify-center transition-all duration-300 hover:from-black/35 hover:via-black/55 hover:to-black/75"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 max-w-6xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 animate-fade-in-up transform transition-all duration-300 hover:scale-102">
                                {aboutContent.hero_title || "About PUP Calauan"}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102">
                                {aboutContent.hero_subtitle || "Excellence, Innovation, and Community Service"}
                            </p>
                        </div>
                    </section>

                    {/* Story Section - Enhanced with patterns and animations */}
                    <section
                        ref={aboutAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            getAnimationClasses(aboutAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')
                        }`}
                        style={{ backgroundColor: '#f8fafc' }}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primaryMaroon} 2px, transparent 2px)`,
                                backgroundSize: '50px 50px'
                            }}></div>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: COLORS.softYellow }}></div>
                        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        
                        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 sm:mb-12 transition-all duration-500 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {aboutContent.story_title || "Our Story"}
                            </h2>
                            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto transition-all duration-300 hover:text-gray-900 transform hover:scale-102">
                                {aboutContent.story_content || "The Polytechnic University of the Philippines - Calauan Campus was established to provide accessible and quality education to the youth of Calauan and nearby towns."}
                            </p>
                        </div>
                    </section>

                    {/* Mission & Vision - Side by side with enhanced styling */}
                    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12" style={{ 
                        background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                    }}>
                        <div className="w-full max-w-8xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
                                {/* Mission */}
                                <div
                                    ref={missionAnimation.ref}
                                    className={`transition-all duration-1200 ${
                                        missionAnimation.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-32'
                                    }`}
                                >
                                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border-l-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group" style={{ borderLeftColor: COLORS.primaryMaroon }}>
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: COLORS.softYellow }}>
                                                <span className="text-2xl sm:text-3xl">🎯</span>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                {aboutContent.mission_title || "Our Mission"}
                                            </h3>
                                        </div>
                                        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center transition-all duration-300 group-hover:text-gray-900">
                                            {aboutContent.mission_content || "To provide quality and inclusive education that empowers students to become competent professionals and responsible citizens."}
                                        </p>
                                    </div>
                                </div>

                                {/* Vision */}
                                <div
                                    ref={visionAnimation.ref}
                                    className={`transition-all duration-1200 delay-200 ${
                                        visionAnimation.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-32'
                                    }`}
                                >
                                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border-l-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group" style={{ borderLeftColor: COLORS.burntOrange }}>
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: COLORS.softYellow }}>
                                                <span className="text-2xl sm:text-3xl">🌟</span>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.burntOrange }}>
                                                {aboutContent.vision_title || "Our Vision"}
                                            </h3>
                                        </div>
                                        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center transition-all duration-300 group-hover:text-gray-900">
                                            {aboutContent.vision_content || "A leading polytechnic university recognized for excellence in education, research, and community service."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Faculty Section - Enhanced with dynamic faculty cards */}
                    <section
                        ref={facultyAnimation.ref}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            getAnimationClasses(facultyAnimation.isVisible, scrollDirection as 'up' | 'down', 'slideUp')
                        }`}
                        style={{ backgroundColor: 'white' }}
                    >
                        {/* Geometric Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: COLORS.primaryMaroon }}></div>
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        </div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {aboutContent.faculty_title || "Our Faculty"}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                                {aboutContent.faculty_data && aboutContent.faculty_data.map((faculty, index) => {
                                    const colors = [COLORS.primaryMaroon, COLORS.burntOrange, COLORS.brightYellow, COLORS.darkMaroon];
                                    const color = colors[index % colors.length];
                                    
                                    return (
                                        <OptimizedFacultyCard
                                            key={index}
                                            faculty={faculty}
                                            index={index}
                                            isVisible={facultyAnimation.isVisible}
                                            color={color}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan Section */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0 transition-all duration-1200">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={aboutContent.mula_sayo_image || "/api/placeholder/1600/400"}
                                alt="Mula Sayo, Para Sa Bayan"
                                className="w-full h-full object-cover object-center opacity-70"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {aboutContent.mula_sayo_title || "Mula Sayo, Para Sa Bayan"}
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