import Layout from "@/components/layout/Layout"
import ChangePassword from "@/components/employee/profile/ChangePassword"

export default function ChangePasswordPage() {
    return (
        <Layout>
            <ChangePassword onBack={() => window.history.back()} />
        </Layout>
    )
}
    