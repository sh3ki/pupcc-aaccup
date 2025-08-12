import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { User, Lock, Palette, Settings } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: User,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: Lock,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#7F0404] rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-gray-600">Manage your profile and account settings</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-8">
                <aside className="w-full lg:w-64">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                            <h2 className="font-semibold text-gray-800">Navigation</h2>
                        </div>
                        <nav className="p-2">
                            {sidebarNavItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={`${item.href}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'w-full justify-start mb-1 h-auto p-3 text-left font-normal',
                                            {
                                                'bg-[#7F0404] text-white hover:bg-[#4D1414] hover:text-white': currentPath === item.href,
                                                'text-gray-700 hover:bg-gray-50': currentPath !== item.href,
                                            }
                                        )}
                                    >
                                        <Link href={item.href} prefetch className="flex items-center gap-3">
                                            {Icon && <Icon className="w-4 h-4" />}
                                            {item.title}
                                        </Link>
                                    </Button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div className="flex-1">
                    <section className="max-w-3xl">{children}</section>
                </div>
            </div>
        </div>
    );
}
