import { Head } from '@inertiajs/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

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

export default function About() {
    const [aboutData, setAboutData] = useState<AboutData | null>(null);

    // Fetch about data from API
    useEffect(() => {
        fetch('/api/about-content')
            .then(res => res.json())
            .then(data => {
                console.log('About data fetched:', data);
                setAboutData(data);
            })
            .catch(error => {
                console.error('Error fetching about data:', error);
                // Fallback to default data matching original design
                setAboutData({
                    hero_image: '/api/placeholder/1600/800',
                    hero_title: 'About PUP Calauan',
                    hero_subtitle: 'Excellence, Innovation, and Community Service',
                    story_title: 'Our Story',
                    story_content: 'The Polytechnic University of the Philippines - Calauan Campus was established to provide accessible and quality education to the youth of Calauan and nearby towns. Since its founding, PUP Calauan has been committed to academic excellence, community service, and nation-building. The campus continues to grow, offering innovative programs and fostering a culture of learning and inclusivity.',
                    mission_title: 'Our Mission',
                    mission_content: 'To provide quality and inclusive education that empowers students to become competent professionals and responsible citizens.',
                    vision_title: 'Our Vision',
                    vision_content: 'A leading polytechnic university recognized for excellence in education, research, and community service.',
                    faculty_title: 'Our Faculty',
                    faculty_data: [
                        {
                            image: '/api/placeholder/400/300',
                            name: 'Accreditation Task Force',
                            description: 'Leading the accreditation process and ensuring quality standards across all programs.',
                        },
                        {
                            image: '/api/placeholder/400/300',
                            name: 'BTLED Faculty',
                            description: 'Bachelor of Technology and Livelihood Education program faculty and staff.',
                        },
                        {
                            image: '/api/placeholder/400/300',
                            name: 'BSENT Faculty',
                            description: 'Bachelor of Science in Entrepreneurship program faculty and staff.',
                        },
                        {
                            image: '/api/placeholder/400/300',
                            name: 'BSIT Faculty',
                            description: 'Bachelor of Science in Information Technology program faculty and staff.',
                        },
                    ],
                    mula_sayo_title: 'Mula Sayo, Para sa Bayan',
                    mula_sayo_image: '/api/placeholder/1600/400',
                });
            });
    }, []);

    // Show loading state if data is not yet loaded
    if (!aboutData) {
        return (
            <>
                <Head title="About" />
                <div className="min-h-screen bg-white overflow-x-hidden">
                    <Header currentPage="about" />
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading...</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    // Convert faculty data to match original structure for links
    const facultyPrograms = aboutData.faculty_data.map((faculty, index) => ({
        id: index + 1,
        title: faculty.name,
        description: faculty.description,
        image: faculty.image || '/api/placeholder/400/300',
        memberCount: [8, 12, 10, 15][index] || 8, // Default member counts
        href: ['/faculty/accreditation', '/faculty/btled', '/faculty/bsent', '/faculty/bsit'][index] || '/faculty/accreditation',
        color: [COLORS.primaryMaroon, COLORS.burntOrange, COLORS.brightYellow, COLORS.darkMaroon][index % 4],
    }));

    return (
        <>
            <Head title="About">
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
            </Head>
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="about" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section with Background Image */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <div className="absolute inset-0">
                            <img
                                src={aboutData.hero_image || '/api/placeholder/1600/800'}
                                alt="PUP Calauan Campus"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 flex items-center justify-center transition-all duration-300 hover:from-black/35 hover:via-black/55 hover:to-black/75"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 max-w-6xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 animate-fade-in-up transform transition-all duration-300 hover:scale-102">
                                {aboutData.hero_title}
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:scale-102">
                                {aboutData.hero_subtitle}
                            </p>
                        </div>
                    </section>

                    {/* About Section - Enhanced with patterns */}
                    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
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
                                {aboutData.story_title}
                            </h2>
                            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto transition-all duration-300 hover:text-gray-900 transform hover:scale-102">
                                {aboutData.story_content}
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
                                <div className="transition-all duration-300">
                                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border-l-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group" style={{ borderLeftColor: COLORS.primaryMaroon }}>
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: COLORS.softYellow }}>
                                                <span className="text-2xl sm:text-3xl">🎯</span>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                {aboutData.mission_title}
                                            </h3>
                                        </div>
                                        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center transition-all duration-300 group-hover:text-gray-900">
                                            {aboutData.mission_content}
                                        </p>
                                    </div>
                                </div>

                                {/* Vision */}
                                <div className="transition-all duration-300">
                                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border-l-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group" style={{ borderLeftColor: COLORS.burntOrange }}>
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: COLORS.softYellow }}>
                                                <span className="text-2xl sm:text-3xl">🌟</span>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.burntOrange }}>
                                                {aboutData.vision_title}
                                            </h3>
                                        </div>
                                        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center transition-all duration-300 group-hover:text-gray-900">
                                            {aboutData.vision_content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Faculties Section - Enhanced with 4 program cards */}
                    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 relative overflow-hidden" style={{ backgroundColor: 'white' }}>
                        {/* Geometric Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5" style={{ backgroundColor: COLORS.primaryMaroon }}></div>
                            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: COLORS.burntOrange }}></div>
                        </div>
                        
                        <div className="w-full max-w-8xl mx-auto relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-300 hover:scale-102" style={{ color: COLORS.primaryMaroon }}>
                                {aboutData.faculty_title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                                {facultyPrograms.map((program) => (
                                    <Link
                                        key={program.id}
                                        href={program.href}
                                        className="group block transform transition-all duration-700 hover:scale-105 hover:-translate-y-3"
                                    >
                                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col" style={{ borderTopColor: program.color }}>
                                            <div className="relative overflow-hidden">
                                                <img
                                                    src={program.image}
                                                    alt={program.title}
                                                    className="w-full h-48 sm:h-52 lg:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 transition-all duration-300 group-hover:scale-110">
                                                    <span className="text-sm font-bold" style={{ color: program.color }}>
                                                        {program.memberCount} Members
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6 sm:p-8 flex-1 flex flex-col">
                                                <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-105" style={{ color: program.color }}>
                                                    {program.title}
                                                </h3>
                                                <p className="text-base sm:text-lg text-gray-600 leading-relaxed transition-all duration-300 group-hover:text-gray-800 mb-4 flex-1">
                                                    {program.description}
                                                </p>
                                                <div className="flex items-center text-sm font-medium transition-all duration-300 group-hover:scale-105 mt-auto" style={{ color: program.color }}>
                                                    <span>View Faculty</span>
                                                    <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mula Sayo, Para Sa Bayan Section */}
                    <section className="relative py-16 sm:py-20 lg:py-24 px-0">
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={aboutData.mula_sayo_image || '/api/placeholder/1600/400'}
                                alt="Mula Sayo, Para Sa Bayan"
                                className="w-full h-full object-cover object-center opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70"></div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-shadow-lg mb-4 animate-fade-in-up">
                                {aboutData.mula_sayo_title}
                            </h2>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
