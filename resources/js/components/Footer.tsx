import { Phone, Mail, MapPin } from 'lucide-react';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

export default function Footer() {
    return (
        <footer className="text-white py-8 sm:py-10 lg:py-12" style={{ backgroundColor: COLORS.primaryMaroon }}>
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                            <div className="rounded-full p-0.5 flex items-center justify-center flex-shrink-0">
                                <img src="/favicon.svg" alt="PUP Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold leading-tight">Polytechnic University of the Philippines</h3>
                                <p className="text-sm sm:text-base font-medium leading-tight" style={{ color: COLORS.softYellow }}>Calauan Campus</p>
                            </div>
                        </div>
                        <p className="text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed max-w-md">
                            Committed to providing quality education and developing competent professionals who can contribute to national development.
                        </p>
                    </div>
                    <div className="col-span-1">
                        <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg" style={{ color: COLORS.softYellow }}>Contact Info</h4>
                        <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                            <div className="flex items-start space-x-3 group hover:text-yellow-200 transition-colors duration-300">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" />
                                <span className="leading-relaxed">Calauan, Laguna, Philippines</span>
                            </div>
                            <div className="flex items-center space-x-3 group hover:text-yellow-200 transition-colors duration-300">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                <span>(049) 123-4567</span>
                            </div>
                            <div className="flex items-start space-x-3 group hover:text-yellow-200 transition-colors duration-300">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0" />
                                <span className="break-all">info@pupcalauan.edu.ph</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg" style={{ color: COLORS.softYellow }}>Quick Links</h4>
                        <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                            <a href="#" className="block hover:text-yellow-200 transition-all duration-300 hover:translate-x-1 transform">About PUP</a>
                            <a href="#" className="block hover:text-yellow-200 transition-all duration-300 hover:translate-x-1 transform">Admissions</a>
                            <a href="#" className="block hover:text-yellow-200 transition-all duration-300 hover:translate-x-1 transform">Academic Programs</a>
                            <a href="#" className="block hover:text-yellow-200 transition-all duration-300 hover:translate-x-1 transform">Student Services</a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white border-opacity-20 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center text-sm sm:text-base">
                    <p>&copy; 2025 Polytechnic University of the Philippines - Calauan Campus. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
