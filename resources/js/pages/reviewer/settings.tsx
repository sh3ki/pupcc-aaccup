import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function ReviewerSettings() {
    return (
        <>
            <Head title="Reviewer Settings" />
            <DashboardLayout>
                <section className="w-full max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[#7F0404]">Settings</h1>
                    <p className="text-lg text-gray-700 mb-8">This is the settings page for reviewer. (Blank page)</p>
                </section>
            </DashboardLayout>
        </>
    );
}
