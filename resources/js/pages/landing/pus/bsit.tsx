import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRef, useEffect, useState } from 'react';

const COLORS = {
    primaryMaroon: '#7F0404',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    darkMaroon: '#4D1414',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface GraduateItem {
    name: string;
    video: string;
    video_type: 'youtube' | 'upload';
}

interface AccreditationArea {
    title: string;
    image: string;
}

interface BsitContent {
    hero_image: string;
    hero_title: string;
    hero_subtitle: string;
    overview_section_title: string;
    program_description: string;
    program_image: string;
    objectives_section_title: string;
    objectives_data: string[];
    avp_section_title: string;
    program_video: string;
    program_video_type: 'youtube' | 'upload';
    action_section_title: string;
    action_images: string[];
    graduates_section_title: string;
    graduates_data: GraduateItem[];
    accreditation_section_title: string;
    accreditation_areas: AccreditationArea[];
    mula_sayo_title: string;
    mula_sayo_image: string;
}

interface Props {
    bsitContent: BsitContent;
}

// Scroll animation hook
function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = ref.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setIsVisible(true);
                    setHasAnimated(true);
                } else if (!entry.isIntersecting && hasAnimated) {
                    setTimeout(() => {
                        setIsVisible(false);
                        setHasAnimated(false);
                    }, 100);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, [hasAnimated]);
    return [ref, isVisible] as const;
}

export default function BSITProgramPage({ bsitContent }: Props) {
    const [overviewRef, overviewVisible] = useScrollAnimation();
    const [objectivesRef, objectivesVisible] = useScrollAnimation();
    const [areasRef, areasVisible] = useScrollAnimation();

    return (
        <>
            <Head title="BSIT Program" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="bsit-program" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <img
                            src={bsitContent.hero_image || '/api/placeholder/1600/600'}
                            alt={bsitContent.hero_title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            style={{ minHeight: 400, maxHeight: 700 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white animate-fade-in-up mb-4 drop-shadow-lg">
                                {bsitContent.hero_title}
                            </h1>
                            {bsitContent.hero_subtitle && (
                                <p className="text-lg sm:text-xl text-white/90 max-w-3xl px-4 drop-shadow-lg">
                                    {bsitContent.hero_subtitle}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Overview */}
                    <section
                        ref={overviewRef}
                        className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            overviewVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                        style={{ 
                            background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                        }}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.primaryMaroon} 2px, transparent 2px)`,
                                backgroundSize: '50px 50px'
                            }}></div>
                        </div>
                        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
                            <div className="flex-1">
                                <h2 className="text-4xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                    {bsitContent.overview_section_title}
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-700 mb-4">{bsitContent.program_description}</p>
                            </div>
                            <div className="flex-1">
                                <img 
                                    src={bsitContent.program_image || '/api/placeholder/500/400'} 
                                    alt="BSIT Overview" 
                                    className="rounded-2xl shadow-lg w-full object-cover" 
                                    style={{ minHeight: 260, maxHeight: 400 }} 
                                />
                            </div>
                        </div>
                    </section>

                    {/* Objectives */}
                    <section
                        ref={objectivesRef}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 ${
                            objectivesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                    >
                        <div className="w-full max-w-4xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.objectives_section_title}
                            </h2>
                            <ol className="list-decimal ml-6 space-y-3 text-lg text-gray-800">
                                {bsitContent.objectives_data && bsitContent.objectives_data.length > 0 ? (
                                    bsitContent.objectives_data.map((obj, idx) => (
                                        <li key={idx}>{obj}</li>
                                    ))
                                ) : (
                                    <li>No objectives available</li>
                                )}
                            </ol>
                        </div>
                    </section>

                    {/* AVP Section */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.avp_section_title}
                            </h2>
                            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mx-auto mb-4" style={{ maxWidth: 800, height: 450 }}>
                                {bsitContent.program_video_type === 'youtube' ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${bsitContent.program_video}`}
                                        title="Program AVP"
                                        frameBorder={0}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                ) : (
                                    <video
                                        src={bsitContent.program_video}
                                        controls
                                        className="w-full h-full"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Program in Action */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12" style={{ backgroundColor: '#f8fafc' }}>
                        <div className="w-full max-w-6xl mx-auto">
                            <h2 className="text-3xl text-center font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.action_section_title}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {bsitContent.action_images && bsitContent.action_images.length > 0 ? (
                                    bsitContent.action_images.map((img: string, idx: number) => (
                                        <div key={idx} className="rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
                                            <img 
                                                src={img || '/api/placeholder/400/300'} 
                                                alt={`Activity ${idx + 1}`} 
                                                className="w-full h-36 object-cover" 
                                                style={{ minHeight: 200, maxHeight: 200 }} 
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 md:col-span-4 text-center text-gray-500">
                                        No action images available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Notable Graduates */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.graduates_section_title}
                            </h2>
                            <div className="flex flex-col items-center gap-6">
                                {bsitContent.graduates_data && bsitContent.graduates_data.length > 0 ? (
                                    bsitContent.graduates_data.map((grad: GraduateItem, idx: number) => (
                                        <div key={idx} className="w-full flex flex-col items-center">
                                            <div className="w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-2" style={{ maxWidth: 500, height: 280 }}>
                                                {grad.video_type === 'youtube' ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${grad.video}`}
                                                        title={grad.name}
                                                        frameBorder={0}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="w-full h-full"
                                                    ></iframe>
                                                ) : (
                                                    <video
                                                        src={typeof grad.video === 'string' ? grad.video : ''}
                                                        controls
                                                        className="w-full h-full object-cover"
                                                    >
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )}
                                            </div>
                                            <span className="font-semibold text-lg" style={{ color: COLORS.primaryMaroon }}>{grad.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">
                                        No graduates available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Accreditation Areas */}
                    <section
                        ref={areasRef}
                        className={`py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 ${
                            areasVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                        }`}
                        style={{ backgroundColor: '#f8fafc' }}
                    >
                        <div className="w-full max-w-7xl mx-auto">
                            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: COLORS.primaryMaroon }}>
                                {bsitContent.accreditation_section_title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {bsitContent.accreditation_areas && bsitContent.accreditation_areas.length > 0 ? (
                                    bsitContent.accreditation_areas.map((area: AccreditationArea, idx: number) => (
                                        <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
                                            style={{ borderTopColor: COLORS.primaryMaroon, transitionDelay: `${idx * 0.1}s` }}>
                                            <img 
                                                src={area.image || '/api/placeholder/300/200'} 
                                                alt={area.title} 
                                                className="w-full h-28 object-cover" 
                                                style={{ minHeight: 112, maxHeight: 112 }} 
                                            />
                                            <div className="p-4 flex flex-col items-center">
                                                <h3 className="text-base font-bold text-center mb-2" style={{ color: COLORS.primaryMaroon }}>{area.title}</h3>
                                                <button className="px-4 py-1 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
                                                    style={{ backgroundColor: COLORS.primaryMaroon }}>
                                                    View Area
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5 text-center text-gray-500">
                                        No accreditation areas available
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={bsitContent.mula_sayo_image || '/api/placeholder/1600/400'}
                                alt={bsitContent.mula_sayo_title}
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {bsitContent.mula_sayo_title}
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
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px);}
                    to { opacity: 1; transform: translateY(0);}
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </>
    );
}