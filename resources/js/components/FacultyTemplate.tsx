import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRef, useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface FacultyMember {
    id: number;
    name: string;
    title: string;
    position: string;
    image: string;
    email?: string;
    phone?: string;
    office?: string;
    qualifications?: string[];
    specializations?: string[];
}

interface FacultyTemplateProps {
    pageTitle: string;
    programName: string;
    programDescription: string;
    heroImage: string;
    primaryColor: string;
    members: FacultyMember[];
    programOverview?: string;
}

// Enhanced scroll animation hook
function useScrollAnimation() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [lastScrollY, setLastScrollY] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

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
    
    return [ref, isVisible, scrollDirection] as const;
}

export default function FacultyTemplate({
    pageTitle,
    programName,
    programDescription,
    heroImage,
    primaryColor,
    members,
    programOverview
}: FacultyTemplateProps) {
    const [heroRef, heroVisible] = useScrollAnimation();
    const [overviewRef, overviewVisible, overviewScrollDirection] = useScrollAnimation();
    const [facultyRef, facultyVisible, facultyScrollDirection] = useScrollAnimation();

    return (
        <>
            <Head title={`${pageTitle}`} />
            <div className="min-h-screen bg-white">
                <Header currentPage="about" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section */}
                    <section 
                        ref={heroRef}
                        className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
                    >
                        <div className="absolute inset-0">
                            <img
                                src={heroImage}
                                alt={programName}
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
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 animate-fade-in-up transform transition-all duration-300 hover:scale-102">
                                {programName}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102">
                                {programDescription}
                            </p>
                        </div>
                    </section>

                    {/* Program Overview Section */}
                    {programOverview && (
                        <section
                            ref={overviewRef}
                            className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                                overviewVisible 
                                    ? 'opacity-100 translate-y-0 translate-x-0' 
                                    : overviewScrollDirection === 'down' 
                                        ? 'opacity-0 translate-y-20 translate-x-10' 
                                        : 'opacity-0 -translate-y-20 -translate-x-10'
                            }`}
                            style={{ backgroundColor: '#f8fafc' }}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor} 2px, transparent 2px)`,
                                    backgroundSize: '50px 50px'
                                }}></div>
                            </div>
                            
                            <div className="w-full max-w-6xl mx-auto text-center relative z-10">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 transition-all duration-500 hover:scale-102" style={{ color: primaryColor }}>
                                    Program Overview
                                </h2>
                                <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto transition-all duration-300 hover:text-gray-900 transform hover:scale-102">
                                    {programOverview}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Faculty Members Section */}
                    <section
                        ref={facultyRef}
                        className={`py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden ${
                            facultyVisible 
                                ? 'opacity-100 translate-y-0' 
                                : facultyScrollDirection === 'down' 
                                    ? 'opacity-0 translate-y-28' 
                                    : 'opacity-0 -translate-y-28'
                        }`}
                        style={{ 
                            background: `linear-gradient(135deg, ${COLORS.almostWhite} 0%, #f1f5f9 50%, ${COLORS.almostWhite} 100%)`
                        }}
                    >
                        {/* Geometric Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: primaryColor }}></div>
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        </div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-300 hover:scale-102" style={{ color: primaryColor }}>
                                Faculty Members
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
                                {members.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={`bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-3 group ${
                                            facultyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                                        }`}
                                        style={{ 
                                            borderTopColor: primaryColor,
                                            transitionDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg sm:text-xl font-bold mb-2 transition-all duration-300 group-hover:scale-105" style={{ color: primaryColor }}>
                                                {member.name}
                                            </h3>
                                            <p className="text-sm sm:text-base font-medium text-gray-600 mb-1">
                                                {member.title}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-4">
                                                {member.position}
                                            </p>
                                            
                                            {/* Contact Information */}
                                            <div className="space-y-2 mb-4">
                                                {member.email && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Mail className="w-3 h-3 mr-2" style={{ color: primaryColor }} />
                                                        <span className="truncate">{member.email}</span>
                                                    </div>
                                                )}
                                                {member.phone && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone className="w-3 h-3 mr-2" style={{ color: primaryColor }} />
                                                        <span>{member.phone}</span>
                                                    </div>
                                                )}
                                                {member.office && (
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <MapPin className="w-3 h-3 mr-2" style={{ color: primaryColor }} />
                                                        <span>{member.office}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Qualifications */}
                                            {member.qualifications && member.qualifications.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">Qualifications:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.qualifications.slice(0, 2).map((qual, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 rounded-full text-white"
                                                                style={{ backgroundColor: primaryColor }}
                                                            >
                                                                {qual}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Specializations */}
                                            {member.specializations && member.specializations.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">Specializations:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {member.specializations.slice(0, 2).map((spec, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 rounded-full border"
                                                                style={{ 
                                                                    borderColor: primaryColor,
                                                                    color: primaryColor
                                                                }}
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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
