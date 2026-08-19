import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log('Fetching user from /api/auth/current-user'); // Log fetch initiation
                const response = await fetch('http://localhost:5000/api/auth/current-user', {
                    method: 'GET',
                    credentials: 'include', // Ensures cookies are sent
                });
                console.log('Response Status:', response.status); // Log response status
                if (!response.ok) {
                    throw new Error(`Failed to fetch user: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched User Data:', data); // Log response data
                if (data.username) {
                    setUsername(data.username);
                } else {
                    throw new Error('Username not found in response');
                }
            } catch (error) {
                console.error('Error fetching user in Navbar:', error.message || error);
                setUsername(''); // Clear the username if fetching fails
            }
        };

        fetchUser();
    }, []);

    return (
        <nav className="flex items-center justify-between bg-blue-600 p-4 text-white">
            <div className="text-xl font-bold">Classerize</div>
            <div className="flex items-center gap-6">
                <Link
                    href="/ai-usage"
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition hover:bg-blue-500"
                >
                    AI Usage
                </Link>
                <span>{username ? `Welcome, ${username}` : 'Loading...'}</span>
            </div>
        </nav>
    );
};

export default Navbar;
