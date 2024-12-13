// components/layouts/DashboardLayout.js
export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">
            <header></header>
            <main>{children}</main>
        </div>
    );
}
