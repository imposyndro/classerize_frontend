import Link from 'next/link';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function HomePage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Classerize</h1>
                <div className="flex flex-col space-y-4">
                    <Link href="/login" className="bg-blue-500 text-white p-4 rounded-lg text-lg flex items-center justify-center space-x-2 hover:bg-blue-600">
                        <FaSignInAlt />
                        <span>Login</span>
                    </Link>
                    <Link href="/register" className="bg-green-500 text-white p-4 rounded-lg text-lg flex items-center justify-center space-x-2 hover:bg-green-600">
                        <FaUserPlus />
                        <span>Register</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
