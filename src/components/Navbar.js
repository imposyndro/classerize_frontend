import { destroyCookie } from 'nookies';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHome, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        destroyCookie(null, 'token');
        router.push('/login');
    };

    return (
        <nav className="bg-blue-800 p-4 shadow-md">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Classerize</h1>
                <ul className="flex space-x-6 text-white">
                    <li>
                        <Link href="/" className="flex items-center space-x-1 hover:underline">
                            <FaHome />
                            <span>Home</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard" className="flex items-center space-x-1 hover:underline">
                            <FaUserCircle />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <button onClick={handleLogout} className="hover:underline">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
