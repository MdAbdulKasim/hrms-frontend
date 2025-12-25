"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function OtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Timer State ---
  const [timer, setTimer] = useState(30); // Start with 30 seconds
  const [canResend, setCanResend] = useState(false);

  // references to 6 input fields
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("registrationEmail");
    if (!storedEmail) {
      // If no email found, redirect back to register
      router.push("/auth/register");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;

    // Logic to trigger backend resend goes here
    console.log("OTP Resent!");

    // Reset timer state
    setTimer(30);
    setCanResend(false);
  };

  // update OTP logic with auto move
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next field if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace → move focus to previous input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || !email) return;

    // Use environment variable with fallback for development
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // Ensure protocol is present
    const apiUrl = BASE_URL.startsWith("http") ? BASE_URL : `http://${BASE_URL}`;

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        email: email,
        otp: otpValue
      };

      console.log("Using API URL:", apiUrl);
      const response = await axios.post(`${apiUrl}/auth/verify-otp`, payload);

      if (response.data.success) {
        // Clear stored email
        localStorage.removeItem("registrationEmail");
        // Redirect to login page
        router.push("/auth/login");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-10 border border-gray-100 text-center">

          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We've sent a 6-digit verification code to
              <span className="block font-bold text-gray-900 mt-1">{email || "your email"}</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex justify-between gap-2 sm:gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isLoading}
                className={`w-full h-12 sm:h-14 border-2 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-50 ${error
                    ? "border-red-200 text-red-600 bg-red-50/30 focus:border-red-500"
                    : "border-gray-100 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
              />
            ))}
          </div>

          {/* Resend OTP with Timer */}
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              Didn't receive code?{" "}
              <button
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className={`font-bold transition-colors ml-1 ${canResend
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-gray-400 cursor-not-allowed"
                  }`}
              >
                {canResend ? "Resend Now" : `Resend in ${timer}s`}
              </button>
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleVerify}
              disabled={otp.join("").length !== 6 || isLoading}
              className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center
                ${otp.join("").length === 6 && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 active:scale-[0.98]"
                  : "bg-gray-300 cursor-not-allowed shadow-none"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>

            <button
              className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => router.push("/auth/register")}
              disabled={isLoading}
            >
              Change Email
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Antigravity HRMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}