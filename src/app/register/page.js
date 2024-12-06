"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
            if (response.status === 201) {
                router.push('/login');
            } else {
                setErrorMessage('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Register</h2>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full p-2 border rounded"
                    />
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
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}
