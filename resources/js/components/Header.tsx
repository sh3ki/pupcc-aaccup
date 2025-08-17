import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

interface NavItem {
    name: string;
    href: string;
    isActive?: boolean;
    hasDropdown?: boolean;
    dropdownItems?: DropdownItem[];
}

interface DropdownItem {
    name: string;
    href: string;
    description: string;
    isActive?: boolean;
}

interface HeaderProps {
    currentPage?: string;
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
    const [exhibitDropdownOpen, setExhibitDropdownOpen] = useState(false);
    const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
    const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
    const [mobileExhibitOpen, setMobileExhibitOpen] = useState(false);

    // Faculty dropdown items
    const facultyDropdownItems: DropdownItem[] = [
        { 
            name: 'Accreditation Task Force', 
            href: '/faculty/accreditation', 
            description: '', // Remove description
            isActive: currentPage === 'accreditation'
        },
        { 
            name: 'BTLED Faculty', 
            href: '/faculty/btled', 
            description: '', // Remove description
            isActive: currentPage === 'btled'
        },
        { 
            name: 'BSENT Faculty', 
            href: '/faculty/bsent', 
            description: '', // Remove description
            isActive: currentPage === 'bsent'
        },
        { 
            name: 'BSIT Faculty', 
            href: '/faculty/bsit', 
            description: '', // Remove description
            isActive: currentPage === 'bsit'
        },
    ];

    // Programs dropdown items
    const programsDropdownItems: DropdownItem[] = [
        { 
            name: 'BTLED Program', 
            href: '/programs/btled', 
            description: '',
            isActive: currentPage === 'btled-program'
        },
        { 
            name: 'BSENT Program', 
            href: '/programs/bsent', 
            description: '',
            isActive: currentPage === 'bsent-program'
        },
        { 
            name: 'BSIT Program', 
            href: '/programs/bsit', 
            description: '',
            isActive: currentPage === 'bsit-program'
        },
    ];

    // Exhibit dropdown items
    const exhibitDropdownItems: DropdownItem[] = [
        { name: "Citizen's Charter", href: "/exhibit/citizens-charter", description: "" },
        { name: "Student Handbook", href: "/exhibit/student-handbook", description: "" },
        { name: "University Code", href: "/exhibit/university-code", description: "" },
        { name: "University Policies & Guidelines", href: "/exhibit/university-policies", description: "" },
        { name: "OBE Syllabi", href: "/exhibit/obe-syllabi", description: "" },
        { name: "Instructional Materials", href: "/exhibit/instructional-materials", description: "" },
        { name: "Faculty Manual", href: "/exhibit/faculty-manual", description: "" },
        { name: "Administrative Manual", href: "/exhibit/administrative-manual", description: "" },
        { name: "CHED Memorandum Order", href: "/exhibit/ched-memorandum-order", description: "" },
        { name: "Licensure", href: "/exhibit/licensure", description: "" },
    ];

    // Check if any faculty page is active
    const isFacultyPageActive = facultyDropdownItems.some(item => item.isActive);
    // Check if any program page is active
    const isProgramPageActive = programsDropdownItems.some(item => item.isActive);

    // Navigation items
    const navItems: NavItem[] = [
        { name: 'Home', href: '/', isActive: currentPage === 'home' },
        { 
            name: 'About', 
            href: '/about', 
            isActive: currentPage === 'about' || isFacultyPageActive,
            hasDropdown: true,
            dropdownItems: facultyDropdownItems
        },
        { name: 'Certificate of Authenticity', href: '/certificate', isActive: currentPage === 'certificate' },
        { 
            name: 'Programs Under Survey', 
            href: '/programs', 
            isActive: currentPage === 'programs' || isProgramPageActive,
            hasDropdown: true,
            dropdownItems: programsDropdownItems
        },
        { 
            name: 'Exhibit', 
            href: '/exhibit', 
            isActive: currentPage === 'exhibit',
            hasDropdown: true,
            dropdownItems: exhibitDropdownItems
        },
    ];

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setAboutDropdownOpen(false);
            setProgramsDropdownOpen(false);
            setExhibitDropdownOpen(false);
        };
        if (aboutDropdownOpen || programsDropdownOpen || exhibitDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [aboutDropdownOpen, programsDropdownOpen, exhibitDropdownOpen]);

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
                isScrolled 
                    ? 'bg-white/95 backdrop-blur-md shadow-lg border-b-2' 
                    : 'bg-white shadow-md border-b-2'
            }`}
            style={{ borderBottomColor: COLORS.primaryMaroon }}
        >
            <div className="w-full px-2 sm:px-3 lg:px-4 xl:px-6">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo and Text */}
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 min-w-0 flex-shrink-0">
                        <div className="flex-shrink-0">
                            <img src="/favicon.svg" alt="PUP Logo" className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 transition-transform duration-300 hover:scale-105" />
                        </div>
                        <div className="flex items-center">
                            {/* Mobile Title */}
                            <div className="sm:hidden min-w-0">
                                <h1 className="text-xs font-bold text-gray-900 leading-tight">Polytechnic University of the Philippines</h1>
                                <p className="text-xs font-medium leading-tight" style={{ color: COLORS.primaryMaroon }}>Calauan Campus</p>
                            </div>
                            {/* Desktop Title */}
                            <div className="hidden sm:block min-w-0">
                                <h1 className="text-xs sm:text-sm lg:text-lg xl:text-xl font-bold text-gray-900 leading-tight">Polytechnic University of the Philippines</h1>
                                <p className="text-xs sm:text-xs lg:text-sm xl:text-base font-medium leading-tight" style={{ color: COLORS.primaryMaroon }}>Calauan Campus</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation - Enhanced with dropdown */}
                    <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 2xl:space-x-4 flex-1 justify-center mx-2">
                        {navItems.map((item) => (
                            <div key={item.name} className="relative">
                                {item.hasDropdown ? (
                                    <div
                                        className="relative"
                                        onMouseEnter={() => {
                                            if (item.name === 'About') {
                                                setAboutDropdownOpen(true);
                                            } else if (item.name === 'Programs Under Survey') {
                                                setProgramsDropdownOpen(true);
                                            } else if (item.name === 'Exhibit') {
                                                setExhibitDropdownOpen(true);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            if (item.name === 'About') {
                                                setAboutDropdownOpen(false);
                                            } else if (item.name === 'Programs Under Survey') {
                                                setProgramsDropdownOpen(false);
                                            } else if (item.name === 'Exhibit') {
                                                setExhibitDropdownOpen(false);
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`relative px-1 xl:px-2 py-2 text-xs 2xl:text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap group flex items-center ${
                                                item.isActive
                                                    ? 'text-gray-900'
                                                    : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                        >
                                            <span className="relative z-10">{item.name}</span>
                                            <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${
                                                (item.name === 'About' && aboutDropdownOpen) || 
                                                (item.name === 'Programs Under Survey' && programsDropdownOpen) ||
                                                (item.name === 'Exhibit' && exhibitDropdownOpen)
                                                    ? 'rotate-180' : ''
                                            }`} />
                                            {/* Enhanced underline effect for active state */}
                                            <div 
                                                className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ease-in-out ${
                                                    item.isActive 
                                                        ? 'scale-x-100 opacity-100 shadow-sm' 
                                                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                                }`}
                                                style={{ 
                                                    backgroundColor: COLORS.primaryMaroon,
                                                    boxShadow: item.isActive ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                                }}
                                            ></div>
                                        </Link>
                                        
                                        {/* Desktop Dropdown */}
                                        <div
                                            className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-auto min-w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
                                                (item.name === 'About' && aboutDropdownOpen) || 
                                                (item.name === 'Programs Under Survey' && programsDropdownOpen) ||
                                                (item.name === 'Exhibit' && exhibitDropdownOpen)
                                                    ? 'opacity-100 translate-y-0 visible' 
                                                    : 'opacity-0 -translate-y-2 invisible'
                                            }`}
                                            style={{ 
                                                borderTop: `3px solid ${COLORS.primaryMaroon}`,
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        >
                                            <div className="p-2">
                                                {item.dropdownItems?.map((dropdownItem, index) => (
                                                    <Link
                                                        key={dropdownItem.name}
                                                        href={dropdownItem.href}
                                                        className={`block px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap ${
                                                            dropdownItem.isActive
                                                                ? 'bg-gray-50'
                                                                : 'hover:bg-gray-50'
                                                        }`}
                                                        onClick={() => {
                                                            setAboutDropdownOpen(false);
                                                            setProgramsDropdownOpen(false);
                                                            setExhibitDropdownOpen(false);
                                                        }}
                                                    >
                                                        <h4 className={`text-sm font-semibold transition-all duration-300 ${
                                                            dropdownItem.isActive ? 'text-gray-900' : 'text-gray-800 group-hover/item:text-gray-900'
                                                        }`} 
                                                        style={{ 
                                                            color: dropdownItem.isActive ? COLORS.primaryMaroon : undefined 
                                                        }}>
                                                            {dropdownItem.name}
                                                        </h4>
                                                        {/* Simple underline for active state */}
                                                        {dropdownItem.isActive && (
                                                            <div 
                                                                className="absolute bottom-1 left-4 right-4 h-0.5"
                                                                style={{ backgroundColor: COLORS.primaryMaroon }}
                                                            ></div>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`relative px-1 xl:px-2 py-2 text-xs 2xl:text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap group flex items-center ${
                                            item.isActive
                                                ? 'text-gray-900'
                                                : 'text-gray-700 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className="relative z-10">{item.name}</span>
                                        {/* Enhanced underline effect */}
                                        <div 
                                            className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ease-in-out ${
                                                item.isActive 
                                                    ? 'scale-x-100 opacity-100 shadow-sm' 
                                                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                            }`}
                                            style={{ 
                                                backgroundColor: COLORS.primaryMaroon,
                                                boxShadow: item.isActive ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                            }}
                                        ></div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Login and Hamburger - Always visible, side by side, no overlap */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Link
                            href="/login"
                            className="relative px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center"
                            style={{ backgroundColor: COLORS.primaryMaroon }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.darkMaroon;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.primaryMaroon;
                            }}
                        >
                            <span className="relative z-10">Login</span>
                        </Link>
                        {/* Hamburger menu button - always visible on mobile, hidden on lg+ */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center justify-center"
                            style={{ color: COLORS.primaryMaroon }}
                            aria-label="Open menu"
                        >
                            <div className="w-5 h-5 flex flex-col justify-center items-center">
                                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation - Enhanced with dropdown */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-96 py-3' : 'max-h-0'}`}
                    style={isMenuOpen ? { maxHeight: '40vh', overflowY: 'auto' } : {}}
                >
                    <div className="flex flex-col space-y-1">
                        {navItems.map((item, index) => (
                            <div key={item.name}>
                                {item.hasDropdown ? (
                                    <div>
                                        <div 
                                            className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group flex items-center justify-between cursor-pointer ${
                                                item.isActive
                                                    ? 'text-gray-900 bg-gray-50'
                                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                            style={{
                                                animationDelay: `${index * 0.1}s`,
                                            }}
                                            onClick={() => {
                                                if (item.name === 'About') {
                                                    setMobileAboutOpen(!mobileAboutOpen);
                                                } else if (item.name === 'Programs Under Survey') {
                                                    setMobileProgramsOpen(!mobileProgramsOpen);
                                                } else if (item.name === 'Exhibit') {
                                                    setMobileExhibitOpen(!mobileExhibitOpen);
                                                }
                                            }}
                                        >
                                            <span>{item.name}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                                (item.name === 'About' && mobileAboutOpen) || 
                                                (item.name === 'Programs Under Survey' && mobileProgramsOpen) ||
                                                (item.name === 'Exhibit' && mobileExhibitOpen)
                                                    ? 'rotate-180' : ''
                                            }`} />
                                            <div 
                                                className={`absolute bottom-1 left-3 right-3 h-0.5 transition-all duration-300 ${
                                                    item.isActive 
                                                        ? 'scale-x-100 opacity-100' 
                                                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                                }`}
                                                style={{ backgroundColor: COLORS.primaryMaroon }}
                                            ></div>
                                        </div>
                                        
                                        {/* Mobile Dropdown */}
                                        <div className={`overflow-hidden transition-all duration-300 ${
                                            (item.name === 'About' && mobileAboutOpen) || 
                                            (item.name === 'Programs Under Survey' && mobileProgramsOpen) ||
                                            (item.name === 'Exhibit' && mobileExhibitOpen)
                                                ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                            <Link
                                                href={item.href}
                                                className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {item.name === 'About' ? 'About Overview' : item.name === 'Programs Under Survey' ? 'Programs Overview' : 'Exhibit Overview'}
                                            </Link>
                                            {item.dropdownItems?.map((dropdownItem) => (
                                                <Link
                                                    key={dropdownItem.name}
                                                    href={dropdownItem.href}
                                                    className={`block px-6 py-2 text-sm transition-all duration-300 ${
                                                        dropdownItem.isActive
                                                            ? 'text-gray-900 bg-red-50 border-l-4 font-medium'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                    style={{
                                                        borderLeftColor: dropdownItem.isActive ? COLORS.primaryMaroon : 'transparent'
                                                    }}
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {dropdownItem.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group ${
                                            item.isActive
                                                ? 'text-gray-900 bg-gray-50'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                        style={{
                                            animationDelay: `${index * 0.1}s`,
                                        }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                        <div 
                                            className={`absolute bottom-1 left-3 right-3 h-0.5 transition-all duration-300 ${
                                                item.isActive 
                                                    ? 'scale-x-100 opacity-100' 
                                                    : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                            }`}
                                            style={{ backgroundColor: COLORS.primaryMaroon }}
                                        ></div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
