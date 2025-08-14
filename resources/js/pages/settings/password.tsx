import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Lock, Shield, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Update Password Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#7F0404] rounded-lg flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Update Password</h3>
                            </div>
                            <p className="text-gray-600">Ensure your account is using a long, random password to stay secure.</p>
                        </div>

                        <form onSubmit={updatePassword} className="p-6 space-y-6">
                            <div className="max-w-md space-y-6">
                                <div>
                                    <Label htmlFor="current_password" className="text-sm font-medium text-gray-700 mb-2 block">
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                            type="password"
                                            autoComplete="current-password"
                                            className="pl-10 border-gray-200 focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                            placeholder="Enter your current password"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    <InputError message={errors.current_password} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            type="password"
                                            autoComplete="new-password"
                                            className="pl-10 border-gray-200 focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                            placeholder="Enter your new password"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 mb-2 block">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            type="password"
                                            autoComplete="new-password"
                                            className="pl-10 border-gray-200 focus:ring-2 focus:ring-[#7F0404]/20 focus:border-[#7F0404] transition-colors"
                                            placeholder="Confirm your new password"
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-[#7F0404] hover:bg-[#4D1414] text-white px-6 py-2.5"
                                >
                                    {processing ? 'Updating...' : 'Update Password'}
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <Check className="w-4 h-4" />
                                        <span>Password updated successfully!</span>
                                    </div>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    {/* Security Tips Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                        <div className="p-6 border-b border-blue-200 bg-blue-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-800">Security Tips</h3>
                            </div>
                            <p className="text-blue-600">Follow these best practices to keep your account secure.</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 text-xs font-semibold">1</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Use a strong password</h4>
                                        <p className="text-sm text-gray-600">At least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 text-xs font-semibold">2</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Make it unique</h4>
                                        <p className="text-sm text-gray-600">Don't reuse passwords from other accounts or services.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-blue-600 text-xs font-semibold">3</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">Consider a password manager</h4>
                                        <p className="text-sm text-gray-600">Use a trusted password manager to generate and store complex passwords.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
