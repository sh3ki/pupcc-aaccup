import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function FacultyDashboard() {
    return (
        <>
            <Head title="Faculty Dashboard" />
            <DashboardLayout>
                <section className="w-full max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[#7F0404]">Welcome, Faculty!</h1>
                    <p className="text-lg text-gray-700 mb-8">This is your faculty dashboard. Manage documents, and configure settings here.</p>
                    {/* Add admin-specific widgets/components here */}
                </section>
            </DashboardLayout>
        </>
    );
}
