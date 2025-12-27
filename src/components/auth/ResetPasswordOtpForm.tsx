"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "@/lib/auth";

export default function ResetPasswordOtpForm() {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<HTMLInputElement[]>([]);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        // Get email from localStorage
        const storedEmail = localStorage.getItem("resetPasswordEmail");
        if (!storedEmail) {
            // If no email found, redirect back to start
            router.push("/auth/forgot-password");
        } else {
            setEmail(storedEmail);
        }
    }, [router]);

    useEffect(() => {
        // Timer countdown
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (timer > 0 || !email) return;

        setIsLoading(true);
        try {
            const apiUrl = getApiUrl();
            const payload = { email };

            console.log("Resending reset password OTP to:", email);
            await axios.post(`${apiUrl}/auth/forgot-password`, payload);

            setTimer(30); // Reset timer
            setError("");
            console.log("Reset password OTP resent successfully!");
        } catch (error: any) {
            console.error("Resend reset OTP error:", error);
            setError(error.response?.data?.message || "Failed to resend code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join("");
        if (otpValue.length !== 6 || !email) return;

        setIsLoading(true);
        try {
            const apiUrl = getApiUrl();
            const payload = { email, otp: otpValue };

            console.log("Verifying reset password OTP for:", email);
            await axios.post(`${apiUrl}/auth/verify-reset-otp`, payload);

            console.log("Reset password OTP verified successfully!");
            router.push("/auth/reset-password");
        } catch (error: any) {
            console.error("Verify reset OTP error:", error);
            setError(error.response?.data?.message || "Invalid code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e9f0f8] to-white p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

                {/* Title */}
                <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
                </p>

                {error && (
                    <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center">
                        {error}
                    </div>
                )}

                {/* OTP Inputs */}
                <div className="flex justify-between mb-6 gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                if (el) inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            disabled={isLoading}
                            className={`w-12 h-12 border rounded-lg text-center text-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${error ? "border-red-300 focus:ring-red-500" : ""
                                }`}
                        />
                    ))}
                </div>

                {/* Resend Logic */}
                <div className="text-center text-sm mb-6">
                    {timer > 0 ? (
                        <p className="text-gray-500">
                            Resend code in <span className="font-medium text-gray-700">{timer}s</span>
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            Didn't receive code?{" "}
                            <button
                                onClick={handleResend}
                                disabled={isLoading}
                                className="text-blue-600 font-medium hover:underline disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        </p>
                    )}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={otp.join("").length !== 6 || isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify →"
                    )}
                </button>

                {/* Back Button */}
                <button
                    className="w-full mt-3 text-gray-500 py-2 rounded-md hover:text-gray-700 text-sm"
                    onClick={() => router.push("/auth/forgot-password")}
                    disabled={isLoading}
                >
                    Back
                </button>
            </div>
        </div>
    );
}
