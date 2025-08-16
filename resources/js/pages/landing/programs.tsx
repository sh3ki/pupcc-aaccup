import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from '@inertiajs/react';
import { useRef, useEffect, useState } from 'react';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface ProgramItem {
    image: string;
    title: string;
    short: string;
    description: string;
    href: string;
}

interface ProgramsContent {
    hero_image: string;
    hero_title: string;
    hero_subtitle: string;
    programs_section_title: string;
    programs_data: ProgramItem[];
    mula_sayo_title: string;
    mula_sayo_image: string;
}

interface Props {
    programsContent: ProgramsContent;
}

// Scroll animation hook
function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
        if (ref.current) observer.observe(ref.current);
        return () => { if (ref.current) observer.unobserve(ref.current); };
    }, [hasAnimated]);
    return [ref, isVisible] as const;
}

export default function ProgramsPage({ programsContent }: Props) {
    const [cardsRef, cardsVisible] = useScrollAnimation();

    return (
        <>
            <Head title="Programs Under Survey" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="programs" />

                <main className="pt-16 sm:pt-20">
                    {/* Banner */}
                                        {/* Banner */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <img
                            src={programsContent.hero_image || "/api/placeholder/1600/600"}
                            alt="Programs Banner"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 animate-fade-in-up transform transition-all duration-300 hover:scale-102">
                                {programsContent.hero_title || 'Programs Under Survey'}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed text-white animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102 px-4">
                                {programsContent.hero_subtitle || 'Comprehensive programs designed to meet industry standards and educational excellence.'}
                            </p>
                        </div>
                    </section>

                    {/* Program Cards */}
                    <section
                        ref={cardsRef}
                        className={`py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
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
                        <div className="w-full max-w-7xl mx-auto relative z-10">
                            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16" style={{ color: COLORS.primaryMaroon }}>
                                {programsContent.programs_section_title || 'Our Programs'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {programsContent.programs_data?.map((program, idx) => (
                                    <Link
                                        key={idx}
                                        href={program.href}
                                        className={`group block bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                                            cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{
                                            borderTopColor: COLORS.primaryMaroon,
                                            transitionDelay: `${idx * 0.12}s`
                                        }}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={program.image || "/api/placeholder/600/400"}
                                                alt={program.title}
                                                className="w-full h-[260px] object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-8 flex flex-col h-full">
                                            <h2 className="text-2xl font-bold mb-3 transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                {program.title}
                                            </h2>
                                            <p className="text-lg text-gray-700 mb-6 flex-1 transition-all duration-300 group-hover:text-gray-900">
                                                {program.description}
                                            </p>
                                            <span className="inline-block mt-auto px-6 py-2 rounded-lg font-bold text-white transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: COLORS.primaryMaroon }}>
                                                View Program
                                            </span>
                                        </div>
                                    </Link>
                                )) || []}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan Section */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={programsContent.mula_sayo_image || "/api/placeholder/1600/400"}
                                alt="Mula Sayo, Para Sa Bayan"
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {programsContent.mula_sayo_title || 'Mula Sayo, Para Sa Bayan'}
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
                    from { opacity: 0; transform: translateY(30px);}
                    to { opacity: 1; transform: translateY(0);}
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
