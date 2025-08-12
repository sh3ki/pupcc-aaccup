import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Globe, Type, Eye } from 'lucide-react';

import AppearanceTabs from '@/components/appearance-tabs';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [fontSize, setFontSize] = useState('medium');

    const themes = [
        { id: 'light', name: 'Light', description: 'Clean and bright interface', icon: Sun },
        { id: 'dark', name: 'Dark', description: 'Easy on the eyes', icon: Moon },
        { id: 'system', name: 'System', description: 'Follows your device setting', icon: Monitor },
    ];

    const languages = [
        { id: 'en', name: 'English', flag: '🇺🇸' },
        { id: 'fil', name: 'Filipino', flag: '🇵🇭' },
        { id: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    const fontSizes = [
        { id: 'small', name: 'Small', description: 'Compact text size' },
        { id: 'medium', name: 'Medium', description: 'Standard text size' },
        { id: 'large', name: 'Large', description: 'Larger text for better readability' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Theme Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#7F0404] rounded-lg flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Theme Preference</h3>
                            </div>
                            <p className="text-gray-600">Choose how the application looks and feels.</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {themes.map((theme) => {
                                    const Icon = theme.icon;
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => setSelectedTheme(theme.id)}
                                            className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                                selectedTheme === theme.id
                                                    ? 'border-[#7F0404] bg-[#7F0404]/5'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    selectedTheme === theme.id 
                                                        ? 'bg-[#7F0404] text-white' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className={`font-medium ${
                                                    selectedTheme === theme.id ? 'text-[#7F0404]' : 'text-gray-800'
                                                }`}>
                                                    {theme.name}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{theme.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Language Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#7F0404] rounded-lg flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Language & Region</h3>
                            </div>
                            <p className="text-gray-600">Select your preferred language for the interface.</p>
                        </div>

                        <div className="p-6">
                            <div className="max-w-md">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Interface Language
                                </label>
                                <div className="space-y-2">
                                    {languages.map((language) => (
                                        <button
                                            key={language.id}
                                            onClick={() => setSelectedLanguage(language.id)}
                                            className={`w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${
                                                selectedLanguage === language.id
                                                    ? 'border-[#7F0404] bg-[#7F0404]/5'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-xl">{language.flag}</span>
                                            <span className={`font-medium ${
                                                selectedLanguage === language.id ? 'text-[#7F0404]' : 'text-gray-800'
                                            }`}>
                                                {language.name}
                                            </span>
                                            {selectedLanguage === language.id && (
                                                <div className="ml-auto w-5 h-5 bg-[#7F0404] rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Font Size Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#7F0404] rounded-lg flex items-center justify-center">
                                    <Type className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Font Size</h3>
                            </div>
                            <p className="text-gray-600">Adjust the text size for better readability.</p>
                        </div>

                        <div className="p-6">
                            <div className="max-w-md space-y-4">
                                {fontSizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setFontSize(size.id)}
                                        className={`w-full flex items-center justify-between p-4 border rounded-lg text-left transition-colors ${
                                            fontSize === size.id
                                                ? 'border-[#7F0404] bg-[#7F0404]/5'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div>
                                            <div className={`font-medium mb-1 ${
                                                fontSize === size.id ? 'text-[#7F0404]' : 'text-gray-800'
                                            } ${
                                                size.id === 'small' ? 'text-sm' : 
                                                size.id === 'large' ? 'text-lg' : 'text-base'
                                            }`}>
                                                {size.name}
                                            </div>
                                            <div className="text-sm text-gray-600">{size.description}</div>
                                        </div>
                                        {fontSize === size.id && (
                                            <div className="w-5 h-5 bg-[#7F0404] rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Appearance Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#7F0404] rounded-lg flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Advanced Appearance</h3>
                            </div>
                            <p className="text-gray-600">Additional customization options and theme components.</p>
                        </div>
                        <div className="p-6">
                            <AppearanceTabs />
                        </div>
                    </div>

                    {/* Save Settings */}
                    <div className="flex gap-3 pt-4">
                        <button className="px-6 py-2.5 bg-[#7F0404] hover:bg-[#4D1414] text-white rounded-lg transition-colors duration-200 font-medium">
                            Save Preferences
                        </button>
                        <button className="px-6 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium">
                            Reset to Default
                        </button>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
