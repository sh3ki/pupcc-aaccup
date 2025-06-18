import { Head, usePage, router } from '@inertiajs/react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import SearchBar from '@/components/SearchBar';
import { useState, useMemo, Fragment, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PencilSquareIcon, KeyIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/components/ConfirmationModal';

const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    burntOrange: '#C46B02',
    brightYellow: '#F4BB00',
    softYellow: '#FDDE54',
    almostWhite: '#FEFEFE',
};

// Utility functions
const fuzzyMatch = (text: string, query: string) => {
    if (!query) return true;
    text = text.toLowerCase();
    query = query.toLowerCase().replace(/\s+/g, '');
    let t = 0, q = 0;
    while (t < text.length && q < query.length) {
        if (text[t] === query[q]) q++;
        t++;
    }
    return q === query.length;
};

const userMatches = (user: any, query: string) => {
    if (fuzzyMatch(user.name, query) || fuzzyMatch(user.email, query) || fuzzyMatch(user.role, query)) return true;
    return user.assignments.some((assign: any) =>
        fuzzyMatch(assign.program_code || '', query) || fuzzyMatch(assign.area_code || '', query)
    );
};

// Dropdown MultiSelect Component
function MultiSelectDropdown({
    options,
    selected,
    onSelect,
    placeholder,
    show,
    setShow,
    className = '',
    dropdownClass = '',
    disabledLogic,
}: any) {
    useEffect(() => {
        if (!show) return;
        const handler = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest(`.${className}`)) setShow(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [show, setShow, className]);

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm text-left focus:ring-2 focus:ring-[#C46B02] outline-none transition min-h-[42px] flex items-start"
                onClick={() => setShow((v: boolean) => !v)}
            >
                <div className="w-full">
                    {selected.length === 0 ? (
                        <span className="text-gray-400">{placeholder}</span>
                    ) : (
                        <div className="space-y-1">
                            {options
                                .filter((opt: any) => selected.includes(opt.value))
                                .map((opt: any, index: number) => (
                                    <div key={opt.value} className="text-sm">
                                        {opt.label}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </button>
            {show && (
                <div className={`absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownClass}`}>
                    {options.map((opt: any) => (
                        <label key={opt.value} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.value)}
                                onChange={() => onSelect(opt.value)}
                                disabled={disabledLogic && disabledLogic(opt.value)}
                                className="mr-2"
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

// Modal Component
function UserModal({ 
    open, 
    onClose, 
    title, 
    children, 
    onSubmit, 
    loading, 
    submitText = "Save" 
}: any) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div
                        className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br from-[#f8fafc] via-white to-[#f3f4f6] border-t-8 border-[#7F0404]"
                        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#7F0404]/90 to-[#C46B02]/80 flex-shrink-0">
                            <Dialog.Title className="text-2xl font-bold text-white tracking-tight">
                                <span className="drop-shadow">{title}</span>
                            </Dialog.Title>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-[#FDDE54] transition-all duration-200 rounded-full p-1.5 focus:outline-none"
                                aria-label="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form
                            className="px-8 py-8 overflow-y-auto"
                            style={{ maxHeight: 'calc(90vh - 80px - 70px)' }}
                            onSubmit={onSubmit}
                        >
                            {children}
                            <div className="flex flex-row justify-end gap-3 pt-8 mt-2 border-t border-gray-100 px-8 pb-6 flex-shrink-0 bg-white">
                                <button
                                    type="button"
                                    className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg font-bold shadow bg-[#7F0404] text-white hover:bg-[#C46L02] hover:shadow-lg transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : submitText}
                                </button>
                            </div>
                        </form>
                        <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-[#FDDE54]/30 blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#C46B02]/20 blur-2xl pointer-events-none"></div>
                    </div>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}

// Main Component
export default function AdminUserManagement() {
    const { users = [], programs = [], areas = [] } = usePage().props as any;
    const [search, setSearch] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assignUser, setAssignUser] = useState<any>(null);
    const [editUser, setEditUser] = useState<any>(null);
    const [changePasswordUser, setChangePasswordUser] = useState<any>(null);
    const [deleteUser, setDeleteUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    
    // Form states
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'faculty', programs: [], areas: []
    });
    const [editForm, setEditForm] = useState({
        name: '', email: '', role: 'faculty'
    });
    const [changePasswordForm, setChangePasswordForm] = useState({
        password: '', confirmPassword: ''
    });
    const [assignForm, setAssignForm] = useState({ programs: [], areas: [] });
    
    // Dropdown states
    const [showProgramDropdown, setShowProgramDropdown] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [assignShowProgramDropdown, setAssignShowProgramDropdown] = useState(false);
    const [assignShowAreaDropdown, setAssignShowAreaDropdown] = useState(false);

    const filteredUsers = useMemo(() => users.filter((u: any) => userMatches(u, search)), [users, search]);

    const programOptions = useMemo(() => [
        { value: 'all', label: 'All Programs' },
        ...programs.map((p: any) => ({ value: p.id, label: p.code })),
        { value: '', label: 'None' },
    ], [programs]);

    // Create area options function to reuse
    const createAreaOptions = useCallback((selectedPrograms: any[]) => {
        const showAll = selectedPrograms.includes('all') || selectedPrograms.includes('');
        let filtered = areas;
        if (!showAll && selectedPrograms.length > 0) {
            filtered = areas.filter((a: any) => selectedPrograms.includes(a.program_id));
        }
        
        // Helper function to convert roman numerals to numbers for sorting
        const romanToNumber = (roman: string) => {
            const romanMap: { [key: string]: number } = {
                'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
            };
            return romanMap[roman] || 999; // Default to high number if not found
        };
        
        const areaWithProgram = filtered.map((a: any) => {
            const program = programs.find((p: any) => p.id === a.program_id);
            const programCode = program?.code || '';
            return {
                ...a,
                programCode,
                label: `${programCode} | ${a.code}${a.name ? ` - ${a.name}` : ''}`,
                value: a.id,
            };
        });
        
        // Sort by program code first, then by area code (roman numerals)
        areaWithProgram.sort((a, b) => {
            const programComparison = a.programCode.localeCompare(b.programCode);
            if (programComparison !== 0) return programComparison;
            
            // If program codes are the same, sort by area code (roman numerals)
            return romanToNumber(a.code) - romanToNumber(b.code);
        });
        
        return [
            { value: 'all', label: 'All Areas' },
            ...areaWithProgram.map(a => ({ value: a.value, label: a.label })),
            { value: '', label: 'None' },
        ];
    }, [areas, programs]);

    const filteredAreaOptions = useMemo(() => createAreaOptions(form.programs), [createAreaOptions, form.programs]);
    const assignFilteredAreaOptions = useMemo(() => createAreaOptions(assignForm.programs), [createAreaOptions, assignForm.programs]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'programs' || name === 'areas') return;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(f => ({ ...f, [name]: value }));
    };

    const handleChangePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setChangePasswordForm(f => ({ ...f, [name]: value }));
    };

    // Generic multi-select handler
    const handleMultiSelect = useCallback((field: 'programs' | 'areas', val: string) => {
        setForm(f => {
            if (val === 'all' || val === '') {
                return { ...f, [field]: f[field].includes(val) ? [] : [val] };
            }
            let arr = f[field].filter((v: string) => v !== 'all' && v !== '');
            arr = arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val];
            return { ...f, [field]: arr };
        });
    }, []);

    // Assign modal multi-select handler
    const handleAssignMultiSelect = useCallback((field: 'programs' | 'areas', val: string) => {
        setAssignForm(f => {
            if (val === 'all' || val === '') {
                return { ...f, [field]: f[field].includes(val) ? [] : [val] };
            }
            let arr = f[field].filter((v: string) => v !== 'all' && v !== '');
            arr = arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val];
            return { ...f, [field]: arr };
        });
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (form.password !== form.confirmPassword) return setErrors({ confirmPassword: 'Passwords do not match.' });
        if (form.programs.length === 0) return setErrors({ programs: 'Please select at least one program.' });
        if (form.areas.length === 0) return setErrors({ areas: 'Please select at least one area.' });
        setLoading(true);
        router.post('/admin/users', form, {
            onSuccess: () => {
                setAddModalOpen(false);
                setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'faculty', programs: [], areas: [] });
                setLoading(false);
            },
            onError: (err) => { setErrors(err); setLoading(false); }
        });
    };

    const openAssignModal = (user: any) => {
        setAssignUser(user);
        const userPrograms = [...new Set(user.assignments.map((a: any) => a.program_code && programs.find((p: any) => p.code === a.program_code)?.id).filter(Boolean))];
        const userAreas = [...new Set(user.assignments.map((a: any) => {
            if (!a.area_code) return null;
            const area = areas.find((ar: any) => ar.code === a.area_code && userPrograms.includes(ar.program_id));
            return area?.id;
        }).filter(Boolean))];
        setAssignForm({ programs: userPrograms, areas: userAreas });
        setErrors({});
        setAssignModalOpen(true);
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (assignForm.programs.length === 0) return setErrors({ programs: 'Please select at least one program.' });
        if (assignForm.areas.length === 0) return setErrors({ areas: 'Please select at least one area.' });
        setLoading(true);
        router.post(`/admin/users/${assignUser.id}/assign`, assignForm, {
            onSuccess: () => { setAssignModalOpen(false); setLoading(false); },
            onError: (err) => { setErrors(err); setLoading(false); }
        });
    };

    const openEditModal = (user: any) => {
        setEditUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role
        });
        setErrors({});
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        router.put(`/admin/users/${editUser.id}`, editForm, {
            onSuccess: () => {
                setEditModalOpen(false);
                setLoading(false);
            },
            onError: (err) => { setErrors(err); setLoading(false); }
        });
    };

    const openChangePasswordModal = (user: any) => {
        setChangePasswordUser(user);
        setChangePasswordForm({
            password: '',
            confirmPassword: ''
        });
        setErrors({});
        setChangePasswordModalOpen(true);
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (changePasswordForm.password !== changePasswordForm.confirmPassword) {
            return setErrors({ confirmPassword: 'Passwords do not match.' });
        }
        setLoading(true);
        router.put(`/admin/users/${changePasswordUser.id}/password`, changePasswordForm, {
            onSuccess: () => {
                setChangePasswordModalOpen(false);
                setChangePasswordForm({ password: '', confirmPassword: '' });
                setLoading(false);
            },
            onError: (err) => { setErrors(err); setLoading(false); }
        });
    };

    const openDeleteModal = (user: any) => {
        setDeleteUser(user);
        setDeleteModalOpen(true);
    };

    const handleDeleteSubmit = async () => {
        if (!deleteUser) return;
        setLoading(true);
        router.delete(`/admin/users/${deleteUser.id}`, {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setDeleteUser(null);
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    // Icon button component for consistent style and animation
    function ActionIcon({ title, color, children, onClick }: any) {
        return (
            <button
                title={title}
                onClick={onClick}
                className={`group p-2 rounded-full transition focus:outline-none active:scale-95`}
                style={{ color }}
            >
                {children}
            </button>
        );
    }

    return (
        <>
            <Head title="User Management" />
            <DashboardHeader />
            <main className="min-h-screen bg-white overflow-x-hidden pt-20 flex flex-col items-center">
                <section className="w-full max-w-6xl mx-auto p-4">
                    {/* Add User Button & Search */}
                    <div className="w-full flex flex-row items-center justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0 flex items-center">
                            <SearchBar value={search} onChange={setSearch} placeholder="Search users, emails, roles, program/area codes..." />
                        </div>
                        <button
                            className="flex-shrink-0 group flex items-center justify-center h-[44px] px-5 py-2 rounded-lg font-semibold shadow transition bg-[#7F0404] text-white hover:bg-[#4D1414] active:scale-95 focus:outline-none"
                            style={{ boxShadow: '0 2px 8px #7f040433' }}
                            onClick={() => setAddModalOpen(true)}
                        >
                            <UserPlusIcon className="h-7 w-7 text-white" />
                            <span className="ml-1">Add User</span>
                        </button>
                    </div>

                    {/* Add User Modal */}
                    <UserModal
                        open={addModalOpen}
                        onClose={() => setAddModalOpen(false)}
                        title="Add User"
                        onSubmit={handleAddUser}
                        loading={loading}
                        submitText="Add User"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            { [
                                {
                                    name: 'name',
                                    label: 'Name',
                                    type: 'text',
                                    required: true,
                                    placeholder: 'Full name'
                                },
                                {
                                    name: 'email',
                                    label: 'Email',
                                    type: 'email',
                                    required: true,
                                    placeholder: 'email@example.com'
                                },
                                {
                                    name: 'password',
                                    label: 'Password',
                                    type: 'password',
                                    required: true,
                                    placeholder: 'Password'
                                },
                                {
                                    name: 'confirmPassword',
                                    label: 'Confirm Password',
                                    type: 'password',
                                    required: true,
                                    placeholder: 'Confirm password'
                                }
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                        {f.label} <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        name={f.name}
                                        type={f.type}
                                        required={f.required}
                                        value={form[f.name]}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                        placeholder={f.placeholder}
                                    />
                                    {errors[f.name] && <div className="text-red-600 text-xs mt-1">{errors[f.name]}</div>}
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Role <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                >
                                    <option value="faculty">Faculty</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Assign Program(s) <span className="text-red-600">*</span>
                                </label>
                                <MultiSelectDropdown
                                    options={programOptions}
                                    selected={form.programs}
                                    onSelect={val => handleMultiSelect('programs', val)}
                                    placeholder="Select program(s)"
                                    show={showProgramDropdown}
                                    setShow={setShowProgramDropdown}
                                    className="program-dropdown"
                                    dropdownClass="max-h-32 overflow-auto"
                                    disabledLogic={val => (val !== 'all' && form.programs.includes('all')) || (val !== '' && form.programs.includes(''))}
                                />
                                {errors.programs && <div className="text-red-600 text-xs mt-1">{errors.programs}</div>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Assign Area(s) <span className="text-red-600">*</span>
                                </label>
                                <MultiSelectDropdown
                                    options={filteredAreaOptions}
                                    selected={form.areas}
                                    onSelect={val => handleMultiSelect('areas', val)}
                                    placeholder="Select area(s)"
                                    show={showAreaDropdown}
                                    setShow={setShowAreaDropdown}
                                    className="area-dropdown"
                                    dropdownClass="max-h-64 overflow-auto"
                                    disabledLogic={val => (val !== 'all' && form.areas.includes('all')) || (val !== '' && form.areas.includes(''))}
                                />
                                {errors.areas && <div className="text-red-600 text-xs mt-1">{errors.areas}</div>}
                            </div>
                        </div>
                    </UserModal>

                    {/* Edit User Modal */}
                    <UserModal
                        open={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        title="Edit User"
                        onSubmit={handleEditSubmit}
                        loading={loading}
                        submitText="Update User"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={handleEditFormChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                    placeholder="Full name"
                                />
                                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Email <span className="text-red-600">*</span>
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={editForm.email}
                                    onChange={handleEditFormChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Role <span className="text-red-600">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={editForm.role}
                                    onChange={handleEditFormChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                >
                                    <option value="faculty">Faculty</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <div className="text-red-600 text-xs mt-1">{errors.role}</div>}
                            </div>
                        </div>
                    </UserModal>

                    {/* Change Password Modal */}
                    <UserModal
                        open={changePasswordModalOpen}
                        onClose={() => setChangePasswordModalOpen(false)}
                        title="Change Password"
                        onSubmit={handleChangePasswordSubmit}
                        loading={loading}
                        submitText="Update Password"
                    >
                        <div className="grid grid-cols-1 gap-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    New Password <span className="text-red-600">*</span>
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={changePasswordForm.password}
                                    onChange={handleChangePasswordFormChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                    placeholder="Enter new password"
                                />
                                {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Confirm New Password <span className="text-red-600">*</span>
                                </label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={changePasswordForm.confirmPassword}
                                    onChange={handleChangePasswordFormChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C46B02] outline-none bg-white shadow-sm transition"
                                    placeholder="Confirm new password"
                                />
                                {errors.confirmPassword && <div className="text-red-600 text-xs mt-1">{errors.confirmPassword}</div>}
                            </div>
                        </div>
                    </UserModal>

                    {/* Assign Modal */}
                    <UserModal
                        open={assignModalOpen}
                        onClose={() => setAssignModalOpen(false)}
                        title="Assign Programs/Areas"
                        onSubmit={handleAssignSubmit}
                        loading={loading}
                        submitText="Assign"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Assign Program(s) <span className="text-red-600">*</span>
                                </label>
                                <MultiSelectDropdown
                                    options={programOptions}
                                    selected={assignForm.programs}
                                    onSelect={val => handleAssignMultiSelect('programs', val)}
                                    placeholder="Select program(s)"
                                    show={assignShowProgramDropdown}
                                    setShow={setAssignShowProgramDropdown}
                                    className="assign-program-dropdown"
                                    dropdownClass="max-h-32 overflow-auto"
                                    disabledLogic={val => (val !== 'all' && assignForm.programs.includes('all')) || (val !== '' && assignForm.programs.includes(''))}
                                />
                                {errors.programs && <div className="text-red-600 text-xs mt-1">{errors.programs}</div>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-[#7F0404]">
                                    Assign Area(s) <span className="text-red-600">*</span>
                                </label>
                                <MultiSelectDropdown
                                    options={assignFilteredAreaOptions}
                                    selected={assignForm.areas}
                                    onSelect={val => handleAssignMultiSelect('areas', val)}
                                    placeholder="Select area(s)"
                                    show={assignShowAreaDropdown}
                                    setShow={setAssignShowAreaDropdown}
                                    className="assign-area-dropdown"
                                    dropdownClass="max-h-64 overflow-auto"
                                    disabledLogic={val => (val !== 'all' && assignForm.areas.includes('all')) || (val !== '' && assignForm.areas.includes(''))}
                                />
                                {errors.areas && <div className="text-red-600 text-xs mt-1">{errors.areas}</div>}
                            </div>
                        </div>
                    </UserModal>

                    {/* Delete Confirmation Modal */}
                    <ConfirmationModal
                        open={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleDeleteSubmit}
                        title="Delete User"
                        message={`Are you sure you want to delete "${deleteUser?.name}"? This action cannot be undone and will remove all user data and assignments.`}
                        confirmText="Delete User"
                        cancelText="Cancel"
                        loading={loading}
                        type="danger"
                    />

                    {/* User Table */}
                    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white mt-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead style={{ background: COLORS.primaryMaroon }}>
                                <tr>
                                    <th className="px-4 py-4 text-center text-sm font-black text-white uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-4 text-center text-sm font-black text-white uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-4 text-center textsm font-black text-white uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-4 text-center text-sm font-black text-white uppercase tracking-wider">Programs</th>
                                    <th className="px-4 py-4 text-center textsm font-black text-white uppercase tracking-wider">Areas</th>
                                    <th className="px-4 py-4 text-center text-sm font-black text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">No users found.</td>
                                    </tr>
                                )}
                                {filteredUsers.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4 font-semibold text-gray-900 text-center border-t border-gray-100">{user.name}</td>
                                        <td className="px-4 py-4 text-gray-700 text-center border-t border-gray-100">{user.email}</td>
                                        <td className="px-4 py-4 text-gray-700 text-center border-t border-gray-100 capitalize">{user.role}</td>
                                        <td className="px-4 py-4 text-gray-700 text-center border-t border-gray-100">
                                            {user.assignments.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {[...new Set(user.assignments.map((a: any) => a.program_code).filter(Boolean))].map((programCode: string, idx: number) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            • {programCode}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No programs</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-gray-700 text-center border-t border-gray-100">
                                            {user.assignments.length > 0 ? (
                                                (() => {
                                                    // Helper function to convert roman numerals to numbers for sorting
                                                    const romanToNumber = (roman: string) => {
                                                        const romanMap: { [key: string]: number } = {
                                                            'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10
                                                        };
                                                        return romanMap[roman] || 999;
                                                    };

                                                    // Get unique area codes and sort them properly
                                                    const uniqueAreaCodes = [...new Set(user.assignments.map((a: any) => a.area_code).filter(Boolean))];
                                                    uniqueAreaCodes.sort((a, b) => romanToNumber(a) - romanToNumber(b));

                                                    // Split into two columns for downward filling
                                                    const midPoint = Math.ceil(uniqueAreaCodes.length / 2);
                                                    const firstColumn = uniqueAreaCodes.slice(0, midPoint);
                                                    const secondColumn = uniqueAreaCodes.slice(midPoint);

                                                    return (
                                                        <div className="grid grid-cols-2 gap-0.5 justify-items-center max-w-xs mx-auto">
                                                            {/* First column */}
                                                            <div className="space-y-0.5 flex flex-col items-center">
                                                                {firstColumn.map((areaCode: string, idx: number) => (
                                                                    <span key={`col1-${idx}`} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        • Area {areaCode}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {/* Second column */}
                                                            <div className="space-y-0.5 flex flex-col items-center">
                                                                {secondColumn.map((areaCode: string, idx: number) => (
                                                                    <span key={`col2-${idx}`} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        • Area {areaCode}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {/* No specific area spans both columns */}
                                                            {user.assignments.some((a: any) => !a.area_code) && (
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 col-span-2">
                                                                    • No specific area
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-gray-400 text-sm">No areas</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 border-t border-gray-100">
                                            <div className="flex justify-center gap-2">
                                                <ActionIcon title="Assign Programs/Areas" color={COLORS.brightYellow} onClick={() => openAssignModal(user)}>
                                                    <UserPlusIcon className="h-5 w-5" />
                                                </ActionIcon>
                                                <ActionIcon title="Edit User" color={COLORS.primaryMaroon} onClick={() => openEditModal(user)}>
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </ActionIcon>
                                                <ActionIcon title="Change Password" color={COLORS.burntOrange} onClick={() => openChangePasswordModal(user)}>
                                                    <KeyIcon className="h-5 w-5" />
                                                </ActionIcon>
                                                <ActionIcon title="Delete User" color="#d11a2a" onClick={() => openDeleteModal(user)}>
                                                    <TrashIcon className="h-5 w-5" />
                                                </ActionIcon>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
            <DashboardFooter />
            <style jsx>{`
                table { font-size: 1rem; }
                th, td { vertical-align: middle; }
                .group:hover svg {
                    filter: drop-shadow(0 2px 4px rgba(196,107,2,0.15));
                    transition: color 0.2s, transform 0.2s;
                    transform: scale(1.35);
                }
                .group svg { transition: color 0.2s, transform 0.2s; }
                .group:active { transform: scale(0.95); }
            `}</style>
        </>
    );
}
