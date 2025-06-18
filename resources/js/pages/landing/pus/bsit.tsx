import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from '@inertiajs/react';
import { useRef, useEffect, useState } from 'react';

const COLORS = {
    primaryMaroon: '#7F0404',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    darkMaroon: '#4D1414',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

const program = {
    name: 'Bachelor of Science in Information Technology (BSIT)',
    heroImage: '/api/placeholder/1600/600',
    overview: 'The BSIT program provides a comprehensive education in software development, networking, and system administration, with hands-on laboratory experience.',
    objectives: [
        'Equip students with advanced IT knowledge and skills.',
        'Develop problem-solving and analytical thinking in computing.',
        'Promote research and innovation in information technology.',
        'Prepare graduates for industry certifications and employment.',
        'Foster ethical responsibility and leadership in IT practice.',
    ],
    avpYoutubeId: 'dQw4w9WgXcQ',
    activities: [
        '/api/placeholder/400/300',
        '/api/placeholder/400/300',
        '/api/placeholder/400/300',
        '/api/placeholder/400/300',
    ],
    graduates: [
        {
            name: 'Engr. John IT Specialist',
            video: '/api/placeholder/400/250',
        },
    ],
    accreditationAreas: [
        { id: 1, title: 'Area I: Vision, Mission, Goals and Objectives', image: '/api/placeholder/300/200' },
        { id: 2, title: 'Area II: Faculty', image: '/api/placeholder/300/200' },
        { id: 3, title: 'Area III: Curriculum and Instruction', image: '/api/placeholder/300/200' },
        { id: 4, title: 'Area IV: Support to Students', image: '/api/placeholder/300/200' },
        { id: 5, title: 'Area V: Research', image: '/api/placeholder/300/200' },
        { id: 6, title: 'Area VI: Extension and Community Involvement', image: '/api/placeholder/300/200' },
        { id: 7, title: 'Area VII: Library', image: '/api/placeholder/300/200' },
        { id: 8, title: 'Area VIII: Physical Plant and Facilities', image: '/api/placeholder/300/200' },
        { id: 9, title: 'Area IX: Laboratories', image: '/api/placeholder/300/200' },
        { id: 10, title: 'Area X: Administration', image: '/api/placeholder/300/200' },
    ],
};

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

export default function BSITProgramPage() {
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
                            src={program.heroImage}
                            alt={program.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            style={{ minHeight: 400, maxHeight: 700 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white animate-fade-in-up mb-4 drop-shadow-lg">
                                {program.name}
                            </h1>
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
                                    Program Overview
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-700 mb-4">{program.overview}</p>
                            </div>
                            <div className="flex-1">
                                <img src="/api/placeholder/500/400" alt="BSIT Overview" className="rounded-2xl shadow-lg w-full object-cover" style={{ minHeight: 260, maxHeight: 400 }} />
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
                                Program Objectives
                            </h2>
                            <ol className="list-decimal ml-6 space-y-3 text-lg text-gray-800">
                                {program.objectives.map((obj, idx) => (
                                    <li key={idx}>{obj}</li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    {/* AVP Section */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                Program AVP
                            </h2>
                            <div className="aspect-w-16 aspect-h-9 w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mx-auto mb-4" style={{ maxWidth: 800, height: 450 }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${program.avpYoutubeId}`}
                                    title="Program AVP"
                                    frameBorder={0}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </div>
                    </section>

                    {/* Program in Action */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12" style={{ backgroundColor: '#f8fafc' }}>
                        <div className="w-full max-w-6xl mx-auto">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                Program in Action
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {program.activities.map((img, idx) => (
                                    <div key={idx} className="rounded-xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-105">
                                        <img src={img} alt={`Activity ${idx + 1}`} className="w-full h-36 object-cover" style={{ minHeight: 144, maxHeight: 144 }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Notable Graduates */}
                    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primaryMaroon }}>
                                Notable Graduates
                            </h2>
                            <div className="flex flex-col items-center gap-6">
                                {program.graduates.map((grad, idx) => (
                                    <div key={idx} className="w-full flex flex-col items-center">
                                        <div className="w-full bg-gray-200 rounded-xl overflow-hidden shadow-lg mb-2" style={{ maxWidth: 500, height: 280 }}>
                                            <img src={grad.video} alt={grad.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-semibold text-lg" style={{ color: COLORS.primaryMaroon }}>{grad.name}</span>
                                    </div>
                                ))}
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
                                Accreditation Areas
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {program.accreditationAreas.map((area, idx) => (
                                    <div key={area.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
                                        style={{ borderTopColor: COLORS.primaryMaroon, transitionDelay: `${idx * 0.1}s` }}>
                                        <img src={area.image} alt={area.title} className="w-full h-28 object-cover" style={{ minHeight: 112, maxHeight: 112 }} />
                                        <div className="p-4 flex flex-col items-center">
                                            <h3 className="text-base font-bold text-center mb-2" style={{ color: COLORS.primaryMaroon }}>{area.title}</h3>
                                            <button className="px-4 py-1 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
                                                style={{ backgroundColor: COLORS.primaryMaroon }}>
                                                View Area
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src="/api/placeholder/1600/400"
                                alt="Mula Sayo, Para Sa Bayan"
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
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