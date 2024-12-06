"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/login',
                { email, password },
                { withCredentials: true }
            );
            if (response.status === 200) {
                console.log('Login successful:', response.data);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Full error object:', error);
            const message = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            setErrorMessage(message);
        }
    };




    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-2 border rounded"
                    />
                    <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
