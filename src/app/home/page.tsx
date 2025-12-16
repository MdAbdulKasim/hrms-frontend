"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/components/home";
import CompanySetupModal from "@/components/setup/CompanySetupModal";

export default function HomePage() {
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // 🔹 Temporary frontend logic
    // Later this will come from backend (user.isNewUser)
    const isNewUser = localStorage.getItem("isNewUser");

    if (isNewUser === "true") {
      setShowSetup(true);
    }
  }, []);

  const handleSetupComplete = () => {
    localStorage.setItem("isNewUser", "false");
    setShowSetup(false);
  };

  return (
    <Layout>
      {/* ✅ Dashboard content */}
      <Dashboard />

      {/* ✅ Company setup modal for new users */}
      {showSetup && (
        <CompanySetupModal onComplete={handleSetupComplete} />
      )}
    </Layout>
  );
}
