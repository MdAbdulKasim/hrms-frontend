'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { SetupStep, EmployeeSetupData, EmployeePersonalDetails, EmployeeContactDetails, EmployeeIdentityInfo, WorkExperience, Education } from '../../admin/setup/types';
import EmployeePersonalDetailsStep from './EmployeePersonalDetailsStep';
import EmployeeContactDetailsStep from './EmployeeContactDetailsStep';
import EmployeeIdentityInfoStep from './EmployeeIdentityInfoStep';
import EmployeeWorkExperienceStep from './EmployeeWorkExperienceStep';
import EmployeeEducationStep from './EmployeeEducationStep';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, checkEmployeeSetupStatus, syncEmployeeSetupState, getCookie, setCookie } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

export default function EmployeeSetupWizard({
  initialStep = 1,
  onComplete,
}: {
  initialStep?: number;
  onComplete?: (data: EmployeeSetupData) => void;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    title: '',
    description: '',
    variant: 'info'
  });

  const showAlert = (title: string, description: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertState({ open: true, title, description, variant });
  };

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

  const markStepComplete = (stepId: number) => {
    setSteps(prevSteps => prevSteps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  // Redirect immediately if employee setup is already completed
  useEffect(() => {
    if (checkEmployeeSetupStatus()) {
      console.log("Employee setup already completed, redirecting to dashboard...");
      window.location.href = '/employee/my-space/overview';
    }
  }, []);

  // Load existing employee data and check setup status from backend
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const token = getAuthToken();
      if (!token) return;

      const apiUrl = getApiUrl();
      const orgId = getOrgId();
      const employeeId = getCookie('hrms_user_id');

      if (!employeeId || !orgId) return;

      try {
        // Fetch employee data to check if profile is already completed
        const res = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const employee = res.data.data || res.data.employee || res.data;

        // Check if onboarding is completed
        const isComplete = employee?.onboardingStatus === 'completed' ||
          (employee?.aadharNumber && employee?.PAN && employee?.bloodGroup);

        if (isComplete) {
          console.log("EmployeeSetupWizard: Profile already completed. Redirecting to Overview...");
          setCookie('employeeSetupCompleted', 'true');
          if (typeof window !== 'undefined') localStorage.setItem('employeeSetupCompleted', 'true');
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('setupStatusChanged'));
          window.location.href = '/employee/my-space/overview';
          return;
        }

        // If not complete, restore progress from existing data
        if (employee) {
          // Restore personal details
          if (employee.fullName || employee.dateOfBirth || employee.bloodGroup) {
            setEmployeeData(prev => ({
              ...prev,
              personalDetails: {
                ...prev.personalDetails,
                fullName: employee.fullName || prev.personalDetails.fullName,
                dateOfBirth: employee.dateOfBirth || prev.personalDetails.dateOfBirth,
                gender: employee.gender || prev.personalDetails.gender,
                maritalStatus: employee.maritalStatus || prev.personalDetails.maritalStatus,
                bloodGroup: employee.bloodGroup || prev.personalDetails.bloodGroup,
              }
            }));
            markStepComplete(1);
          }

          // Restore contact details
          if (employee.presentAddressLine1 || employee.emergencyContactName) {
            setEmployeeData(prev => ({
              ...prev,
              contactDetails: {
                presentAddress: {
                  addressLine1: employee.presentAddressLine1 || prev.contactDetails.presentAddress.addressLine1,
                  addressLine2: employee.presentAddressLine2 || prev.contactDetails.presentAddress.addressLine2,
                  city: employee.presentCity || prev.contactDetails.presentAddress.city,
                  state: employee.presentState || prev.contactDetails.presentAddress.state,
                  country: employee.presentCountry || prev.contactDetails.presentAddress.country,
                  pinCode: employee.presentPinCode || prev.contactDetails.presentAddress.pinCode,
                },
                permanentAddress: {
                  addressLine1: employee.permanentAddressLine1 || prev.contactDetails.permanentAddress.addressLine1,
                  addressLine2: employee.permanentAddressLine2 || prev.contactDetails.permanentAddress.addressLine2,
                  city: employee.permanentCity || prev.contactDetails.permanentAddress.city,
                  state: employee.permanentState || prev.contactDetails.permanentAddress.state,
                  country: employee.permanentCountry || prev.contactDetails.permanentAddress.country,
                  pinCode: employee.permanentPinCode || prev.contactDetails.permanentAddress.pinCode,
                },
                sameAsPresent: prev.contactDetails.sameAsPresent,
                emergencyContactName: employee.emergencyContactName || prev.contactDetails.emergencyContactName,
                emergencyContactRelation: employee.emergencyContactRelation || prev.contactDetails.emergencyContactRelation,
                emergencyContactNumber: employee.emergencyContactNumber || prev.contactDetails.emergencyContactNumber,
              }
            }));
            markStepComplete(2);
          }

          // Restore identity info
          if (employee.aadharNumber || employee.PAN || employee.UAN) {
            setEmployeeData(prev => ({
              ...prev,
              identityInfo: {
                uan: employee.UAN || prev.identityInfo.uan,
                pan: employee.PAN || prev.identityInfo.pan,
                aadhar: employee.aadharNumber || prev.identityInfo.aadhar,
                passport: employee.passportNumber || prev.identityInfo.passport,
                drivingLicense: employee.drivingLicense || prev.identityInfo.drivingLicense,
              }
            }));
            markStepComplete(3);
          }

          // Restore work experience and education if available
          if (employee.workExperience && employee.workExperience.length > 0) {
            setEmployeeData(prev => ({
              ...prev,
              workExperience: employee.workExperience || prev.workExperience
            }));
            markStepComplete(4);
          }

          if (employee.education && employee.education.length > 0) {
            setEmployeeData(prev => ({
              ...prev,
              education: employee.education || prev.education
            }));
            markStepComplete(5);
          }
        }
      } catch (err) {
        console.error("Failed to fetch employee data", err);
      }
    };

    fetchEmployeeData();
  }, []);

  const completedCount = steps.filter(step => step.completed).length;
  const totalCount = steps.length;
  const progressPercentage = (completedCount / totalCount) * 100;

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

  const handleCompleteSetup = async () => {
    try {
      markStepComplete(5);

      const completeData = {
        ...employeeData,
        allStepsCompleted: true,
        completedAt: new Date().toISOString(),
      };

      // Save to API
      const apiUrl = getApiUrl();
      const token = getAuthToken();
      const orgId = getOrgId();
      const employeeId = getCookie('hrms_user_id');

      if (!orgId || !employeeId) {
        throw new Error('Organization or Employee ID not found');
      }

      await axios.put(`${apiUrl}/org/${orgId}/employees/${employeeId}`, completeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Mark employee setup as completed
      setCookie('employeeSetupCompleted', 'true');
      if (typeof window !== 'undefined') {
        localStorage.setItem('employeeSetupCompleted', 'true');
        localStorage.setItem('employeeSetupData', JSON.stringify(completeData));
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('setupStatusChanged'));

      onComplete?.(completeData);

      setTimeout(() => {
        window.location.href = '/employee/my-space/overview';
      }, 100);

    } catch (error) {
      console.error('Failed to save employee setup data:', error);
      showAlert('Error', 'Failed to complete setup. Please try again.', 'error');
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
      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
}