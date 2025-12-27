'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { SetupStep, OrganizationData, Location, Department, Designation } from './types';
import OrganizationDetailsStep from '@/components/admin/setup/OrganisationDetails';
import LocationsStep from '@/components/admin/setup/LocationStep';
import DepartmentsStep from '@/components/admin/setup/DepartmentSetup';
import DesignationsStep from '@/components/admin/setup/DesignationSetup';
import { getOrgId, getLocationId, getDepartmentId, getApiUrl, getAuthToken, setCookie, checkSetupStatus, syncSetupState, getUserRole } from '@/lib/auth';

// Check if setup is completed using the centralized auth utility
export const isSetupCompleted = (): boolean => {
  return checkSetupStatus();
};

export default function OrganizationSetupWizard({
  initialStep = 1,
  onComplete,
}: {
  initialStep?: number;
  onComplete?: (data: { organization: OrganizationData; locations: Location[]; departments: Department[]; designations: Designation[] }) => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 1, title: 'Add Organization Details', completed: false },
    { id: 2, title: 'Add Location', completed: false },
    { id: 3, title: 'Setup Departments', completed: false },
    { id: 4, title: 'Setup Designations', completed: false },
  ]);

  const [orgData, setOrgData] = useState<OrganizationData>({
    name: '',
    website: '',
    type: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    address: '',
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);

  // Track IDs from API responses for subsequent steps
  const [orgId, setOrgIdState] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  // Load existing IDs and restore progress from localStorage on mount
  // Also check backend to verify if setup is actually completed
  useEffect(() => {
    const storedOrgId = getOrgId();
    const storedLocationId = getLocationId();
    const storedDepartmentId = getDepartmentId();
    const token = getAuthToken();

    // Restore IDs
    if (storedOrgId) setOrgIdState(storedOrgId);
    if (storedLocationId) setLocationId(storedLocationId);
    if (storedDepartmentId) setDepartmentId(storedDepartmentId);

    // Restore Progress Logic
    let maxStep = 1;
    let newSteps = [...steps]; // Clone current steps

    if (storedOrgId) {
      newSteps = newSteps.map(s => s.id === 1 ? { ...s, completed: true } : s);
      maxStep = 2;
    }

    if (storedOrgId && storedLocationId) {
      newSteps = newSteps.map(s => s.id === 2 ? { ...s, completed: true } : s);
      maxStep = 3;
    }

    if (storedOrgId && storedLocationId && storedDepartmentId) {
      newSteps = newSteps.map(s => s.id === 3 ? { ...s, completed: true } : s);
      maxStep = 4;
    }

    // Update state
    setSteps(newSteps);
    setCurrentStep(maxStep);

    // Fetch Data for Hydration and Check Setup Status
    const fetchData = async () => {
      if (!token || !storedOrgId) {
        // If no orgId, setup is definitely not complete
        return;
      }
      
      const apiUrl = getApiUrl();
      const headers = { Authorization: `Bearer ${token}` };

      try {
        let hasLocs = false;
        let hasDepts = false;
        let hasDesigs = false;

        // 1. Fetch Organization
        const orgRes = await import('axios').then(a => a.default.get(`${apiUrl}/org/${storedOrgId}`, { headers }));
        if (orgRes.data.data) {
          setOrgData(prev => ({ ...prev, ...orgRes.data.data }));
        }

        // 2. Fetch Locations (if step 1 done)
        if (storedOrgId) {
          const locRes = await import('axios').then(a => a.default.get(`${apiUrl}/org/${storedOrgId}/locations`, { headers }));
          const locList = Array.isArray(locRes.data) ? locRes.data : (locRes.data.data || []);
          setLocations(locList);
          if (locList.length > 0) hasLocs = true;
        }

        // 3. Fetch Departments (if step 2 done)
        if (storedOrgId) {
          const deptRes = await import('axios').then(a => a.default.get(`${apiUrl}/org/${storedOrgId}/departments`, { headers }));
          const deptList = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data.data || []);
          setDepartments(deptList);
          if (deptList.length > 0) hasDepts = true;
        }

        // 4. Fetch Designations (if step 3 done)
        if (storedOrgId) {
          const desigRes = await import('axios').then(a => a.default.get(`${apiUrl}/org/${storedOrgId}/designations`, { headers }));
          const desigList = Array.isArray(desigRes.data) ? desigRes.data : (desigRes.data.data || []);
          setDesignations(desigList);
          if (desigList.length > 0) hasDesigs = true;
        }

        // Auto-Complete Check - Only mark setup as complete if ALL required steps are done
        // Check if organization details exist (orgId exists), location exists, department exists, and designation exists
        const orgDetailsComplete = !!storedOrgId && orgRes?.data?.data?.name; // Org has name/details
        const allStepsComplete = orgDetailsComplete && hasLocs && hasDepts && hasDesigs;
        
        if (allStepsComplete) {
          console.log("SetupWizard: Found complete setup with all steps done. Redirecting to Overview...");
          // Mark setup as completed and redirect
          setCookie('setupCompleted', 'true');
          if (typeof window !== 'undefined') localStorage.setItem('setupCompleted', 'true');
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('setupStatusChanged'));
          window.location.href = '/admin/my-space/overview';
          return; // Exit early to prevent showing the wizard
        } else {
          // If setup is not complete, ensure the setupCompleted flag is cleared
          // This allows new users to see the tutorial
          if (checkSetupStatus()) {
            console.log("SetupWizard: Setup not fully complete, clearing completion flag");
            setCookie('setupCompleted', 'false');
            if (typeof window !== 'undefined') localStorage.setItem('setupCompleted', 'false');
          }
        }
      } catch (err) {
        console.error("Failed to hydrate setup wizard data", err);
        // On error, check if setup status exists in cookies as fallback
        if (checkSetupStatus()) {
          console.log("SetupWizard: Error fetching data, but setup marked as complete. Redirecting...");
          window.location.href = '/admin/my-space/overview';
        }
      }
    };

    fetchData();
  }, []);

  const completedCount = steps.filter(step => step.completed).length;
  const totalCount = steps.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const markStepComplete = (stepId: number) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const handleStepClick = (stepId: number) => {
    setExpandedStep(stepId);
  };

  // Handler for Organization step - receives orgId
  const handleOrgComplete = (newOrgId: string) => {
    setOrgIdState(newOrgId);
    markStepComplete(1);
    setCurrentStep(2);
    setExpandedStep(2);
  };

  // Handler for Location step - receives locationId
  const handleLocationComplete = (newLocationId?: string) => {
    if (newLocationId) setLocationId(newLocationId);
    markStepComplete(2);
    setCurrentStep(3);
    setExpandedStep(3);
  };

  // Handler for Department step - receives departmentId
  const handleDepartmentComplete = (newDepartmentId?: string) => {
    if (newDepartmentId) setDepartmentId(newDepartmentId);
    markStepComplete(3);
    setCurrentStep(4);
    setExpandedStep(4);
  };

  const handleCompleteSetup = () => {
    markStepComplete(4);

    // Create complete setup data with completion flag
    // We don't store detailed data in cookies/storage anymore, just the flag.
    // The fetch logic handles hydration.
    if (typeof window !== 'undefined') {
      try {
        setCookie('setupCompleted', 'true');

        // Dispatch events to notify other components

        // Dispatch events to notify other components
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('setupStatusChanged'));

        // Call onComplete callback if provided
        onComplete?.({ organization: orgData, locations, departments, designations });

        // Navigate to dashboard after a brief delay
        setTimeout(() => {
          window.location.href = '/admin/my-space/overview';
        }, 100);

      } catch (error) {
        console.error('Failed to save organization setup:', error);
        alert('Failed to complete setup. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Set up your organization</h1>
          <p className="text-gray-600">Complete these following steps to set up your organization successfully.</p>
        </div>

        {expandedStep !== null ? (
          <div className="mb-8">
            <button
              onClick={() => setExpandedStep(null)}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
            >
              ← Back to steps
            </button>

            <div className="bg-white rounded-lg p-6">
              {expandedStep === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Organization — Basic Details</h2>
                  <OrganizationDetailsStep
                    onNext={handleOrgComplete}
                  />
                </div>
              )}
              {expandedStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Organization — Locations</h2>
                  <LocationsStep
                    locations={locations}
                    setLocations={setLocations}
                    onNext={handleLocationComplete}
                    orgId={orgId || undefined}
                    onLocationCreated={setLocationId}
                  />
                </div>
              )}
              {expandedStep === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Organization — Departments</h2>
                  <DepartmentsStep
                    departments={departments}
                    setDepartments={setDepartments}
                    onNext={handleDepartmentComplete}
                    orgId={orgId || undefined}
                    locationId={locationId || undefined}
                    onDepartmentCreated={setDepartmentId}
                  />
                </div>
              )}
              {expandedStep === 4 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Organization — Designations</h2>
                  <DesignationsStep
                    designations={designations}
                    setDesignations={setDesignations}
                    onComplete={handleCompleteSetup}
                    orgId={orgId || undefined}
                    locationId={locationId || undefined}
                    departmentId={departmentId || undefined}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between p-4 rounded-lg border-l-4 bg-white shadow-sm cursor-pointer transition-all ${step.completed
                  ? 'border-green-500'
                  : currentStep === step.id
                    ? 'border-blue-600 ring-2 ring-blue-100'
                    : 'border-blue-500'
                  }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-blue-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-gray-900 font-medium">
                      {step.id}. {step.title}
                    </p>
                    {step.completed && (
                      <p className="text-sm text-green-600">✓ Completed</p>
                    )}
                  </div>
                </div>
                <button
                  className={`text-sm px-4 py-1.5 rounded ${step.completed
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-blue-600 hover:text-blue-700'
                    }`}
                >
                  {step.completed ? 'View / Edit' : currentStep === step.id ? 'In Progress' : 'Complete Now'}
                </button>
              </div>
            ))}
          </div>
        )}

        {completedCount < totalCount && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> You need to complete all {totalCount} steps to finalize your organization setup.
            </p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              Progress {completedCount} of {totalCount} steps completed
            </p>
            <p className="text-sm text-gray-600">{Math.round(progressPercentage)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}