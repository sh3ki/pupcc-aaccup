import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRef, useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface FacultyMember {
    id?: number;
    name: string;
    image: string;
}

interface BsitContent {
    hero_image: string;
    hero_title: string;
    hero_subtitle: string;
    faculty_section_title: string;
    faculty_data: FacultyMember[];
    mula_sayo_title: string;
    mula_sayo_image: string;
}

interface Props {
    bsitContent: BsitContent;
}

// Enhanced scroll animation hook
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
        
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        
        return () => { 
            if (currentRef) observer.unobserve(currentRef); 
        };
    }, [hasAnimated]);
    
    return [ref, isVisible] as const;
}

export default function BSITFaculty({ bsitContent }: Props) {
    const [facultyRef, facultyVisible] = useScrollAnimation();

    return (
        <>
            <Head title="BSIT Faculty" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="bsit" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <div className="absolute inset-0">
                            <img
                                src={bsitContent.hero_image || "/api/placeholder/1600/800"}
                                alt="BSIT Faculty"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 animate-fade-in-up transform transition-all duration-300 hover:scale-102 text-shadow-lg">
                                {bsitContent.hero_title}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102 text-shadow-lg">
                                {bsitContent.hero_subtitle}
                            </p>
                        </div>
                    </section>

                    {/* Faculty Members Section */}
                    <section
                        ref={facultyRef}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            facultyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-28'
                        }`}
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
                                {bsitContent.faculty_section_title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
                                {bsitContent.faculty_data?.map((member, index) => (
                                    <div
                                        key={index}
                                        className={`text-center transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                                            facultyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{ transitionDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 hover:shadow-xl transition-all duration-500 group h-full flex flex-col" style={{ borderTopColor: COLORS.primaryMaroon }}>
                                            <div className="relative mb-4 sm:mb-6 group/image">
                                                <img
                                                    src={member.image || "/api/placeholder/300/400"}
                                                    alt={member.name}
                                                    className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 mx-auto rounded-full shadow-lg border-4 group-hover/image:shadow-xl transition-all duration-300 group-hover/image:scale-105"
                                                    style={{ borderColor: COLORS.primaryMaroon }}
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
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={bsitContent.mula_sayo_image || "/api/placeholder/1600/400"}
                                alt="Mula Sayo, Para Sa Bayan"
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
