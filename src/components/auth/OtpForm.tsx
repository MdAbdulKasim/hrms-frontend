"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function VerifyOTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // references to 6 input fields
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // update OTP logic with auto move
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

  const handleVerify = () => {
     localStorage.setItem("isNewUser", "true");
    // For frontend testing: accept any 6-digit code
    if (otp.join("").length === 6) {
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2">Verify Email</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to your email
        </p>

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
                className="w-12 h-12 border rounded-lg text-center text-xl focus:ring-2 focus:ring-blue-500"
                />

          ))}
        </div>

        {/* Resend OTP */}
        <p className="text-center text-sm text-gray-600 mb-4">
          Didn’t receive code?{" "}
          <button className="text-blue-600 font-medium hover:underline">
            Resend OTP
          </button>
        </p>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={otp.join("").length !== 6}
          className={`w-full py-2 rounded-md text-white font-medium transition
            ${otp.join("").length === 6
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
            }`}
        >
          Verify →
        </button>

        {/* Back Button */}
        <button
          className="w-full mt-4 bg-gray-200 py-2 rounded-md hover:bg-gray-300"
          onClick={() => router.push("/register")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
