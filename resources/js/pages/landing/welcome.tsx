import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Color palette - Maroon as primary
const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface LandingData {
    carousel_data: Array<{
        image: string;
        title: string;
        subtitle: string;
    }>;
    accreditors_title: string;
    accreditors_data: Array<{
        image: string;
        name: string;
        position: string;
    }>;
    director_section_title: string;
    director_image: string;
    director_name: string;
    director_position: string;
    director_message: string;
    videos_section_title: string;
    videos_data: Array<{
        title: string;
        video: string;
        video_type: 'youtube' | 'upload';
        thumbnail?: string;
    }>;
    programs_section_title: string;
    programs_data: Array<{
        image: string;
        name: string;
        description: string;
    }>;
    quick_links_title: string;
    quick_links_data: Array<{
        url: string;
        title: string;
    }>;
    mula_sayo_title: string;
    mula_sayo_image: string;
}

interface Props {
    landingContent: LandingData;
}

export default function Welcome({ landingContent }: Props) {
    const [scrollDirection, setScrollDirection] = useState('down');
    const [lastScrollY, setLastScrollY] = useState(0);

    // For seamless infinite slider
    const [slideIndex, setSlideIndex] = useState(1); // Start at 1 (first real slide)
    const [isSliding, setIsSliding] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // Add pause state for user interactions
    const [isTabActive, setIsTabActive] = useState(true); // Track tab visibility
    const sliderRef = useRef<HTMLDivElement>(null);
    const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Slider images derived from landing data
    const getSliderImages = () => {
        if (!landingContent) return [];
        
        const originalImages = landingContent.carousel_data.map((item, index) => ({
            id: index + 1,
            src: item.image || '/api/placeholder/1400/700',
            alt: item.title || `PUP Calauan Campus ${index + 1}`,
            title: item.title,
            subtitle: item.subtitle
        }));

        // Images with clones for seamless loop
        return [
            originalImages[originalImages.length - 1], // Clone last image at the start
            ...originalImages,
            originalImages[0], // Clone first image at the end
        ];
    };

    const sliderImages = getSliderImages();

    // Enhanced scroll animation hook with directional detection
    const useScrollAnimation = () => {
        const [isVisible, setIsVisible] = useState(false);
        const [hasAnimated, setHasAnimated] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const currentRef = ref.current; // Store ref value to avoid cleanup issues
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setIsVisible(true);
                        setHasAnimated(true);
                    } else if (!entry.isIntersecting && hasAnimated) {
                        // Re-trigger animation when scrolling back
                        setTimeout(() => {
                            setIsVisible(false);
                            setHasAnimated(false);
                        }, 100);
                    }
                },
                { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
            );

            if (currentRef) {
                observer.observe(currentRef);
            }

            return () => {
                if (currentRef) {
                    observer.unobserve(currentRef);
                }
            };
        }, [hasAnimated]);

        return [ref, isVisible] as const;
    };

    // Scroll direction detection
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Handle next/prev with seamless loop
    const goToSlide = (idx: number) => {
        if (isSliding) return; // Prevent multiple transitions
        setSlideIndex(idx);
        setIsSliding(true);
        
        // Pause auto-slide temporarily when user manually navigates
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    };

    // Handle tab visibility change to pause carousel when tab is not active
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsTabActive(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Auto-slide functionality with seamless loop
    useEffect(() => {
        // Only start auto-slide if we have landing data and images and not paused and tab is active
        if (!landingContent || sliderImages.length === 0 || isPaused || !isTabActive) {
            return;
        }

        autoSlideTimerRef.current = setInterval(() => {
            setSlideIndex(prevIndex => {
                const nextIndex = prevIndex + 1;
                setIsSliding(true);
                return nextIndex;
            });
        }, 2000); // Increased from 2000 to 4000ms for better user experience

        return () => {
            if (autoSlideTimerRef.current) {
                clearInterval(autoSlideTimerRef.current);
                autoSlideTimerRef.current = null;
            }
        };
    }, [landingContent, sliderImages.length, isPaused, isTabActive]); // Include tab visibility in dependencies

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (autoSlideTimerRef.current) {
                clearInterval(autoSlideTimerRef.current);
                autoSlideTimerRef.current = null;
            }
        };
    }, []);

    // Handle transition end for seamless loop
    useEffect(() => {
        const handleTransitionEnd = () => {
            if (!sliderRef.current) return;
            
            // Only handle the jump if we're at the clone slides
            if (slideIndex === sliderImages.length - 1) {
                // At the last clone, jump to first real slide without transition
                sliderRef.current.style.transition = 'none';
                setSlideIndex(1);
                // Force reflow then re-enable transition
                void sliderRef.current.offsetHeight;
                sliderRef.current.style.transition = '';
            } else if (slideIndex === 0) {
                // At the first clone, jump to last real slide without transition
                sliderRef.current.style.transition = 'none';
                setSlideIndex(sliderImages.length - 2);
                // Force reflow then re-enable transition
                void sliderRef.current.offsetHeight;
                sliderRef.current.style.transition = '';
            }
            setIsSliding(false);
        };
        
        const slider = sliderRef.current;
        if (slider && sliderImages.length > 0) {
            slider.addEventListener('transitionend', handleTransitionEnd);
        }
        return () => {
            if (slider) {
                slider.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
    }, [slideIndex, sliderImages.length]);

    // Scroll animation refs
    const [welcomeRef, welcomeVisible] = useScrollAnimation();
    const [messageRef, messageVisible] = useScrollAnimation();
    const [videoRef, videoVisible] = useScrollAnimation();
    const [programsRef, programsVisible] = useScrollAnimation();
    const [linksRef, linksVisible] = useScrollAnimation();

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="home" />

                {/* Main Content */}
                <main className="pt-16 sm:pt-20">
                    {/* Image Slider */}
                    <section 
                        className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div 
                            ref={sliderRef}
                            className={`flex h-full ${isSliding ? 'transition-transform duration-700 ease-in-out' : ''}`}
                            style={{
                                transform: `translateX(-${slideIndex * 100}%)`,
                            }}
                        >
                            {sliderImages.map((image, index) => (
                                <div key={`${image.id}-${index}`} className="w-full h-full flex-shrink-0 relative">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 flex items-center justify-center transition-all duration-300 hover:from-black/25 hover:via-black/45 hover:to-black/65">
                                        <div className="text-center text-white px-4 max-w-6xl mx-auto">
                                            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 animate-fade-in-up transform transition-all duration-300 hover:scale-102 text-shadow-lg">
                                                {image.title || 'Welcome to PUP Calauan'}
                                            </h2>
                                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102 text-shadow-lg">
                                                {image.subtitle || 'Excellence in Education, Innovation in Learning'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Slider Controls */}
                        <button
                            onClick={() => {
                                if (isSliding) return;
                                goToSlide(slideIndex - 1);
                            }}
                            className="absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                        </button>
                        <button
                            onClick={() => {
                                if (isSliding) return;
                                goToSlide(slideIndex + 1);
                            }}
                            className="absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
                        >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                        </button>

                        {/* Slider Indicators */}
                        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
                            {landingContent?.carousel_data.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (isSliding) return;
                                        goToSlide(index + 1);
                                    }}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                                        slideIndex === index + 1 
                                            ? 'bg-white scale-110' 
                                            : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            )) || []}
                        </div>
                    </section>

                    {/* Welcome Section - Light Gray Background with Pattern */}
                    <section 
                        ref={welcomeRef}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            welcomeVisible 
                                ? 'opacity-100 translate-y-0 translate-x-0' 
                                : scrollDirection === 'down' 
                                    ? 'opacity-0 translate-y-20 translate-x-10' 
                                    : 'opacity-0 -translate-y-20 -translate-x-10'
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
                        
                        <div className="w-full max-w-8xl mx-auto text-center relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 sm:mb-12 lg:mb-16 transition-all duration-500 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {landingContent?.accreditors_title || 'Welcome PUP Calauan Accreditors'}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
                                {landingContent?.accreditors_data.map((accreditor, index) => (
                                    <div 
                                        key={index} 
                                        className={`text-center transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                                            welcomeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{ transitionDelay: `${index * 0.15}s` }}
                                    >
                                        <div className="relative mb-4 sm:mb-6 group">
                                            <img
                                                src={accreditor.image || '/api/placeholder/200/200'}
                                                alt={accreditor.name}
                                                className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-48 xl:h-48 mx-auto rounded-full shadow-lg border-4 group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                                style={{ borderColor: COLORS.softYellow }}
                                            />
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 mb-1 sm:mb-2 transition-all duration-300 hover:scale-105" style={{ color: COLORS.darkMaroon }}>{accreditor.name}</h3>
                                        <p className="text-base sm:text-lg lg:text-xl transition-all duration-300 hover:font-medium" style={{ color: COLORS.burntOrange }}>{accreditor.position}</p>
                                    </div>
                                )) || []}
                            </div>
                        </div>
                    </section>

                    {/* Message from Director - Gradient Background */}
                    <section 
                        ref={messageRef}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            messageVisible 
                                ? 'opacity-100 translate-y-0' 
                                : scrollDirection === 'down' 
                                    ? 'opacity-0 translate-y-32' 
                                    : 'opacity-0 -translate-y-32'
                        }`}
                        style={{ 
                            background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                        }}
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-10" style={{ backgroundColor: COLORS.softYellow }}></div>
                        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full opacity-10" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
                                <div className={`order-2 lg:order-1 transition-all duration-1200 delay-200 ${
                                    messageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-32'
                                }`}>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                        {landingContent?.director_section_title || 'Message from the Director'}
                                    </h2>
                                    <div className="space-y-4 sm:space-y-6 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                                        <p className="transition-all duration-300 hover:text-gray-900 transform hover:scale-102 whitespace-pre-line">
                                            {landingContent?.director_message || 'Welcome to the Polytechnic University of the Philippines - Calauan Campus. As we continue our journey towards academic excellence, we remain committed to providing quality education that meets international standards.'}
                                        </p>
                                    </div>
                                    <div className="mt-6 sm:mt-8 group">
                                        <p className="font-bold text-xl sm:text-2xl text-gray-900 transition-all duration-300 group-hover:scale-105">{landingContent?.director_name || 'Dr. Campus Director'}</p>
                                        <p className="text-lg sm:text-xl transition-all duration-300 group-hover:font-medium" style={{ color: COLORS.burntOrange }}>{landingContent?.director_position || 'Campus Director'}</p>
                                    </div>
                                </div>
                                <div className={`order-1 lg:order-2 text-center transition-all duration-1200 delay-400 ${
                                    messageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-32'
                                }`}>
                                    <div className="relative group">
                                        <img
                                            src={landingContent?.director_image || '/api/placeholder/600/800'}
                                            alt={landingContent?.director_name || 'Campus Director'}
                                            className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto rounded-2xl shadow-xl border-4 hover:scale-105 transition-transform duration-500 hover:shadow-2xl"
                                            style={{ borderColor: COLORS.softYellow, height: 'auto', aspectRatio: '3/4', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Video Section - Maroon Theme */}
                    <section 
                        ref={videoRef}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative ${
                            videoVisible 
                                ? 'opacity-100 translate-y-0' 
                                : scrollDirection === 'down' 
                                    ? 'opacity-0 translate-y-24' 
                                    : 'opacity-0 -translate-y-24'
                        }`}
                        style={{ backgroundColor: COLORS.primaryMaroon }}
                    >
                        {/* Accent Border */}
                        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: COLORS.softYellow }}></div>
                        
                        <div className="w-full max-w-8xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-white transition-all duration-300 hover:scale-102">
                                {landingContent?.videos_section_title || 'Campus Videos'}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                                {landingContent?.videos_data.map((video, index) => (
                                    <div 
                                        key={index} 
                                        className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                                            videoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{ transitionDelay: `${index * 0.2}s` }}
                                        onClick={() => {
                                            if (video.video_type === 'youtube') {
                                                window.open(`https://www.youtube.com/watch?v=${video.video}`, '_blank');
                                            } else {
                                                // For uploaded videos, open the video file directly
                                                window.open(video.video, '_blank');
                                            }
                                        }}
                                    >
                                        <div className="relative rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                                            {video.video_type === 'youtube' ? (
                                                <img
                                                    src={video.thumbnail || `https://img.youtube.com/vi/${video.video}/maxresdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-full h-48 sm:h-56 lg:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <video
                                                    className="w-full h-48 sm:h-56 lg:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                                                    poster={video.thumbnail}
                                                    preload="metadata"
                                                >
                                                    <source src={video.video} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center group-hover:from-black/50 group-hover:via-black/25 transition-all duration-300">
                                                <div 
                                                    className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-lg"
                                                    style={{ backgroundColor: COLORS.almostWhite }}
                                                >
                                                    <Play className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 ml-1 text-black" />
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl lg:text-2xl font-bold text-white transition-all duration-300 group-hover:scale-105">{video.title}</h3>
                                    </div>
                                )) || []}
                            </div>
                        </div>
                    </section>

                    {/* Programs Under Survey - Card Style with Shadow */}
                    <section 
                        ref={programsRef}
                        id="programs" 
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative ${
                            programsVisible 
                                ? 'opacity-100 translate-y-0' 
                                : scrollDirection === 'down' 
                                    ? 'opacity-0 translate-y-28' 
                                    : 'opacity-0 -translate-y-28'
                        }`}
                        style={{ backgroundColor: 'white' }}
                    >
                        {/* Geometric Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full opacity-5" style={{ backgroundColor: COLORS.primaryMaroon }}></div>
                            <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 rounded-full opacity-5" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        </div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {landingContent?.programs_section_title || 'Programs Under Survey'}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                                {landingContent?.programs_data.map((program, index) => (
                                    <div 
                                        key={index} 
                                        className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 border-t-4 hover:shadow-2xl group ${
                                            programsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{ 
                                            borderTopColor: COLORS.primaryMaroon,
                                            transitionDelay: `${index * 0.2}s`
                                        }}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={program.image || '/api/placeholder/400/250'}
                                                alt={program.name}
                                                className="w-full h-48 sm:h-56 lg:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6 sm:p-8">
                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                {program.name}
                                            </h3>
                                            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed transition-all duration-300 group-hover:text-gray-800">
                                                {program.description}
                                            </p>
                                            <button 
                                                className="px-5 sm:px-6 py-2 sm:py-3 rounded-lg text-white font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-lg"
                                                style={{ backgroundColor: COLORS.burntOrange }}
                                            >
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                )) || []}
                            </div>
                        </div>
                    </section>

                    {/* Quick Links - Textured Background */}
                    <section 
                        ref={linksRef}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative ${
                            linksVisible 
                                ? 'opacity-100 translate-y-0' 
                                : scrollDirection === 'down' 
                                    ? 'opacity-0 translate-y-20' 
                                    : 'opacity-0 -translate-y-20'
                        }`}
                        style={{ backgroundColor: '#f3f4f6' }}
                    >
                        {/* Textured Overlay */}
                        <div className="absolute inset-0 opacity-30" style={{
                            backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(127, 4, 4, 0.05) 25%), 
                                            linear-gradient(-45deg, transparent 25%, rgba(196, 107, 2, 0.05) 25%),
                                            linear-gradient(45deg, transparent 75%, rgba(127, 4, 4, 0.05) 75%), 
                                            linear-gradient(-45deg, transparent 75%, rgba(196, 107, 2, 0.05) 75%)`,
                            backgroundSize: '40px 40px',
                            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
                        }}></div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {landingContent?.quick_links_title || 'Quick Links'}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                                {landingContent?.quick_links_data.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 text-center transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 border-l-4 hover:shadow-xl ${
                                            linksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{ 
                                            borderLeftColor: COLORS.primaryMaroon,
                                            transitionDelay: `${index * 0.2}s`
                                        }}
                                    >
                                        <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                            {link.title.includes('Website') ? '🎓' : 
                                             link.title.includes('SIS') ? '📚' : 
                                             link.title.includes('Facebook') ? '📘' : '🔗'}
                                        </div>
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                            {link.title}
                                        </h3>
                                        <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 mx-auto group-hover:scale-110 transition-transform duration-300" style={{ color: COLORS.burntOrange }} />
                                    </a>
                                )) || []}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan Section */}
                    <section
                        className="relative py-16 sm:py-20 lg:py-24 px-0 transition-all duration-1200"
                    >
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={landingContent?.mula_sayo_image || '/api/placeholder/1600/400'}
                                alt={landingContent?.mula_sayo_title || 'Mula Sayo, Para Sa Bayan'}
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {landingContent?.mula_sayo_title || 'Mula Sayo, Para Sa Bayan'}
                            </h2>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>

            <style>{`
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
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
            `}</style>
        </>
    );
}