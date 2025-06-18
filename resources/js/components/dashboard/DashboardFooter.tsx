const COLORS = {
    primaryMaroon: '#7F0404',
};

export default function DashboardFooter() {
    return (
        <footer className="text-white py-2 text-center mt-auto" style={{ backgroundColor: COLORS.primaryMaroon }}>
            <span className="text-sm">&copy; {new Date().getFullYear()} PUP Calauan Campus. All rights reserved.</span>
        </footer>
    );
}
