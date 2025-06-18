import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function LayoutProgramsBtled() {
    return (
        <>
            <Head title="Layout: BTLED Program" />
            <DashboardLayout>
                <section className="w-full max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4 text-[#7F0404]">Layout: BTLED Program</h1>
                    <p className="text-lg text-gray-700 mb-8">This is the blank layout page for BTLED Program.</p>
                </section>
            </DashboardLayout>
        </>
    );
}
