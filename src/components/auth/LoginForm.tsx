"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Later you can add real authentication
    // For now, simply redirect to dashboard
    router.push("/my-space/overview");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg text-white flex items-center justify-center font-bold">
            HR
          </div>
          <h1 className="text-xl font-semibold">HRMS</h1>
        </div>

        <h2 className="text-lg font-semibold mb-2">Login</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your credentials to access the system
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full mt-1 border rounded-md p-2"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full border rounded-md p-2 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
          onClick={handleLogin}
        >
          Sign In
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-blue-600 hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
