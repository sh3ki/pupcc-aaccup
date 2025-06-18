import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function ReviewerMessages() {
    return (
        <>
            <Head title="Reviewer Messages" />
            <DashboardLayout>
                <section className="w-full max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[#7F0404]">Messages</h1>
                    <p className="text-lg text-gray-700 mb-8">This is the messages page for reviewer. (Blank page)</p>
                </section>
            </DashboardLayout>
        </>
    );
}
