import Link from 'next/link';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function HomePage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-app px-4">
            <div className="card-tile p-8 w-full max-w-sm">
                <div className="flex items-center gap-2 justify-center mb-6">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-fg text-base font-bold">C</span>
                    <h1 className="text-2xl font-bold text-ink">Classerize</h1>
                </div>
                <div className="flex flex-col space-y-3">
                    <Link href="/login" className="bg-brand text-brand-fg p-4 rounded-xl text-base font-medium flex items-center justify-center gap-2 hover:bg-brand-hover transition">
                        <FaSignInAlt />
                        <span>Login</span>
                    </Link>
                    <Link href="/register" className="border border-line text-ink p-4 rounded-xl text-base font-medium flex items-center justify-center gap-2 hover:bg-subtle transition">
                        <FaUserPlus />
                        <span>Register</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
