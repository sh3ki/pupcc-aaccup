import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function AdminDocuments() {
    return (
        <>
            <Head title="Documents" />
            <DashboardLayout>
                <section className="w-full max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[#7F0404]">Documents</h1>
                    <p className="text-lg text-gray-700 mb-8">This is the documents page for admin. (Blank page)</p>
                    {/* Add documents management features here in the future */}
                </section>
            </DashboardLayout>
        </>
    );
}
