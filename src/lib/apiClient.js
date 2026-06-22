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

    // NOTE: do NOT hard-redirect on 401 here. A 401 from /api/auth/current-user
    // is expected when logged out (e.g. on the login page itself) and a forced
    // window.location redirect would cause an infinite reload loop. Auth-based
    // routing is handled by AuthContext + the withAuth HOC instead.
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
