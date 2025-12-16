"use client";

import Layout from "@/components/layout/Layout";
import Dashboard from "@/components/myspace/dashboard";

  return (
    <Layout>
      {/* ✅ Dashboard content */}
      <Dashboard />

export default function home(){
    return (
        <Layout>
        <Dashboard/>  
        </Layout>
    )
}
