"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  submit?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors] || errors.submit) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        submit: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Use environment variable with fallback for development
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      // Ensure protocol is present
      const apiUrl = BASE_URL.startsWith("http") ? BASE_URL : `http://${BASE_URL}`;

      setIsLoading(true);
      try {
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password
        };

        console.log("Using API URL:", apiUrl);
        await axios.post(`${apiUrl}/auth/signup`, payload);

        // Store email for OTP verification
        localStorage.setItem("registrationEmail", formData.email);

        // Navigate to OTP verification page on success
        router.push("/auth/verify-otp");
      } catch (error: any) {
        console.error("Registration error:", error);
        setErrors(prev => ({
          ...prev,
          submit: error.response?.data?.message || "Registration failed. Please try again."
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-10 border border-gray-100">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
              HR
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HRMS</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Enterprise Suite</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm">Join our platform and manage your workforce with ease.</p>
          </div>

          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-red-100 rounded-full text-xs font-bold">!</span>
              <p>{errors.submit}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Martha Nielsen"
                  disabled={isLoading}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.fullName ? "border-red-500 bg-red-50/30 ring-red-500/10" : ""
                    }`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-2 font-medium ml-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="martha.nielsen@company.com"
                  disabled={isLoading}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.email ? "border-red-500 bg-red-50/30 ring-red-500/10" : ""
                    }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 font-medium ml-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.phone ? "border-red-500 bg-red-50/30 ring-red-500/10" : ""
                    }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-2 font-medium ml-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.password ? "border-red-500 bg-red-50/30 ring-red-500/10" : ""
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 font-medium ml-1">{errors.password}</p>
                )}
              </div>
            </div>

            <button
              id="register-submit-button"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:active:scale-100 mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 font-medium">
              Already have an account?{" "}
              <a href="/auth/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">
                Sign In
              </a>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Antigravity HRMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}