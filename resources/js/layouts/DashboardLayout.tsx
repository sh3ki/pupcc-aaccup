import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
            <DashboardHeader />
            <main className="pt-16 flex-1 flex flex-col items-center justify-center">
                {children}
            </main>
            <DashboardFooter />
        </div>
    );
}
