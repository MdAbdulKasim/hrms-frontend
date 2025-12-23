'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { SetupStep, EmployeeSetupData, EmployeePersonalDetails, EmployeeContactDetails, EmployeeIdentityInfo, WorkExperience, Education } from '../setup/types';
import EmployeePersonalDetailsStep from './EmployeePersonalDetailsStep';
import EmployeeContactDetailsStep from './EmployeeContactDetailsStep';
import EmployeeIdentityInfoStep from './EmployeeIdentityInfoStep';
import EmployeeWorkExperienceStep from './EmployeeWorkExperienceStep';
import EmployeeEducationStep from './EmployeeEducationStep';

export default function EmployeeSetupWizard({
  initialStep = 1,
  onComplete,
}: {
  initialStep?: number;
  onComplete?: (data: EmployeeSetupData) => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 1, title: 'Personal Details', completed: false },
    { id: 2, title: 'Contact Information', completed: false },
    { id: 3, title: 'Identity Information', completed: false },
    { id: 4, title: 'Work Experience', completed: false },
    { id: 5, title: 'Education', completed: false },
  ]);

  // Get pre-filled data from admin (from candidate form)
  const getAdminFilledData = (): Partial<EmployeePersonalDetails> => {
    try {
      const candidateData = localStorage.getItem('employeeCandidateData');
      if (candidateData) {
        const data = JSON.parse(candidateData);
        return {
          fullName: data.fullName || '',
          email: data.email || '',
          mobileNumber: data.mobileNumber || '',
          role: data.role || '',
          department: data.department || '',
          reportingTo: data.reportingTo || '',
          teamPosition: data.teamPosition || '',
          shift: data.shift || '',
          location: data.location || '',
          timeZone: data.timeZone || '',
        };
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
    }
    return {};
  };

  const [employeeData, setEmployeeData] = useState<EmployeeSetupData>({
    personalDetails: {
      ...getAdminFilledData(),
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      bloodGroup: '',
    } as EmployeePersonalDetails,
    contactDetails: {
      presentAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
      },
      permanentAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        pinCode: '',
      },
      sameAsPresent: false,
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactNumber: '',
    },
    identityInfo: {
      uan: '',
      pan: '',
      aadhar: '',
      passport: '',
      drivingLicense: '',
    },
    workExperience: [],
    education: [],
  });

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
    if (currentStep < 5) {
      markStepComplete(currentStep);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setExpandedStep(nextStep);
    }
  };

  const handleCompleteSetup = () => {
    markStepComplete(5);
    
    const completeData = {
      ...employeeData,
      allStepsCompleted: true,
      completedAt: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem('employeeSetupData', JSON.stringify(completeData));
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('setupStatusChanged'));
      
      onComplete?.(completeData);
      
      setTimeout(() => {
        window.location.href = '/employee/my-space/overview';
      }, 100);
      
    } catch (error) {
      console.error('Failed to save employee setup data:', error);
      alert('Failed to complete setup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Please complete these steps to finish your employee profile setup.</p>
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
                  <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>
                  <EmployeePersonalDetailsStep
                    personalDetails={employeeData.personalDetails}
                    setPersonalDetails={(data) => setEmployeeData({ ...employeeData, personalDetails: data })}
                    onNext={handleNextStep}
                  />
                </div>
              )}
              {expandedStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                  <EmployeeContactDetailsStep
                    contactDetails={employeeData.contactDetails}
                    setContactDetails={(data) => setEmployeeData({ ...employeeData, contactDetails: data })}
                    onNext={handleNextStep}
                  />
                </div>
              )}
              {expandedStep === 3 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Identity Information</h2>
                  <EmployeeIdentityInfoStep
                    identityInfo={employeeData.identityInfo}
                    setIdentityInfo={(data) => setEmployeeData({ ...employeeData, identityInfo: data })}
                    onNext={handleNextStep}
                  />
                </div>
              )}
              {expandedStep === 4 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Work Experience</h2>
                  <EmployeeWorkExperienceStep
                    workExperience={employeeData.workExperience}
                    setWorkExperience={(data) => setEmployeeData({ ...employeeData, workExperience: data })}
                    onNext={handleNextStep}
                  />
                </div>
              )}
              {expandedStep === 5 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Education</h2>
                  <EmployeeEducationStep
                    education={employeeData.education}
                    setEducation={(data) => setEmployeeData({ ...employeeData, education: data })}
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
              <span className="font-semibold">Note:</span> You need to complete all {totalCount} steps to finalize your profile setup.
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