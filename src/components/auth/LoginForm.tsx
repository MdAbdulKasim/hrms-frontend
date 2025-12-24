"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"admin" | "employee">("admin");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // Save role to localStorage
      localStorage.setItem("role", userType);

      // ✅ Both admin and employee go to /setup first
      // The setup page will check if setup is completed and redirect accordingly
      window.location.href = "/setup";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-gray-100 to-gray-200 p-4">
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

        <div className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className={`w-full mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : ""
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full border rounded-md p-2 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : ""
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}

            <div className="flex justify-end mt-1">
              <a
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          {/* USER TYPE SELECTION */}
          <div>
            <label className="text-sm font-medium text-gray-700">User Type</label>

            <div className="space-y-2 mt-1">
              {/* ADMIN */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="admin"
                  checked={userType === "admin"}
                  onChange={() => setUserType("admin")}
                  className="cursor-pointer"
                />
                <span className="text-gray-700">Admin</span>
              </label>

              {/* EMPLOYEE */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="employee"
                  checked={userType === "employee"}
                  onChange={() => setUserType("employee")}
                  className="cursor-pointer"
                />
                <span className="text-gray-700">Employee</span>
              </label>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
            onClick={handleLogin}
          >
            Sign In
          </button>
        </div>

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