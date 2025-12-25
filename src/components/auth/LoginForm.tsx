"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // User type selection is handled by the backend response usually, 
  // but keeping it if UI needs it for visually selecting role before login (though API response has role).
  // The user prompt showed response has "role": "admin". 
  // I will keep the UI selector if it was intended to filter or set context, 
  // but strictly speaking the API returns the role. 
  // However, the existing UI had it, so I'll keep it but rely on API response for logic.
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

  const handleLogin = async () => {
    if (validateForm()) {
      // Use environment variable with fallback for development
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      // Ensure protocol is present
      const apiUrl = BASE_URL.startsWith("http") ? BASE_URL : `http://${BASE_URL}`;

      setIsLoading(true);
      try {
        console.log("Using API URL:", apiUrl);
        const response = await axios.post(`${apiUrl}/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        if (response.data.success) {
          const { token, role, employee, employeeId } = response.data;

          // Determine ID to save (response example has 'employeeId' at top level, or inside 'employee' object)
          // The prompt example showed: "employeeId": "..." and "role": "admin"
          const id = employeeId || employee?.id;

          // Store token in cookie for API authorization (expires in 7 days)
          document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

          // Also keep in localStorage for backward compatibility
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          if (id) localStorage.setItem("hrms_user_id", id);
          if (formData.email) localStorage.setItem("hrms_user_email", formData.email);

          // Redirect to setup page
          // The setup page handles redirection to home if setup is already complete
          window.location.href = "/setup";
        }
      } catch (error: any) {
        console.error("Login error:", error);
        setErrors(prev => ({
          ...prev,
          submit: error.response?.data?.message || "Login failed. Please check your credentials."
        }));
      } finally {
        setIsLoading(false);
      }
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

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {errors.submit}
          </div>
        )}

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
              disabled={isLoading}
              className={`w-full mt-1 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? "border-red-500" : ""
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
                disabled={isLoading}
                className={`w-full border rounded-md p-2 pr-10 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.password ? "border-red-500" : ""
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-2.5 text-gray-500 disabled:opacity-50"
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

          {/* LOGIN BUTTON */}
          <button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
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