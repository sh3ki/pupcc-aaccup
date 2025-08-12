import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState, useEffect } from 'react';
import { 
    FileText, 
    Clock, 
    CheckCircle, 
    XCircle, 
    MessageSquare, 
    BookOpen, 
    Users, 
    TrendingUp,
    Calendar,
    Bell,
    ChevronRight,
    Upload,
    Search,
    Shield,
    Settings,
    UserCheck
} from 'lucide-react';
import type { SharedData } from '@/types';

// Color constants for consistency
const COLORS = {
    primaryMaroon: '#7F0404',
    darkMaroon: '#4D1414',
    lightGray: '#f8f9fa',
    mediumGray: '#6b7280',
    darkGray: '#374151',
};

interface DashboardStats {
    totalDocuments: number;
    pendingReview: number;
    approvedDocuments: number;
    disapprovedDocuments: number;
    unreadMessages: number;
    totalUsers: number;
    totalPrograms: number;
    systemActivities: number;
}

interface RecentActivity {
    id: number;
    type: 'document_uploaded' | 'document_approved' | 'document_disapproved' | 'user_created' | 'user_assigned' | 'message_received' | 'system_update';
    title: string;
    description: string;
    timestamp: string;
    programName?: string;
    areaName?: string;
}

interface QuickLink {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    color: string;
}

export default function AdminDashboard() {
    const { auth } = (usePage().props as unknown as SharedData);
    const [stats, setStats] = useState<DashboardStats>({
        totalDocuments: 0,
        pendingReview: 0,
        approvedDocuments: 0,
        disapprovedDocuments: 0,
        unreadMessages: 0,
        totalUsers: 0,
        totalPrograms: 0,
        systemActivities: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/admin/dashboard/data', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin',
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.stats || {
                        totalDocuments: 0,
                        pendingReview: 0,
                        approvedDocuments: 0,
                        disapprovedDocuments: 0,
                        unreadMessages: 0,
                        totalUsers: 0,
                        totalPrograms: 0,
                        systemActivities: 0,
                    });
                    setRecentActivities(data.recentActivities || []);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickLinks: QuickLink[] = [
        {
            title: 'Manage Users',
            description: 'Add, edit, and manage user accounts and roles',
            href: '/admin/users',
            icon: Users,
            color: COLORS.primaryMaroon,
        },
        {
            title: 'Review Pending Documents',
            description: 'Review and approve pending document submissions',
            href: '/admin/documents/pending',
            icon: Search,
            color: '#f59e0b',
        },
        {
            title: 'View All Documents',
            description: 'Browse and manage all documents in the system',
            href: '/admin/documents',
            icon: FileText,
            color: '#3b82f6',
        },
        {
            title: 'System Settings',
            description: 'Configure system preferences and layouts',
            href: '/admin/settings',
            icon: Settings,
            color: '#6b7280',
        },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'document_uploaded': return Upload;
            case 'document_approved': return CheckCircle;
            case 'document_disapproved': return XCircle;
            case 'user_created': return UserCheck;
            case 'user_assigned': return Users;
            case 'message_received': return MessageSquare;
            case 'system_update': return Settings;
            default: return FileText;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'document_uploaded': return '#3b82f6';
            case 'document_approved': return '#10b981';
            case 'document_disapproved': return '#ef4444';
            case 'user_created': return COLORS.primaryMaroon;
            case 'user_assigned': return '#8b5cf6';
            case 'message_received': return '#f59e0b';
            case 'system_update': return '#6b7280';
            default: return COLORS.mediumGray;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <DashboardLayout>
                <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Welcome back, {auth?.user?.name}!
                                </h1>
                                <p className="text-gray-600">
                                    Here's an overview of your system administration activities and current status.
                                </p>
                            </div>
                            <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: `${COLORS.primaryMaroon}20` }}>
                                <Shield className="w-8 h-8" style={{ color: COLORS.primaryMaroon }} />
                            </div>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Documents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Total Documents</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.totalDocuments}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-600">System-wide documents</span>
                            </div>
                        </div>

                        {/* Pending Review */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.pendingReview}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-yellow-600">Awaiting approval</span>
                            </div>
                        </div>

                        {/* Total Users */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.totalUsers}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <Users className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-600">Active users</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Unread Messages</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {loading ? '...' : stats.unreadMessages}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: `${COLORS.primaryMaroon}10` }}>
                                    <MessageSquare className="w-6 h-6 m-3" style={{ color: COLORS.primaryMaroon }} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <MessageSquare className="w-4 h-4 mr-1" style={{ color: COLORS.primaryMaroon }} />
                                <span style={{ color: COLORS.primaryMaroon }}>New notifications</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickLinks.map((link, index) => {
                                    const IconComponent = link.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${link.color}10` }}
                                                >
                                                    <IconComponent className="w-5 h-5" style={{ color: link.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                                                        {link.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {link.description}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                                <Bell className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="h-80 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="animate-pulse">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recentActivities.length > 0 ? (
                                    recentActivities.map(activity => {
                                        const IconComponent = getActivityIcon(activity.type);
                                        const iconColor = getActivityColor(activity.type);
                                        
                                        return (
                                            <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-b-0 last:pb-0">
                                                <div 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: `${iconColor}20` }}
                                                >
                                                    <IconComponent className="w-4 h-4" style={{ color: iconColor }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatTimestamp(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No recent activity</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            System activities will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                            {recentActivities.length > 5 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <a href="/admin/activities" className="text-sm font-medium hover:underline" style={{ color: COLORS.primaryMaroon }}>
                                        View all activities →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Document Status Overview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status Overview</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium text-gray-700">Approved</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {loading ? '...' : stats.approvedDocuments}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-sm font-medium text-gray-700">Pending Review</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {loading ? '...' : stats.pendingReview}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-sm font-medium text-gray-700">Disapproved</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {loading ? '...' : stats.disapprovedDocuments}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <a href="/admin/documents/pending" className="text-sm font-medium hover:underline" style={{ color: COLORS.primaryMaroon }}>
                                    Manage documents →
                                </a>
                            </div>
                        </div>

                        {/* System Overview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: `${COLORS.primaryMaroon}10` }}
                                        >
                                            <Users className="w-5 h-5" style={{ color: COLORS.primaryMaroon }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Total Users</p>
                                            <p className="text-xs text-gray-500">Active accounts</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {loading ? '...' : stats.totalUsers}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: `#3b82f610` }}
                                        >
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Programs</p>
                                            <p className="text-xs text-gray-500">Active programs</p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {loading ? '...' : stats.totalPrograms}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <a href="/admin/users" className="text-sm font-medium hover:underline" style={{ color: COLORS.primaryMaroon }}>
                                    Manage users →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
