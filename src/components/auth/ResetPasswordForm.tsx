"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPasswordForm() {
    const router = useRouter();
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Password validation (min 6 chars for now)
    const validatePassword = (pass: string) => pass.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.password || !formData.confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (!validatePassword(formData.password)) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Simulate password update API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Clear storage
            localStorage.removeItem("resetPasswordEmail");

            // Redirect to login
            router.push("/auth/login");
        } catch {
            setError("Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e9f0f8] to-white p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

                {/* Title */}
                <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Create a new password for your account
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* New Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPass ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="w-full border rounded-md p-3 pr-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-3 text-gray-500"
                                disabled={isLoading}
                            >
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showConfirmPass ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="w-full border rounded-md p-3 pr-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-3 top-3 text-gray-500"
                                disabled={isLoading}
                            >
                                {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
