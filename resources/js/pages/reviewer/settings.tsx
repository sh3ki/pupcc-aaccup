import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState } from 'react';
import { User, Lock, Palette, Bell, FileCheck, Globe } from 'lucide-react';

export default function ReviewerSettings() {
    const [activeTab, setActiveTab] = useState('profile');

    const settingsTabs = [
        { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
        { id: 'password', label: 'Password', icon: Lock, description: 'Update your password and security' },
        { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize your interface' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Control your notification preferences' },
        { id: 'review-preferences', label: 'Review Preferences', icon: FileCheck, description: 'Manage document review settings' },
        { id: 'preferences', label: 'General Preferences', icon: Globe, description: 'General application preferences' },
    ];

    return (
        <>
            <Head title="Settings" />
            <DashboardLayout>
                <div className="w-full max-w-6xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                            {/* Settings Navigation */}
                            <div className="lg:w-80 bg-gray-50 border-r border-gray-200">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings Menu</h2>
                                    <nav className="space-y-2">
                                        {settingsTabs.map((tab) => {
                                            const Icon = tab.icon;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                                                        activeTab === tab.id
                                                            ? 'bg-[#7F0404] text-white shadow-sm'
                                                            : 'text-gray-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <div>
                                                        <div className="font-medium">{tab.label}</div>
                                                        <div className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>
                                                            {tab.description}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>

                            {/* Settings Content */}
                            <div className="flex-1 p-6 lg:p-8">
                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Profile Information</h3>
                                            <p className="text-gray-600 mb-6">Update your account's profile information and email address.</p>
                                        </div>
                                        
                                        <form className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="Enter your email"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Department/Area of Expertise</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="Your department or area of expertise"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="Brief description of your professional background and expertise..."
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'password' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Change Password</h3>
                                            <p className="text-gray-600 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                                        </div>
                                        
                                        <form className="space-y-6 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="Enter current password"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="Enter new password"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Update Password
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Appearance Settings</h3>
                                            <p className="text-gray-600 mb-6">Customize how the application looks and feels.</p>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {['Light', 'Dark', 'System'].map((theme) => (
                                                        <div key={theme} className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#7F0404] transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-gray-700">{theme}</span>
                                                                <input type="radio" name="theme" className="text-[#7F0404]" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                                                <select className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors">
                                                    <option>English</option>
                                                    <option>Filipino</option>
                                                    <option>Español</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Save Preferences
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'review-preferences' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Review Preferences</h3>
                                            <p className="text-gray-600 mb-6">Configure your document review settings and preferences.</p>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Default Review Status</label>
                                                <select className="w-full max-w-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors">
                                                    <option>Pending Review</option>
                                                    <option>Under Review</option>
                                                    <option>Needs Revision</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Review Notification Frequency</label>
                                                <div className="space-y-2">
                                                    {['Immediate', 'Daily Digest', 'Weekly Summary', 'Manual Only'].map((frequency) => (
                                                        <label key={frequency} className="flex items-center gap-3">
                                                            <input type="radio" name="notification-frequency" className="text-[#7F0404]" />
                                                            <span className="text-gray-700">{frequency}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="text-[#7F0404]" />
                                                    <span className="text-gray-700">Auto-assign documents based on expertise area</span>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-3">
                                                    <input type="checkbox" className="text-[#7F0404]" />
                                                    <span className="text-gray-700">Send reminder notifications for pending reviews</span>
                                                </label>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Save Review Preferences
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {['notifications', 'preferences'].includes(activeTab) && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                {settingsTabs.find(tab => tab.id === activeTab)?.label}
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                {settingsTabs.find(tab => tab.id === activeTab)?.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                {(() => {
                                                    const tab = settingsTabs.find(t => t.id === activeTab);
                                                    const Icon = tab?.icon;
                                                    return Icon ? <Icon className="w-8 h-8 text-gray-400" /> : null;
                                                })()}
                                            </div>
                                            <h4 className="text-lg font-medium text-gray-600 mb-2">Coming Soon</h4>
                                            <p className="text-gray-500 max-w-md">
                                                This settings section is under development. Additional features will be available in future updates.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
