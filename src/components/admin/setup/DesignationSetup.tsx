'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Designation } from './types';
import { getApiUrl, getAuthToken, getOrgId, getLocationId, getDepartmentId } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

interface DesignationsStepProps {
  designations: Designation[];
  setDesignations: (designations: Designation[]) => void;
  onComplete: () => void;
  // Added these props because the API (screenshot) requires them
  orgId?: string;
  locationId?: string;
  departmentId?: string;
}

export default function DesignationsStep({
  designations,
  setDesignations,
  onComplete,
  orgId,
  locationId,
  departmentId,
}: DesignationsStepProps) {
  const [showDesignationForm, setShowDesignationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const [currentDesignation, setCurrentDesignation] = useState<Designation>({
    id: '',
    name: '',
    code: '',
    description: '',
    organizationId: '',
    locationId: '',
    departmentId: '',
  });

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const handleSaveDesignation = async () => {
    // Basic Validation
    if (!currentDesignation.name) return;

    setIsLoading(true);

    try {
      // Get Token using auth utilities
      const token = getAuthToken();
      if (!token) {
        showAlert('Error', 'Authentication token not found. Please log in.', 'error');
        setIsLoading(false);
        return;
      }

      // Get IDs from props or localStorage
      const activeOrgId = orgId || getOrgId();
      const activeLocationId = locationId || getLocationId();
      const activeDepartmentId = departmentId || getDepartmentId();

      if (!activeOrgId) {
        showAlert('Error', 'Organization ID is missing.', 'error');
        setIsLoading(false);
        return;
      }

      if (!activeLocationId) {
        showAlert('Error', 'Location ID is missing.', 'error');
        setIsLoading(false);
        return;
      }

      if (!activeDepartmentId) {
        showAlert('Error', 'Department ID is missing. Please ensure a department is created first.', 'error');
        setIsLoading(false);
        return;
      }

      // Prepare Payload based on Postman Screenshot
      const payload = {
        name: currentDesignation.name,
        code: currentDesignation.code,
        description: currentDesignation.description,
        locationId: activeLocationId,
        departmentId: activeDepartmentId,
        organizationId: activeOrgId,
      };

      // Axios POST Request - using getApiUrl() for proper URL formatting
      const response = await axios.post(
        `${getApiUrl()}/org/${activeOrgId}/designations`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Handle Success
      if (response.status === 200 || response.status === 201) {
        // Use the ID returned from API, or fallback to date
        const newDesignation: Designation = {
          ...currentDesignation,
          id: response.data.id || Date.now().toString(),
          locationId: activeLocationId,
          departmentId: activeDepartmentId,
          organizationId: activeOrgId,
        };

        setDesignations([...designations, newDesignation]);

        // Reset Form
        setCurrentDesignation({
          id: '',
          name: '',
          code: '',
          description: '',
          locationId: '',     // Reset these to empty strings or keep them from props? 
          departmentId: '',   // Actually, keeping them empty in state is fine as we use active*Id vars for submission
          organizationId: ''
        });
        setShowDesignationForm(false);
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        if (error.message === 'Network Error') {
          const activeOrgId = orgId || getOrgId();
          const apiUrl = `${getApiUrl()}/org/${activeOrgId}/designations`;
          showAlert('Network Error', `Unable to connect to server at ${apiUrl}. Please ensure the backend is running and accessible.`, 'error');
        } else {
          showAlert('Error', `Failed to save designation: ${error.response?.data?.message || error.message}`, 'error');
        }
      } else {
        console.error('Unexpected error:', error);
        showAlert('Error', 'An unexpected error occurred.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showDesignationForm) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-8">
        <h2 className="text-xl font-semibold mb-6">Add Designation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentDesignation.name}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
            <input
              type="text"
              value={currentDesignation.code}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="e.g. SE-001"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={currentDesignation.description}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              rows={3}
              placeholder="Brief description of the role..."
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <button
              onClick={handleSaveDesignation}
              disabled={!currentDesignation.name || isLoading}
              className={`w-full md:w-auto px-6 py-2.5 rounded-md text-white font-medium transition-colors ${(!currentDesignation.name || isLoading)
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : 'Submit and New'}
            </button>
            <button
              onClick={() => setShowDesignationForm(false)}
              className="w-full md:w-auto px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg text-gray-600">
          Total Count: <span className="text-blue-600 font-semibold">{designations.length}</span>
        </h2>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => setShowDesignationForm(true)}
            className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Add Designation
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm md:text-base">Import</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500">☰</button>
        </div>
      </div>

      {designations.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-6">No designations added yet. Click "Add Designation" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            {/* Desktop Table View */}
            <table className="hidden md:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designations.map(desig => (
                  <tr key={desig.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{desig.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{desig.code}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">{desig.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 px-4">
              {designations.map(desig => (
                <div key={desig.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{desig.name}</h3>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{desig.code}</span>
                  </div>
                  {desig.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{desig.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center md:justify-end mt-8">
        <button
          onClick={onComplete}
          disabled={designations.length === 0}
          className={`w-full md:w-auto px-10 py-3 rounded-md text-white font-semibold shadow-md transition-all ${designations.length === 0
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
        >
          Complete Setup
        </button>
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