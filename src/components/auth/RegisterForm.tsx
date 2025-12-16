"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [userType, setUserType] = useState("Admin");
  const router = useRouter();


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
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Create Account</h2>
        <p className="text-gray-500 mb-6">Register as Admin to get started</p>

        <form className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full mt-1 border rounded-md p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full mt-1 border rounded-md p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              className="w-full mt-1 border rounded-md p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border rounded-md p-3 pr-12 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">User Type</label>

            <div className="space-y-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Admin"
                  checked={userType === "Admin"}
                  onChange={() => setUserType("Admin")}
                />
                Admin
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Employee"
                  checked={userType === "Employee"}
                  onChange={() => setUserType("Employee")}
                />
                Employee
              </label>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition"
            onClick={() => router.push("/auth/verify-otp")}
          >
            Continue →
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
