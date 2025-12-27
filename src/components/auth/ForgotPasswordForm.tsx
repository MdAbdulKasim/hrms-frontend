"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getApiUrl } from "@/lib/auth";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            const apiUrl = getApiUrl();
            const payload = { email };

            console.log("Sending forgot password OTP to:", email);
            await axios.post(`${apiUrl}/auth/forgot-password`, payload);

            // Store email to display on next page or use for verification
            localStorage.setItem("resetPasswordEmail", email);

            router.push("/auth/forgot-password/verify-otp");
        } catch (error: any) {
            console.error("Forgot password error:", error);
            setError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e9f0f8] to-white p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        HR
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-800">HRMS</h1>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Forgot Password</h2>
                <p className="text-gray-500 mb-6 font-normal">
                    Enter your email address to receive a verification code
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="your@email.com"
                            disabled={isLoading}
                            className={`w-full mt-1 border rounded-md p-3 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${error ? "border-red-500" : ""
                                }`}
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending OTP...
                            </>
                        ) : (
                            "Send OTP"
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Remember your password?{" "}
                    <a href="/auth/login" className="text-blue-600 font-medium hover:underline">
                        Back to Login
                    </a>
                </p>
            </div>
        </div>
    );
}
