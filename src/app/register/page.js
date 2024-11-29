// app/register/page.js - Register Page
"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/users/register', { username, email, password });
            router.push('/login');
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Register</h1>
            <form onSubmit={handleRegister} className="mt-4">
                <label className="block mb-2">Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border p-2 mb-4 w-full"
                />
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
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Register</button>
            </form>
        </div>
    );
}