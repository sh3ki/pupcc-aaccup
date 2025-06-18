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

export default function Certificate() {
    // Placeholder: In production, fetch from admin panel
    const certificateUrl = "/api/placeholder/900x1200?text=Certificate+of+Authenticity";

    return (
        <>
            <Head title="Certificate of Authenticity" />
            <div className="min-h-screen bg-white overflow-x-hidden">
                <Header currentPage="certificate" />

                <main className="pt-16 sm:pt-20">
                    {/* Hero Section */}
                    <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                        <img
                            src="/api/placeholder/1600/500?text=Certificate+of+Authenticity"
                            alt="Certificate Hero"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            style={{ minHeight: 400, maxHeight: 700 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white animate-fade-in-up mb-4 drop-shadow-lg">
                                Certificate of Authenticity
                            </h1>
                            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 animate-fade-in-up animation-delay-300 max-w-2xl mx-auto">
                                Official proof of authenticity for PUP Calauan documentation
                            </p>
                        </div>
                    </section>

                    {/* Certificate Display */}
                    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white">
                        <div className="w-full max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-t-4" style={{ borderTopColor: COLORS.primaryMaroon }}>
                                <div className="p-8 sm:p-12 flex flex-col items-center">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 text-center" style={{ color: COLORS.primaryMaroon }}>
                                        Certificate Preview
                                    </h2>
                                    {/* Consistent certificate image size and style */}
                                    <div className="w-full flex justify-center items-center min-h-[400px] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                                        <img
                                            src={certificateUrl}
                                            alt="Certificate of Authenticity"
                                            className="max-h-[600px] sm:max-h-[700px] w-auto mx-auto rounded-2xl shadow-lg object-contain"
                                            style={{ maxWidth: '100%' }}
                                        />
                                    </div>
                                    <p className="mt-6 text-sm text-gray-500 text-center">
                                        (This is a placeholder. The certificate can be updated via the admin panel.)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

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

                <Footer />
            </div>
            <style jsx>{`
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
                .text-shadow-lg {
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
                }
            `}</style>
        </>
    );
}
