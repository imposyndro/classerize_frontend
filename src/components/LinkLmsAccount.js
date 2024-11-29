import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LinkLmsAccount() {
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({ lms_name: '', lms_user_id: '', access_token: '' });

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('/api/linkedAccounts', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching linked accounts:', error);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/linkedAccounts/add', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAccounts(); // Refresh the list after adding
        } catch (error) {
            console.error('Error adding linked account:', error);
        }
    };

    const handleDelete = async (accountId) => {
        try {
            await axios.delete(`/api/linkedAccounts/delete/${accountId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAccounts(); // Refresh the list after deleting
        } catch (error) {
            console.error('Error deleting linked account:', error);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
            <h2 className="text-2xl font-bold mb-4">Link LMS Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" className="border rounded p-2 w-full" placeholder="LMS Name" value={formData.lms_name} onChange={(e) => setFormData({ ...formData, lms_name: e.target.value })} required />
                <input type="text" className="border rounded p-2 w-full" placeholder="LMS User ID" value={formData.lms_user_id} onChange={(e) => setFormData({ ...formData, lms_user_id: e.target.value })} required />
                <input type="text" className="border rounded p-2 w-full" placeholder="Access Token" value={formData.access_token} onChange={(e) => setFormData({ ...formData, access_token: e.target.value })} required />
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add Account</button>
            </form>

            <h3 className="text-xl font-semibold mt-8">Linked Accounts</h3>
            <ul className="list-disc pl-5 mt-4">
                {accounts.map(account => (
                    <li key={account.account_id} className="mb-2 flex justify-between items-center">
                        {account.lms_name} ({account.lms_user_id})
                        <button onClick={() => handleDelete(account.account_id)} className="text-red-500 hover:underline">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
