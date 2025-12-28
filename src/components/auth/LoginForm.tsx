"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCookie, setCookie, setOrgId, getApiUrl, syncSetupState, syncEmployeeSetupState, clearSetupData, checkSetupStatus, checkEmployeeSetupStatus } from "@/lib/auth";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"admin" | "employee">("admin");

  // Auto-clear stale session when landing on login page
  useEffect(() => {
    console.warn("LOGIN_PAGE_INIT: Clearing old session state...");
    clearSetupData();
  }, []);

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
      const apiUrl = getApiUrl();
      const loginUrl = `${apiUrl}/auth/login`;
      
      setIsLoading(true);
      try {
        console.warn("LOGIN_DEBUG: Calling API", { loginUrl, email: formData.email });

        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
          const { token, role, employee, employeeId } = data;
          const id = employeeId || employee?.id;

          setCookie('authToken', token, 7);
          setCookie('role', role, 7);
          if (typeof window !== 'undefined') localStorage.setItem('role', role);
          if (id) setCookie('hrms_user_id', id, 7);
          if (formData.email) setCookie('hrms_user_email', formData.email, 7);

          // Store first and last name if available
          const firstName = employee?.firstName || employee?.fullName?.split(' ')[0] || data?.firstName;
          const lastName = employee?.lastName || employee?.fullName?.split(' ').slice(1).join(' ') || data?.lastName;

          if (firstName) setCookie('hrms_user_firstName', firstName, 7);
          if (lastName) setCookie('hrms_user_lastName', lastName, 7);

          // Always sync setup state from backend to get accurate status
          // Note: clearSetupData() is called on login page mount, so cookies are cleared
          // We need to check backend to see if setup is actually completed
          let isSetupCompleted = false;
          let isEmployeeSetupCompleted = false;

          const orgIdRaw = employee?.organization?.orgId ||
            employee?.organizationId ||
            data?.organizationId ||
            data?.employee?.organizationId ||
            employee?.orgId ||
            data?.orgId ||
            employee?.organization?.id ||
            data?.employee?.organization?.id;

          const orgId = orgIdRaw ? String(orgIdRaw) : null;

          if (role === 'admin' && orgId && orgId !== 'undefined') {
            setOrgId(orgId);
            // Always sync setup state from backend to check if setup is actually completed
            // This ensures that once setup is completed, it's properly detected on subsequent logins
            try {
              const syncResult = await syncSetupState(token, orgId);
              isSetupCompleted = syncResult;
              if (syncResult) {
                // Setup is completed - ensure cookie is set
                setCookie('setupCompleted', 'true');
                if (typeof window !== 'undefined') localStorage.setItem('setupCompleted', 'true');
              }
            } catch (err) {
              console.error("LOGIN_DEBUG: Sync failed", err);
              // If sync fails, check existing status as fallback
              isSetupCompleted = checkSetupStatus();
            }
          } else if (role === 'employee' && id) {
            // Always sync employee setup status from backend
            try {
              const syncResult = await syncEmployeeSetupState(token, id);
              isEmployeeSetupCompleted = syncResult;
              if (syncResult) {
                // Employee setup is completed - ensure cookie is set
                setCookie('employeeSetupCompleted', 'true');
                if (typeof window !== 'undefined') localStorage.setItem('employeeSetupCompleted', 'true');
              }
            } catch (err) {
              console.error("LOGIN_DEBUG: Employee sync failed", err);
              // If sync fails, check existing status as fallback
              isEmployeeSetupCompleted = checkEmployeeSetupStatus();
            }
          }

          if (role === 'admin') {
            // Redirect based on actual setup status from backend
            const dest = isSetupCompleted ? "/admin/my-space/overview" : "/admin/setup";
            window.location.href = dest;
          } else {
            // Redirect employees based on actual profile setup status from backend
            const dest = isEmployeeSetupCompleted ? "/employee/my-space/overview" : "/employee/setup";
            window.location.href = dest;
          }
        } else {
          setErrors(prev => ({
            ...prev,
            submit: data?.message || `Login Failed (${response.status})`
          }));
        }
      } catch (error: any) {
        setErrors(prev => ({
          ...prev,
          submit: error.message || "Network Error"
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-10">

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
          </div>

          {errors.submit && (
            <div id="login-error-message" className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center bg-red-100 rounded-full text-xs font-bold">!</span>
              <p>{errors.submit}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                id="email-input"
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="/auth/forgot-password" title="Forgot Password?" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
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
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-2 font-medium ml-1">{errors.password}</p>
              )}
            </div>

            <button
              id="login-submit-button"
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:active:scale-100"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 font-medium">
              New to HRMS?{" "}
              <a href="/auth/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">
                Create an account
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