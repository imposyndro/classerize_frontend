// components/layouts/DashboardLayout.js
export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">
            <header>Classerize</header>
            <main>{children}</main>
        </div>
    );
}
