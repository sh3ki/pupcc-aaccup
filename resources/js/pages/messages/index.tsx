import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import MessagingPanel from '@/components/messaging/MessagingPanel';
import type { SharedData } from '@/types';

export default function MessagesIndex() {
    const { auth } = (usePage().props as unknown as SharedData);
    const user = auth.user as unknown as { id: number; name?: string; avatar?: string };
    return (
        <>
            <Head title="Messages" />
            <DashboardLayout>
                <MessagingPanel currentUser={{ id: user.id, name: user.name, avatar: user.avatar }} />
            </DashboardLayout>
        </>
    );
}
