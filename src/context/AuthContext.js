"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await apiClient.get("/api/auth/current-user");
            if (res?.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const logout = async () => {
        await apiClient.post("/api/auth/logout");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, refetch: fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}

/** HOC: wraps a page component and redirects to /login if not authenticated */
export function withAuth(Component) {
    return function ProtectedPage(props) {
        const { user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.push("/login");
            } else if (!loading && user && !user.onboarding_complete) {
                router.push("/welcome");
            }
        }, [user, loading, router]);

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-app">
                    <p className="text-ink-soft">Loading...</p>
                </div>
            );
        }

        if (!user) return null;

        return <Component {...props} />;
    };
}
