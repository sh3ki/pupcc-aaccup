import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

export default function Welcome() {
    // Dynamic homepage data
    const [home, setHome] = useState<any>(null);

    // Carousel slider state
    const [slideIndex, setSlideIndex] = useState(1);
    const [isSliding, setIsSliding] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Fetch homepage data
    useEffect(() => {
        fetch('/api/home')
            .then(res => res.json())
            .then(setHome);
    }, []);

    // Prepare carousel images for seamless slider
    const getCarouselImages = () => {
        if (!home) return [];
        const images = [
            { src: getImageUrl(home.carousel_image_1), title: home.carousel_title_1, subtitle: home.carousel_subtitle_1 },
            { src: getImageUrl(home.carousel_image_2), title: home.carousel_title_2, subtitle: home.carousel_subtitle_2 },
            { src: getImageUrl(home.carousel_image_3), title: home.carousel_title_3, subtitle: home.carousel_subtitle_3 },
            { src: getImageUrl(home.carousel_image_4), title: home.carousel_title_4, subtitle: home.carousel_subtitle_4 },
        ];
        // Add clones for seamless loop
        return [
            images[images.length - 1],
            ...images,
            images[0],
        ];
    };

    // Helper for image URLs
    function getImageUrl(path: string) {
        if (!path) return '/api/placeholder/1400/700';
        if (path.startsWith('uploads/')) return `/storage/${path}`;
        return path;
    }

    // Carousel slider logic
    const carouselImages = getCarouselImages();

    // --- FIXED TIMER LOGIC ---
    useEffect(() => {
        if (!home || carouselImages.length === 0) return;
        // Clear previous interval if any
        let timer = setInterval(() => {
            setIsSliding(true);
            setSlideIndex(idx => idx + 1);
        }, 4000);
        return () => clearInterval(timer);
    }, [home, carouselImages.length]);

    // --- FIXED BOUNDS LOGIC ---
    useEffect(() => {
        const handleTransitionEnd = () => {
            setIsSliding(false);
            // Loop carousel seamlessly
            if (slideIndex >= carouselImages.length - 1) {
                setSlideIndex(1);
            }
            if (slideIndex <= 0) {
                setSlideIndex(carouselImages.length - 2);
            }
        };
        const slider = sliderRef.current;
        if (slider) slider.addEventListener('transitionend', handleTransitionEnd);
        return () => {
            if (slider) slider.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [slideIndex, carouselImages.length]);

    // --- PREVENT OUT-OF-BOUNDS RENDER ---
    if (!home || carouselImages.length < 3) {
        return (
            <>
                <Head title="Welcome" />
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <span className="text-xl font-bold text-gray-600">Loading...</span>
                </div>
            </>
        );
    }

    // Prepare accreditors, programs, videos
    const accreditors = [
        { image: getImageUrl(home.accreditor_image_1), name: home.accreditor_name_1, position: home.accreditor_position_1 },
        { image: getImageUrl(home.accreditor_image_2), name: home.accreditor_name_2, position: home.accreditor_position_2 },
        { image: getImageUrl(home.accreditor_image_3), name: home.accreditor_name_3, position: home.accreditor_position_3 },
        { image: getImageUrl(home.accreditor_image_4), name: home.accreditor_name_4, position: home.accreditor_position_4 },
    ];
    const programs = [
        { image: getImageUrl(home.program_image_1), title: home.program_title_1, description: home.program_description_1 },
        { image: getImageUrl(home.program_image_2), title: home.program_title_2, description: home.program_description_2 },
        { image: getImageUrl(home.program_image_3), title: home.program_title_3, description: home.program_description_3 },
    ];
    const videos = [
        { youtubeId: home.video_youtube_id_1, title: home.video_title_1 },
        { youtubeId: home.video_youtube_id_2, title: home.video_title_2 },
        { youtubeId: home.video_youtube_id_3, title: home.video_title_3 },
    ];

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="home" />

                {/* Main Content */}
                <main className="pt-16 sm:pt-20">
                    {/* Carousel */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <div
                            ref={sliderRef}
                            className={`flex h-full ${isSliding ? 'transition-transform duration-700 ease-in-out' : ''}`}
                            style={{
                                transform: `translateX(-${slideIndex * 100}%)`,
                            }}
                        >
                            {carouselImages.map((item, idx) => (
                                <div key={idx} className="w-full h-full flex-shrink-0 relative">
                                    <img
                                        src={item.src}
                                        alt={item.title || `Carousel ${idx}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 flex items-center justify-center">
                                        <div className="text-center text-white px-4 max-w-6xl mx-auto">
                                            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6">
                                                {item.title}
                                            </h2>
                                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl max-w-4xl mx-auto leading-relaxed">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Slider Controls */}
                        <button
                            onClick={() => { if (!isSliding) setSlideIndex(slideIndex - 1); setIsSliding(true); }}
                            className="absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                        </button>
                        <button
                            onClick={() => { if (!isSliding) setSlideIndex(slideIndex + 1); setIsSliding(true); }}
                            className="absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110"
                        >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                        </button>
                        {/* Slider Indicators */}
                        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
                            {[0, 1, 2, 3].map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { if (!isSliding) setSlideIndex(idx + 1); setIsSliding(true); }}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                                        slideIndex === idx + 1 
                                            ? 'bg-white scale-110' 
                                            : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Accreditors */}
                    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-gray-50">
                        <div className="w-full max-w-8xl mx-auto text-center">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 sm:mb-12 lg:mb-16" style={{ color: COLORS.primaryMaroon }}>
                                Welcome PUP Calauan Accreditors
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
                                {accreditors.map((accreditor, idx) => (
                                    <div key={idx} className="text-center">
                                        <img
                                            src={accreditor.image}
                                            alt={accreditor.name}
                                            className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 xl:w-48 xl:h-48 mx-auto rounded-full shadow-lg border-4"
                                            style={{ borderColor: COLORS.softYellow }}
                                        />
                                        <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 mb-1 sm:mb-2" style={{ color: COLORS.darkMaroon }}>{accreditor.name}</h3>
                                        <p className="text-base sm:text-lg lg:text-xl" style={{ color: COLORS.burntOrange }}>{accreditor.position}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Director */}
                    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-white via-gray-100 to-white">
                        <div className="w-full max-w-8xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8" style={{ color: COLORS.primaryMaroon }}>
                                        Message from the Director
                                    </h2>
                                    <div className="space-y-4 sm:space-y-6 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                                        <p>{home.director_message}</p>
                                    </div>
                                    <div className="mt-6 sm:mt-8">
                                        <p className="font-bold text-xl sm:text-2xl text-gray-900">{home.director_name}</p>
                                        <p className="text-lg sm:text-xl" style={{ color: COLORS.burntOrange }}>{home.director_position}</p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <img
                                        src={getImageUrl(home.director_image)}
                                        alt="Campus Director"
                                        className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto rounded-2xl shadow-xl border-4"
                                        style={{ borderColor: COLORS.softYellow, height: 'auto', aspectRatio: '3/4', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Videos */}
                    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12" style={{ backgroundColor: COLORS.primaryMaroon }}>
                        <div className="w-full max-w-8xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-white">
                                {home.videos_section_title || 'Campus Videos'}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                                {videos.map((video, idx) => (
                                    <div key={idx} className="group cursor-pointer">
                                        <div className="relative rounded-2xl overflow-hidden shadow-lg">
                                            <iframe
                                                width="100%"
                                                height="220"
                                                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-48 sm:h-56 lg:h-60 object-cover"
                                            />
                                        </div>
                                        <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl lg:text-2xl font-bold text-white">{video.title}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Programs */}
                    <section id="programs" className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-8xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 lg:mb-16" style={{ color: COLORS.primaryMaroon }}>
                                {home.programs_section_title || 'Programs Under Survey'}
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                                {programs.map((program, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4" style={{ borderTopColor: COLORS.primaryMaroon }}>
                                        <img
                                            src={program.image}
                                            alt={program.title}
                                            className="w-full h-48 sm:h-56 lg:h-60 object-cover"
                                        />
                                        <div className="p-6 sm:p-8">
                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4" style={{ color: COLORS.primaryMaroon }}>
                                                {program.title}
                                            </h3>
                                            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                                                {program.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan Section */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={getImageUrl(home.mula_sayo_image)}
                                alt="Mula Sayo, Para Sa Bayan"
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4">
                                Mula Sayo, Para Sa Bayan
                            </h2>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
            <style jsx>{`
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
            `}</style>
        </>
    );
}