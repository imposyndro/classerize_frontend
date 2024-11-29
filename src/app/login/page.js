"use client"; // Add this at the very top

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });

            // Store the token in localStorage
            const token = response.data.token;
            localStorage.setItem('token', token);

            // Redirect after successful login
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            alert(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Login</h1>
            <form onSubmit={handleLogin} className="mt-4">
                <label className="block mb-2">Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 mb-4 w-full"
                />
                <label className="block mb-2">Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 mb-4 w-full"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
}
