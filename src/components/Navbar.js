import axios from 'axios';
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="flex items-center justify-between p-4 bg-blue-500 text-white">
            <h1>Classerize</h1>
            <button onClick={handleLogout} className="bg-red-500 p-2 rounded">
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
