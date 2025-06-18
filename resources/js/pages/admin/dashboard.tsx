import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />
            <DashboardLayout>
                <section className="w-full max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[#7F0404]">Welcome, Admin!</h1>
                    <p className="text-lg text-gray-700 mb-8">This is your admin dashboard. Manage users, view reports, and configure settings here.</p>
                    {/* Add admin-specific widgets/components here */}
                </section>
            </DashboardLayout>
        </>
    );
}
