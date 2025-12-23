"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRouter() {
    const { user, token } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        
        if (user) {
            if (user.role === 'doctor') {
                router.push('/doctor-dashboard');
            } else if (user.role === 'admin') {
                 router.push('/admin-dashboard'); 
            } else {
                 router.push('/patient-dashboard');
            }
        }
    }, [user, token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-4 bg-gray-300 rounded-full mb-2"></div>
                <p className="text-gray-500">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
