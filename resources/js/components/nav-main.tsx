import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useUnreadMessagesCount } from '../hooks/useUnreadMessages';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { total } = useUnreadMessagesCount();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton  
                            asChild isActive={item.href === page.url}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch className="flex items-center gap-2 w-full">
                                {item.icon && <item.icon />}
                                <span className="flex-1 text-left">{item.title}</span>
                                {item.title === 'Messages' && total > 0 && (
                                    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-[#4D1414] px-1.5 text-[10px] font-semibold leading-5 text-white">
                                        {total > 99 ? '99+' : total}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
