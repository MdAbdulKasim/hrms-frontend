"use client"
import Layout from "@/components/layout/Layout"
import ChangePassword from "@/components/admin/profile/ChangePassword"

export default function ChangePasswordPage() {
    return (
        <Layout>
            <ChangePassword onBack={() => window.history.back()} />
        </Layout>
    )
}   