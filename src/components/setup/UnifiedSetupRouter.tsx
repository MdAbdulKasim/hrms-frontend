'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrganizationSetupWizard from '@/components/setup/SetupWizard';
import EmployeeSetupWizard from '@/components/setup/EmployeeSetupWizard';
import { isSetupCompleted } from '@/components/setup/SetupWizard';

export default function UnifiedSetupPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('role') as 'admin' | 'employee' | null;
    setUserRole(role);
    
    // Check if setup is already completed
    const setupComplete = isSetupCompleted();
    
    if (setupComplete) {
      // Setup already done - redirect to dashboard
      if (role === 'admin') {
        router.push('/my-space/overview');
      } else if (role === 'employee') {
        router.push('/employee/my-space/overview');
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading setup...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No user role found. Please log in again.</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show setup wizard - sidebar/header will be visible but locked via isSetupCompleted()
  return (
    <>
      {userRole === 'admin' && <OrganizationSetupWizard />}
      {userRole === 'employee' && <EmployeeSetupWizard />}
    </>
  );
}