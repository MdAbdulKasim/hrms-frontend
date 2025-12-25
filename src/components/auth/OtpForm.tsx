"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function VerifyOTPPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to {email && <span className="font-medium">{email}</span>}
        </p>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-between mb-4">
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
              className={`w-12 h-12 border rounded-lg text-center text-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${error ? "border-red-300 focus:ring-red-500" : ""
                }`}
            />
          ))}
        </div>

        {/* Resend OTP with Timer */}
        <p className="text-center text-sm text-gray-600 mb-4">
          Didn't receive code?{" "}
          <button
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className={`font-medium transition ${canResend
              ? "text-blue-600 hover:underline cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
              }`}
          >
            {canResend ? "Resend OTP" : `Resend in ${timer}s`}
          </button>
        </p>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={otp.join("").length !== 6 || isLoading}
          className={`w-full py-2 rounded-md text-white font-medium transition flex items-center justify-center
            ${otp.join("").length === 6 && !isLoading
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
            }`}
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
          className="w-full mt-4 bg-gray-200 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
          onClick={() => router.push("/auth/register")}
          disabled={isLoading}
        >
          Back
        </button>
      </div>
    </div>
  );
}