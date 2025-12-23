'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { SetupStep, OrganizationData, Location, Department, Designation } from './types';
import OrganizationDetailsStep from '@/components/setup/OrganisationDetails';
import LocationsStep from '@/components/setup/LocationStep';
import DepartmentsStep from '@/components/setup/DepartmentSetup';
import DesignationsStep from '@/components/setup/DesignationSetup';

// Check if setup is completed
export const isSetupCompleted = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const setupData = localStorage.getItem('organizationSetup');
    if (!setupData) return false;
    const data = JSON.parse(setupData);
    return data.allStepsCompleted === true;
  } catch {
    return false;
  }
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
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'HR', code: '', associatedUsers: 0, mailAlias: '', departmentLead: '', parentDepartment: '' },
    { id: '2', name: 'IT', code: '', associatedUsers: 10, mailAlias: '', departmentLead: '', parentDepartment: '' },
    { id: '3', name: 'Management', code: '', associatedUsers: 5, mailAlias: '', departmentLead: '', parentDepartment: '' },
    { id: '4', name: 'Marketing', code: '', associatedUsers: 5, mailAlias: '', departmentLead: '', parentDepartment: '' },
  ]);
  const [designations, setDesignations] = useState<Designation[]>([]);

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

  const handleNextStep = () => {
    if (currentStep < 4) {
      markStepComplete(currentStep);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setExpandedStep(nextStep);
    }
  };

  const handleCompleteSetup = () => {
    markStepComplete(4);
    
    const userRole = localStorage.getItem('role') || 'admin';
    
    const completeData = {
      organization: orgData,
      locations,
      departments,
      designations,
      allStepsCompleted: true,
      completedAt: new Date().toISOString(),
    };
    
    try {
      // Save to single organizationSetup key
      localStorage.setItem('organizationSetup', JSON.stringify(completeData));
      
      // Trigger events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('setupStatusChanged'));
      
      onComplete?.(completeData);
      
      // Redirect based on role
      setTimeout(() => {
        if (userRole === 'admin') {
          window.location.href = '/my-space/overview';
        } else {
          window.location.href = '/employee/my-space/overview';
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to save setup data:', error);
      alert('Failed to complete setup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Set up your organization</h1>
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
                    orgData={orgData}
                    setOrgData={setOrgData}
                    onNext={handleNextStep}
                  />
                </div>
              )}
              {expandedStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Organization — Locations</h2>
                  <LocationsStep
                    locations={locations}
                    setLocations={setLocations}
                    onNext={handleNextStep}
                  />
                </div>
              )}
              {expandedStep === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Organization — Departments</h2>
                  <DepartmentsStep
                    departments={departments}
                    setDepartments={setDepartments}
                    onNext={handleNextStep}
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
                className={`flex items-center justify-between p-4 rounded-lg border-l-4 bg-white shadow-sm cursor-pointer transition-all ${
                  step.completed
                    ? 'border-green-500'
                    : currentStep === step.id
                    ? 'border-blue-600 ring-2 ring-blue-100'
                    : 'border-blue-500'
                }`}
                onClick={() => handleStepClick(step.id)}
              >
                <div className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-blue-500 flex-shrink-0" />
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
                  className={`text-sm px-4 py-1.5 rounded ${
                    step.completed
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