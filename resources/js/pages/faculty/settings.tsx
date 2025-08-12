import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useState } from 'react';
import { User, Lock, Palette, Bell, FileText, BookOpen, Globe } from 'lucide-react';

export default function FacultySettings() {
    const [activeTab, setActiveTab] = useState('profile');

    const settingsTabs = [
        { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal information' },
        { id: 'password', label: 'Password', icon: Lock, description: 'Update your password and security' },
        { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize your interface' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Control your notification preferences' },
        { id: 'document-preferences', label: 'Document Preferences', icon: FileText, description: 'Manage document submission settings' },
        { id: 'academic-info', label: 'Academic Information', icon: BookOpen, description: 'Update teaching and research details' },
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
                                            <p className="text-gray-600 mb-6">Update your account's profile information and contact details.</p>
                                        </div>
                                        
                                        <form className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="Enter your email"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors">
                                                        <option>Select Department</option>
                                                        <option>Computer Science</option>
                                                        <option>Engineering</option>
                                                        <option>Business Administration</option>
                                                        <option>Education</option>
                                                        <option>Liberal Arts</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="Your employee ID"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Rank/Position</label>
                                                <select className="w-full max-w-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors">
                                                    <option>Select Rank</option>
                                                    <option>Instructor</option>
                                                    <option>Assistant Professor</option>
                                                    <option>Associate Professor</option>
                                                    <option>Professor</option>
                                                    <option>Department Head</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
                                                <textarea
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="Brief description of your academic background, research interests, and expertise..."
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

                                {activeTab === 'document-preferences' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Document Preferences</h3>
                                            <p className="text-gray-600 mb-6">Configure your document submission and management settings.</p>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Default Document Category</label>
                                                <select className="w-full max-w-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors">
                                                    <option>Research Papers</option>
                                                    <option>Course Materials</option>
                                                    <option>Academic Reports</option>
                                                    <option>Conference Presentations</option>
                                                    <option>Thesis/Dissertation</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Submission Notification Preferences</label>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-3">
                                                        <input type="checkbox" className="text-[#7F0404]" defaultChecked />
                                                        <span className="text-gray-700">Email confirmation for successful submissions</span>
                                                    </label>
                                                    <label className="flex items-center gap-3">
                                                        <input type="checkbox" className="text-[#7F0404]" defaultChecked />
                                                        <span className="text-gray-700">Status update notifications</span>
                                                    </label>
                                                    <label className="flex items-center gap-3">
                                                        <input type="checkbox" className="text-[#7F0404]" />
                                                        <span className="text-gray-700">Deadline reminders for pending documents</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">Auto-save Draft Frequency</label>
                                                <select className="w-full max-w-sm px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors">
                                                    <option>Every 30 seconds</option>
                                                    <option>Every minute</option>
                                                    <option>Every 5 minutes</option>
                                                    <option>Manual save only</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Save Document Preferences
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'academic-info' && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Academic Information</h3>
                                            <p className="text-gray-600 mb-6">Update your teaching load, research interests, and academic qualifications.</p>
                                        </div>
                                        
                                        <form className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Research Interests</label>
                                                <textarea
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="List your research interests and areas of expertise..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Load (Units)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="e.g., 21"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                        placeholder="e.g., 5"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Courses Teaching</label>
                                                <textarea
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                                    placeholder="List the courses you are currently teaching..."
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Save Academic Info
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
