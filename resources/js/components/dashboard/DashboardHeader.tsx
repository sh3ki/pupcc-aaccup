import { usePage, Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

const NAVS = {
    admin: [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'User Management', href: '/admin/users' },
        { name: 'Documents', href: '/admin/documents' },
        { name: 'Settings', href: '/admin/settings' },
    ],
    reviewer: [
        { name: 'Dashboard', href: '/reviewer/dashboard' },
        { name: 'Documents', href: '/reviewer/documents' },
        { name: 'Messages', href: '/reviewer/messages' },
        { name: 'Settings', href: '/reviewer/settings' },
    ],
    faculty: [
        { name: 'Dashboard', href: '/faculty/dashboard' },
        { name: 'Documents', href: '/faculty/documents' },
        { name: 'Messages', href: '/faculty/messages' },
        { name: 'Settings', href: '/faculty/settings' },
    ],
};

// Add dropdown items from Header.tsx
const facultyDropdownItems = [
    { name: 'Accreditation Task Force', href: '/about/accreditation', description: '' },
    { name: 'BTLED Faculty', href: '/about/btled', description: '' },
    { name: 'BSENT Faculty', href: '/about/bsent', description: '' },
    { name: 'BSIT Faculty', href: '/about/bsit', description: '' },
];

const programsDropdownItems = [
    { name: 'BTLED Program', href: '/pus/btled', description: '' },
    { name: 'BSENT Program', href: '/pus/bsent', description: '' },
    { name: 'BSIT Program', href: '/pus/bsit', description: '' },
];

const exhibitDropdownItems = [
    { name: "Citizen's Charter", href: "#", description: "" },
    { name: "Student Handbook", href: "#", description: "" },
    { name: "University Code", href: "#", description: "" },
    { name: "University Policies & Guidelines", href: "#", description: "" },
    { name: "OBE Syllabi", href: "#", description: "" },
    { name: "Instructional Materials", href: "#", description: "" },
    { name: "Faculty Manual", href: "#", description: "" },
    { name: "Administrative Manual", href: "#", description: "" },
    { name: "CHED Memorandum Order", href: "#", description: "" },
    { name: "Licensure", href: "#", description: "" },
];

// Document dropdown items for each role
const adminDocumentDropdownItems = [
    { name: 'Approved', href: '/admin/documents' },
    { name: 'Pending', href: '/admin/documents/pending' },
    { name: 'Disapproved', href: '/admin/documents/disapproved' },
];

const reviewerDocumentDropdownItems = [
    { name: 'Approved', href: '/reviewer/documents' },
    { name: 'Pending', href: '/reviewer/documents/pending' },
    { name: 'Disapproved', href: '/reviewer/documents/disapproved' },
];

const facultyDocumentDropdownItems = [
    { name: 'Approved', href: '/faculty/documents' },
    { name: 'Pending', href: '/faculty/documents/pending' },
    { name: 'Disapproved', href: '/faculty/documents/disapproved' },
];

// Layout nav items
const layoutNavItems = [
    { name: 'Home', href: '/admin/layout/home' },
    { name: 'About', hasDropdown: true, dropdownItems: [
        { name: 'Accreditation Task Force', href: '/admin/layout/about/accreditation' },
        { name: 'BTLED Faculty', href: '/admin/layout/about/btled' },
        { name: 'BSENT Faculty', href: '/admin/layout/about/bsent' },
        { name: 'BSIT Faculty', href: '/admin/layout/about/bsit' },
    ]},
    { name: 'Certificate of Authenticity', href: '/admin/layout/certificate' },
    { name: 'Programs Under Survey', hasDropdown: true, dropdownItems: [
        { name: 'BTLED Program', href: '/admin/layout/programs/btled' },
        { name: 'BSENT Program', href: '/admin/layout/programs/bsent' },
        { name: 'BSIT Program', href: '/admin/layout/programs/bsit' },
    ]},
    { name: 'Exhibit', hasDropdown: true, dropdownItems: [
        { name: "Citizen's Charter", href: '/admin/layout/exhibit/citizens-charter' },
        { name: "Student Handbook", href: '/admin/layout/exhibit/student-handbook' },
        { name: "University Code", href: '/admin/layout/exhibit/university-code' },
        { name: "University Policies & Guidelines", href: '/admin/layout/exhibit/university-policies' },
        { name: "OBE Syllabi", href: '/admin/layout/exhibit/obe-syllabi' },
        { name: "Instructional Materials", href: '/admin/layout/exhibit/instructional-materials' },
        { name: "Faculty Manual", href: '/admin/layout/exhibit/faculty-manual' },
        { name: "Administrative Manual", href: '/admin/layout/exhibit/administrative-manual' },
        { name: "CHED Memorandum Order", href: '/admin/layout/exhibit/ched-memorandum-order' },
        { name: "Licensure", href: '/admin/layout/exhibit/licensure' },
    ]},
];

export default function DashboardHeader() {
    const { auth } = usePage().props as any;
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);
    const [documentsDropdownOpen, setDocumentsDropdownOpen] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
    const [exhibitDropdownOpen, setExhibitDropdownOpen] = useState(false);
    const [mobileLayoutOpen, setMobileLayoutOpen] = useState(false);
    const [mobileDocumentsOpen, setMobileDocumentsOpen] = useState(false);
    const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
    const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
    const [mobileExhibitOpen, setMobileExhibitOpen] = useState(false);
    const role = auth?.user?.role || 'faculty';
    const navItems = NAVS[role] || NAVS.faculty;
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    // Check if current path is in admin/layout section
    const isLayoutSection = currentPath.startsWith('/admin/layout');

    // Get appropriate document items based on role
    const getDocumentItems = () => {
        switch (role) {
            case 'admin':
                return adminDocumentDropdownItems;
            case 'reviewer':
                return reviewerDocumentDropdownItems;
            case 'faculty':
                return facultyDocumentDropdownItems;
            default:
                return facultyDocumentDropdownItems;
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setLayoutDropdownOpen(false);
            setDocumentsDropdownOpen(false);
            setAboutDropdownOpen(false);
            setProgramsDropdownOpen(false);
            setExhibitDropdownOpen(false);
        };
        if (layoutDropdownOpen || documentsDropdownOpen || aboutDropdownOpen || programsDropdownOpen || exhibitDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [layoutDropdownOpen, documentsDropdownOpen, aboutDropdownOpen, programsDropdownOpen, exhibitDropdownOpen]);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-lg border-b-2"
            style={{ borderBottomColor: COLORS.primaryMaroon }}
        >
            <div className="w-full px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                        <img src="/favicon.svg" alt="PUP Logo" className="h-10 w-10" />
                        <div className="min-w-0">
                            <h1 className="text-xs sm:text-sm lg:text-lg xl:text-xl font-bold text-gray-900 leading-tight">
                                Polytechnic University of the Philippines
                            </h1>
                            <p
                                className="text-xs sm:text-xs lg:text-sm xl:text-base font-medium leading-tight"
                                style={{ color: COLORS.primaryMaroon }}
                            >
                                Calauan Campus
                            </p>
                        </div>
                    </div>
                    {/* Desktop Nav - centered options */}
                    <nav className="hidden md:flex flex-1 justify-center items-center space-x-4 mx-2">
                        {/* Dashboard link for all roles */}
                        <Link
                            href={navItems.find(item => item.name === 'Dashboard')?.href || '/dashboard'}
                            className={`relative px-2 py-2 text-sm font-medium transition-all duration-300 group ${
                                currentPath.includes('/dashboard') && !currentPath.includes('/documents') && !currentPath.includes('/messages') && !currentPath.includes('/settings')
                                    ? 'text-black'
                                    : 'text-black hover:text-gray-900'
                            }`}
                            style={{ color: 'black' }}
                        >
                            Dashboard
                            <div
                                className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                                    currentPath.includes('/dashboard') && !currentPath.includes('/documents') && !currentPath.includes('/messages') && !currentPath.includes('/settings')
                                        ? 'scale-x-100 opacity-100 shadow-sm'
                                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                }`}
                                style={{
                                    backgroundColor: COLORS.primaryMaroon,
                                    boxShadow: currentPath.includes('/dashboard') && !currentPath.includes('/documents') && !currentPath.includes('/messages') && !currentPath.includes('/settings') ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                }}
                            ></div>
                        </Link>
                        
                        {/* Admin: Layout dropdown second */}
                        {role === 'admin' && (
                            <div className="relative overflow-visible">
                                <button
                                    className="relative px-2 py-2 text-sm font-medium transition-all duration-300 group flex items-center text-black"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setLayoutDropdownOpen(v => !v);
                                    }}
                                    onMouseEnter={() => setLayoutDropdownOpen(true)}
                                    onMouseLeave={() => setLayoutDropdownOpen(false)}
                                >
                                    Layout
                                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${layoutDropdownOpen ? 'rotate-180' : ''}`} />
                                    <div
                                        className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                                            layoutDropdownOpen || isLayoutSection
                                                ? 'scale-x-100 opacity-100 shadow-sm'
                                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: COLORS.primaryMaroon,
                                            boxShadow: (layoutDropdownOpen || isLayoutSection) ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                        }}
                                    ></div>
                                </button>
                                {/* Layout Dropdown */}
                                <div
                                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-auto min-w-48 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 z-50 ${
                                        layoutDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                                    }`}
                                    style={{
                                        borderTop: `3px solid ${COLORS.primaryMaroon}`,
                                        backdropFilter: 'blur(10px)',
                                        overflow: 'visible'
                                    }}
                                    onMouseEnter={() => setLayoutDropdownOpen(true)}
                                    onMouseLeave={() => setLayoutDropdownOpen(false)}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="p-2 relative overflow-visible">
                                        {layoutNavItems.map((item) => (
                                            <div
                                                key={item.name}
                                                className="relative"
                                                onMouseEnter={() => {
                                                    if (item.name === 'About') setAboutDropdownOpen(true);
                                                    if (item.name === 'Programs Under Survey') setProgramsDropdownOpen(true);
                                                    if (item.name === 'Exhibit') setExhibitDropdownOpen(true);
                                                }}
                                                onMouseLeave={() => {
                                                    if (item.name === 'About') setAboutDropdownOpen(false);
                                                    if (item.name === 'Programs Under Survey') setProgramsDropdownOpen(false);
                                                    if (item.name === 'Exhibit') setExhibitDropdownOpen(false);
                                                }}
                                            >
                                                {item.hasDropdown ? (
                                                    <div className="relative">
                                                        {/* Make the main item clickable */}
                                                        {item.name === 'About' ? (
                                                            <Link
                                                                href="/admin/layout/about"
                                                                className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50 flex items-center"
                                                            >
                                                                {item.name}
                                                                <ChevronDown className="w-3 h-3 ml-1 inline-block" />
                                                            </Link>
                                                        ) : item.name === 'Programs Under Survey' ? (
                                                            <Link
                                                                href="/admin/layout/programs"
                                                                className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50 flex items-center"
                                                            >
                                                                {item.name}
                                                                <ChevronDown className="w-3 h-3 ml-1 inline-block" />
                                                            </Link>
                                                        ) : item.name === 'Exhibit' ? (
                                                            <Link
                                                                href="/admin/layout/exhibit"
                                                                className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50 flex items-center"
                                                            >
                                                                {item.name}
                                                                <ChevronDown className="w-3 h-3 ml-1 inline-block" />
                                                            </Link>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 flex items-center"
                                                                tabIndex={0}
                                                            >
                                                                {item.name}
                                                                <ChevronDown className="w-3 h-3 ml-1 inline-block" />
                                                            </button>
                                                        )}
                                                        {/* Side Modal/Submenu */}
                                                        <div
                                                            className={`absolute top-0 left-full ml-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 z-[999] ${
                                                                (item.name === 'About' && aboutDropdownOpen) ||
                                                                (item.name === 'Programs Under Survey' && programsDropdownOpen) ||
                                                                (item.name === 'Exhibit' && exhibitDropdownOpen)
                                                                    ? 'opacity-100 translate-y-0 visible'
                                                                    : 'opacity-0 -translate-y-2 invisible'
                                                            }`}
                                                            style={{
                                                                borderTop: `3px solid ${COLORS.primaryMaroon}`,
                                                                backdropFilter: 'blur(10px)',
                                                                overflow: 'visible'
                                                            }}
                                                        >
                                                            <div className="p-2">
                                                                {item.dropdownItems.map((dropdownItem) => (
                                                                    <Link
                                                                        key={dropdownItem.name}
                                                                        href={dropdownItem.href}
                                                                        className="block px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                                                                    >
                                                                        {dropdownItem.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    item.href ? (
                                                        <Link
                                                            href={item.href}
                                                            className="block px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ) : (
                                                        <div
                                                            className="block px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 cursor-default"
                                                        >
                                                            {item.name}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Admin: User Management link */}
                        {role === 'admin' && navItems.filter(item => item.name === 'User Management').map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative px-2 py-2 text-sm font-medium transition-all duration-300 group ${
                                    currentPath === item.href
                                        ? 'text-black'
                                        : 'text-black hover:text-gray-900'
                                }`}
                                style={{ color: 'black' }}
                            >
                                {item.name}
                                <div
                                    className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                                        currentPath === item.href
                                            ? 'scale-x-100 opacity-100 shadow-sm'
                                            : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: COLORS.primaryMaroon,
                                        boxShadow: currentPath === item.href ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                    }}
                                ></div>
                            </Link>
                        ))}
                        {/* Documents dropdown for all roles */}
                        {navItems.filter(item => item.name === 'Documents').length > 0 && (
                            <div className="relative overflow-visible">
                                <button
                                    className="relative px-2 py-2 text-sm font-medium transition-all duration-300 group flex items-center text-black"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setDocumentsDropdownOpen(v => !v);
                                    }}
                                    onMouseEnter={() => setDocumentsDropdownOpen(true)}
                                    onMouseLeave={() => setDocumentsDropdownOpen(false)}
                                >
                                    Documents
                                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${documentsDropdownOpen ? 'rotate-180' : ''}`} />
                                    <div
                                        className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                                            documentsDropdownOpen || currentPath.includes('/documents')
                                                ? 'scale-x-100 opacity-100 shadow-sm'
                                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: COLORS.primaryMaroon,
                                            boxShadow: (documentsDropdownOpen || currentPath.includes('/documents')) ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                        }}
                                    ></div>
                                </button>
                                {/* Documents Dropdown */}
                                <div
                                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-auto min-w-48 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 z-50 ${
                                        documentsDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                                    }`}
                                    style={{
                                        borderTop: `3px solid ${COLORS.primaryMaroon}`,
                                        backdropFilter: 'blur(10px)',
                                        overflow: 'visible'
                                    }}
                                    onMouseEnter={() => setDocumentsDropdownOpen(true)}
                                    onMouseLeave={() => setDocumentsDropdownOpen(false)}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div className="p-2 relative overflow-visible">
                                        {getDocumentItems().map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="block px-4 py-3 rounded-lg transition-all duration-300 group/item relative whitespace-nowrap text-sm font-semibold text-gray-800 hover:text-gray-900 hover:bg-gray-50"
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Other nav items (excluding Dashboard and Documents which are already handled) */}
                        {navItems.filter(item => !['Dashboard', 'User Management', 'Documents'].includes(item.name)).map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative px-2 py-2 text-sm font-medium transition-all duration-300 group ${
                                    currentPath === item.href
                                        ? 'text-black'
                                        : 'text-black hover:text-gray-900'
                                }`}
                                style={{ color: 'black' }}
                            >
                                {item.name}
                                <div
                                    className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                                        currentPath === item.href
                                            ? 'scale-x-100 opacity-100 shadow-sm'
                                            : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: COLORS.primaryMaroon,
                                        boxShadow: currentPath === item.href ? `0 0 8px ${COLORS.primaryMaroon}40` : 'none'
                                    }}
                                ></div>
                            </Link>
                        ))}
                    </nav>
                    {/* User Dropdown (Logout inside dropdown) - right side, replaces login button */}
                    <div className="hidden md:flex items-center ml-2">
                        <div className="relative">
                            <button
                                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                                    border-none shadow-sm
                                    bg-[${COLORS.primaryMaroon}] text-white
                                    hover:scale-105 hover:shadow-lg
                                `}
                                style={{
                                    backgroundColor: COLORS.primaryMaroon,
                                    color: 'white',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.darkMaroon;
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = COLORS.primaryMaroon;
                                }}
                                onClick={() => setDropdownOpen((v) => !v)}
                                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                            >
                                {auth?.user?.name}
                                <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <div
                                className={`absolute right-0 mt-2 w-44 z-50 overflow-hidden transition-all duration-300
                                    ${dropdownOpen ? 'opacity-100 translate-y-0 visible scale-100' : 'opacity-0 -translate-y-2 invisible scale-95'}`}
                                style={{
                                    borderTop: `3px solid ${COLORS.primaryMaroon}`,
                                    background: 'white',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 8px 32px 0 rgba(60, 0, 0, 0.10)',
                                    transitionProperty: 'opacity, transform',
                                }}
                            >
                                {dropdownOpen && (
                                    <div>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-3 text-sm font-medium text-black hover:bg-gray-50 transition-all duration-200"
                                            style={{ color: 'black' }}
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Hamburger menu button - visible on mobile, hidden on md+ */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-1.5 rounded-lg transition-all duration-300 hover:bg-gray-100 flex items-center justify-center"
                        style={{ color: COLORS.primaryMaroon }}
                        aria-label="Open menu"
                    >
                        <div className="w-5 h-5 flex flex-col justify-center items-center">
                            <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${menuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                            <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm my-0.5 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${menuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                        </div>
                    </button>
                </div>
                {/* Mobile Navigation - Enhanced with dropdown */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${menuOpen ? 'max-h-96 py-3' : 'max-h-0'}`}
                    style={menuOpen ? { maxHeight: '40vh', overflowY: 'auto' } : {}}
                >
                    <div className="flex flex-col space-y-1">
                        {/* Dashboard link for all roles in mobile */}
                        <Link
                            href={navItems.find(item => item.name === 'Dashboard')?.href || '/dashboard'}
                            className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group ${
                                currentPath.includes('/dashboard') && !currentPath.includes('/documents') && !currentPath.includes('/messages') && !currentPath.includes('/settings')
                                    ? 'text-gray-900 bg-gray-50'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="relative inline-block">
                                Dashboard
                                <span
                                    className={`block absolute left-0 right-0 mx-auto bottom-[-2px] h-0.5 transition-all duration-300 min-w-[2.5rem] w-auto ${
                                        currentPath.includes('/dashboard') && !currentPath.includes('/documents') && !currentPath.includes('/messages') && !currentPath.includes('/settings')
                                            ? 'scale-x-100 opacity-100'
                                            : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                    }`}
                                    style={{
                                        backgroundColor: COLORS.primaryMaroon,
                                    }}
                                ></span>
                            </span>
                        </Link>
                        
                        {/* Admin: Layout dropdown second in mobile */}
                        {role === 'admin' && (
                            <div>
                                <div
                                    className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group flex items-center justify-between cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50`}
                                    onClick={() => setMobileLayoutOpen(!mobileLayoutOpen)}
                                >
                                    <span>Layout</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileLayoutOpen ? 'rotate-180' : ''}`} />
                                    <div
                                        className={`absolute bottom-1 left-3 right-3 h-0.5 transition-all duration-300 ${
                                            mobileLayoutOpen || isLayoutSection
                                                ? 'scale-x-100 opacity-100'
                                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                        }`}
                                        style={{ backgroundColor: COLORS.primaryMaroon }}
                                    ></div>
                                </div>
                                {/* Mobile Layout Dropdown */}
                                <div className={`overflow-hidden transition-all duration-300 ${mobileLayoutOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {layoutNavItems.map((item) => (
                                        <div key={item.name}>
                                            {item.hasDropdown ? (
                                                <div>
                                                    <div
                                                        className={`relative px-6 py-2 text-sm font-medium flex items-center justify-between cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50`}
                                                        onClick={() => {
                                                            if (item.name === 'About') setMobileAboutOpen(!mobileAboutOpen);
                                                            if (item.name === 'Programs Under Survey') setMobileProgramsOpen(!mobileProgramsOpen);
                                                            if (item.name === 'Exhibit') setMobileExhibitOpen(!mobileExhibitOpen);
                                                        }}
                                                    >
                                                        <span>{item.name}</span>
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                                            (item.name === 'About' && mobileAboutOpen) ||
                                                            (item.name === 'Programs Under Survey' && mobileProgramsOpen) ||
                                                            (item.name === 'Exhibit' && mobileExhibitOpen)
                                                                ? 'rotate-180' : ''
                                                        }`} />
                                                    </div>
                                                    {/* Mobile Submenu */}
                                                    <div className={`overflow-hidden transition-all duration-300 ${
                                                        (item.name === 'About' && mobileAboutOpen) ||
                                                        (item.name === 'Programs Under Survey' && mobileProgramsOpen) ||
                                                        (item.name === 'Exhibit' && mobileExhibitOpen)
                                                            ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                                                    }`}>
                                                        {/* Add main page link */}
                                                        {item.name === 'About' ? (
                                                            <Link
                                                                href="/admin/layout/about"
                                                                className="block px-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                                                onClick={() => setMenuOpen(false)}
                                                            >
                                                                About Overview
                                                            </Link>
                                                        ) : item.name === 'Programs Under Survey' ? (
                                                            <Link
                                                                href="/admin/layout/programs"
                                                                className="block px-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                                                onClick={() => setMenuOpen(false)}
                                                            >
                                                                Programs Overview
                                                            </Link>
                                                        ) : item.name === 'Exhibit' ? (
                                                            <Link
                                                                href="/admin/layout/exhibit"
                                                                className="block px-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                                                onClick={() => setMenuOpen(false)}
                                                            >
                                                                Exhibit Overview
                                                            </Link>
                                                        ) : (
                                                            <div
                                                                className="block px-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 cursor-default"
                                                            >
                                                                {item.name === 'About' ? 'About Overview' : item.name === 'Programs Under Survey' ? 'Programs Overview' : 'Exhibit Overview'}
                                                            </div>
                                                        )}
                                                        {item.dropdownItems.map((dropdownItem) => (
                                                            <Link
                                                                key={dropdownItem.name}
                                                                href={dropdownItem.href}
                                                                className="block px-10 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                                                onClick={() => setMenuOpen(false)}
                                                            >
                                                                {dropdownItem.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                item.href ? (
                                                    <Link
                                                        href={item.href}
                                                        className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ) : (
                                                    <div
                                                        className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 cursor-default"
                                                    >
                                                        {item.name}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Admin: User Management link in mobile */}
                        {role === 'admin' && navItems.filter(item => item.name === 'User Management').map((item, index) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group ${
                                    currentPath === item.href
                                        ? 'text-gray-900 bg-gray-50'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                }}
                                onClick={() => setMenuOpen(false)}
                            >
                                <span className="relative inline-block">
                                    {item.name}
                                    <span
                                        className={`block absolute left-0 right-0 mx-auto bottom-[-2px] h-0.5 transition-all duration-300 min-w-[2.5rem] w-auto ${
                                            currentPath === item.href
                                                ? 'scale-x-100 opacity-100'
                                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: COLORS.primaryMaroon,
                                        }}
                                    ></span>
                                </span>
                            </Link>
                        ))}
                        {/* Documents dropdown for all roles in mobile */}
                        {navItems.filter(item => item.name === 'Documents').length > 0 && (
                            <div>
                                <div
                                    className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group flex items-center justify-between cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50`}
                                    onClick={() => setMobileDocumentsOpen(!mobileDocumentsOpen)}
                                >
                                    <span>Documents</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileDocumentsOpen ? 'rotate-180' : ''}`} />
                                    <div
                                        className={`absolute bottom-1 left-3 right-3 h-0.5 transition-all duration-300 ${
                                            mobileDocumentsOpen || currentPath.includes('/documents')
                                                ? 'scale-x-100 opacity-100'
                                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                        }`}
                                        style={{ backgroundColor: COLORS.primaryMaroon }}
                                    ></div>
                                </div>
                                {/* Mobile Documents Dropdown */}
                                <div className={`overflow-hidden transition-all duration-300 ${mobileDocumentsOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {getDocumentItems().map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Other nav items in mobile (excluding Dashboard and Documents which are already handled) */}
                        {navItems.filter(item => !['Dashboard', 'User Management', 'Documents'].includes(item.name)).map((item, index) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group ${
                                    currentPath === item.href
                                        ? 'text-gray-900 bg-gray-50'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                }}
                                onClick={() => setMenuOpen(false)}
                            >
                                <span className="relative inline-block">
                                    {item.name}
                                    <span
                                        className={`block absolute left-0 right-0 mx-auto bottom-[-2px] h-0.5 transition-all duration-300 min-w-[2.5rem] w-auto ${
                                            currentPath === item.href
                                                ? 'scale-x-100 opacity-100'
                                                : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: COLORS.primaryMaroon,
                                        }}
                                    ></span>
                                </span>
                            </Link>
                        ))}
                        {/* Logout button */}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="relative px-3 py-2.5 text-sm font-medium transition-all duration-300 group text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-left"
                            style={{
                                animationDelay: `${navItems.length * 0.1}s`,
                            }}
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="relative inline-block">
                                Logout
                                <span
                                    className="block absolute left-0 bottom-[-2px] h-0.5 transition-all duration-300 min-w-[2.5rem] w-auto scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                                    style={{
                                        backgroundColor: COLORS.primaryMaroon,
                                    }}
                                ></span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
