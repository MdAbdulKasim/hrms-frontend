"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, ChevronLeft, Lock } from "lucide-react"
import axios from "axios"
import { getApiUrl, getAuthToken, getOrgId, getEmployeeId } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function ChangePasswordPage() {
    const router = useRouter()
    const [showCurrentPass, setShowCurrentPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError("All fields are required")
            return
        }

        if (formData.newPassword.length < 6) {
            setError("New password must be at least 6 characters")
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const token = getAuthToken()
            const orgId = getOrgId()
            const employeeId = getEmployeeId()
            const apiUrl = getApiUrl()

            if (!token || !orgId || !employeeId) {
                throw new Error("Authentication missing")
            }

            // Note: The endpoint assumes the backend has a way to verify current password
            // or this might be a simpler reset if current is not strictly required by the API yet.
            // Adjusting to a standard change-password payload.
            await axios.put(
                `${apiUrl}/org/${orgId}/employees/${employeeId}/change-password`,
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            setSuccess(true)
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })

            // Redirect back after short delay
            setTimeout(() => {
                router.push("/admin/profile")
            }, 2000)
        } catch (err: any) {
            console.error("Change password error:", err)
            setError(err.response?.data?.message || err.response?.data?.error || "Failed to change password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <div className="max-w-md w-full">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Profile
                </button>

                <Card className="p-8 shadow-xl border-t-4 border-t-blue-600">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Update your account password to keep it secure
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 shrink-0" />
                            Password updated successfully! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <Input
                                    type={showCurrentPass ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-2" />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showNewPass ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPass ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 transition-all shadow-md mt-4"
                            disabled={isLoading || success}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save New Password"
                            )}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}
