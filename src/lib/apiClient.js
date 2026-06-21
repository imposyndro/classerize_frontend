/**
 * Centralized API client.
 * All fetch calls go through here so the base URL and credentials
 * are set in one place, and 401 responses redirect to /login automatically.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Redirect to login on 401 (client-side only)
    if (res.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login';
        return;
    }

    return res;
}

const apiClient = {
    get: (path, options = {}) => request(path, { method: 'GET', ...options }),
    post: (path, body, options = {}) =>
        request(path, { method: 'POST', body: JSON.stringify(body), ...options }),
    patch: (path, body, options = {}) =>
        request(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),
    put: (path, body, options = {}) =>
        request(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
    delete: (path, options = {}) => request(path, { method: 'DELETE', ...options }),
};

export default apiClient;
