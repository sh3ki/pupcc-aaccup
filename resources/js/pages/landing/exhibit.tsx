import { Head } from '@inertiajs/react';
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

const exhibitItems = [
    { name: "Citizen's Charter", image: "/api/placeholder/400/250", description: "View the Citizen's Charter." },
    { name: "Student Handbook", image: "/api/placeholder/400/250", description: "Access the Student Handbook." },
    { name: "University Code", image: "/api/placeholder/400/250", description: "Read the University Code." },
    { name: "University Policies & Guidelines", image: "/api/placeholder/400/250", description: "Policies and guidelines for the university." },
    { name: "OBE Syllabi", image: "/api/placeholder/400/250", description: "Outcomes-Based Education syllabi." },
    { name: "Instructional Materials", image: "/api/placeholder/400/250", description: "Instructional materials for faculty and students." },
    { name: "Faculty Manual", image: "/api/placeholder/400/250", description: "Manual for faculty members." },
    { name: "Administrative Manual", image: "/api/placeholder/400/250", description: "Manual for administrative staff." },
    { name: "CHED Memorandum Order", image: "/api/placeholder/400/250", description: "CHED orders and memoranda." },
    { name: "Licensure", image: "/api/placeholder/400/250", description: "Licensure exam information and results." },
];

export default function ExhibitPage() {
    return (
        <>
            <Head title="Exhibit" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="exhibit" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero/Banner */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <img
                            src="/api/placeholder/1600/600"
                            alt="Exhibit Banner"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            style={{ minHeight: 400, maxHeight: 700 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white animate-fade-in-up mb-4 drop-shadow-lg">
                                Exhibit
                            </h1>
                            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 animate-fade-in-up animation-delay-300 max-w-2xl mx-auto">
                                Explore important university documents and resources
                            </p>
                        </div>
                    </section>

                    {/* Exhibit Cards */}
                    <section
                        className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 transition-all duration-1200 relative overflow-hidden"
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
                                University Exhibit Resources
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                                {exhibitItems.map((item, idx) => (
                                    <div
                                        key={item.name}
                                        className="group bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                                        style={{
                                            borderTopColor: COLORS.primaryMaroon,
                                            transitionDelay: `${idx * 0.08}s`
                                        }}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div className="p-6 flex flex-col h-full">
                                            <h3 className="text-xl font-bold mb-2 transition-all duration-300 group-hover:scale-105" style={{ color: COLORS.primaryMaroon }}>
                                                {item.name}
                                            </h3>
                                            <p className="text-base text-gray-700 mb-4 flex-1 transition-all duration-300 group-hover:text-gray-900">
                                                {item.description}
                                            </p>
                                            <button
                                                className="mt-auto px-5 py-2 rounded-lg font-bold text-white transition-all duration-300 group-hover:scale-105"
                                                style={{ backgroundColor: COLORS.primaryMaroon }}
                                                disabled
                                            >
                                                View
                                            </button>
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
