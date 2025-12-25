'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Department } from './types';
import { getApiUrl, getAuthToken, getOrgId, getLocationId, setDepartmentId as saveDepartmentId } from '@/lib/auth';

interface DepartmentsStepProps {
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
  onNext: (departmentId?: string) => void;
  orgId?: string;
  locationId?: string;
  onDepartmentCreated?: (departmentId: string) => void; // Callback to notify parent
}

export default function DepartmentsStep({
  departments,
  setDepartments,
  onNext,
  orgId,
  locationId,
  onDepartmentCreated,
}: DepartmentsStepProps) {
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // 1. Added state to track input fields
  // 1. Added state to track input fields
  const [formData, setFormData] = useState({
    departmentName: '',
    code: ''
  });

  // Helper to handle form submission
  const handleAddDepartment = async () => {
    // Validation: Check if important fields are completed
    if (!formData.departmentName.trim() || !formData.code.trim()) {
      alert("Please complete the Department Name and Code fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Get token using auth utilities
      const token = getAuthToken();
      if (!token) {
        alert('Authentication token not found. Please log in.');
        setIsLoading(false);
        return;
      }

      // Get IDs from props or localStorage
      const activeOrgId = orgId || getOrgId();
      const activeLocationId = locationId || getLocationId();

      if (!activeOrgId) {
        alert('Organization ID is missing. Cannot create department.');
        setIsLoading(false);
        return;
      }

      if (!activeLocationId) {
        alert('Location ID is missing. Cannot create department. Please ensure a location is created first.');
        setIsLoading(false);
        return;
      }

      // Prepare Payload - matches Postman screenshot
      const payload = {
        departmentName: formData.departmentName,
        code: formData.code,
        organizationId: activeOrgId,
        locationId: activeLocationId
      };

      // Axios POST Request - using getApiUrl() for proper URL formatting
      const response = await axios.post(
        `${getApiUrl()}/org/${activeOrgId}/departments`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Get department ID from response
        const newDeptId = response.data.id;

        // Create new department object using the REAL ID from the backend
        const newDept: Department = {
          id: newDeptId || Date.now().toString(),
          departmentName: formData.departmentName,
          code: formData.code,
          organizationId: activeOrgId,
          locationId: activeLocationId
        };

        // Update parent state
        setDepartments([...departments, newDept]);

        // Store the first department ID for subsequent steps
        if (newDeptId && departments.length === 0) {
          saveDepartmentId(newDeptId); // Save to localStorage
          onDepartmentCreated?.(newDeptId); // Notify parent
          console.log('Department created with ID:', newDeptId);
        }

        // Reset form and close
        setFormData({ departmentName: '', code: '' });
        setShowDepartmentForm(false);
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        if (error.message === 'Network Error') {
          const activeOrgId = orgId || getOrgId();
          const apiUrl = `${getApiUrl()}/org/${activeOrgId}/departments`;
          alert(`Network Error: Unable to connect to server at ${apiUrl}. Please ensure the backend is running and accessible.`);
        } else {
          alert(`Failed to create department: ${error.response?.data?.message || error.message}`);
        }
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    // Validation: Ensure at least one department exists before continuing
    if (departments.length === 0) {
      alert("Please add at least one department before continuing.");
      return;
    }
    onNext(departments[0]?.id);
  };

  if (showDepartmentForm) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-8 border border-gray-100 shadow-sm transition-all animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-xl font-semibold mb-6">Add Department</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Department Name</label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              placeholder="e.g. ENG"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleAddDepartment}
            disabled={isLoading}
            className={`flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium active:scale-95 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Submit'}
          </button>
          <button
            onClick={() => setShowDepartmentForm(false)}
            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg text-gray-600">
          Total Count: <span className="text-blue-600 font-bold">{departments.length}</span>
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowDepartmentForm(true)}
            className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md font-medium transition-all active:scale-95"
          >
            Add Department
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">Import</button>
          <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">☰</button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full min-w-[500px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Department Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center text-gray-400 italic">
                  No departments added yet.
                </td>
              </tr>
            ) : (
              departments.map(dept => (
                <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">{dept.departmentName}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 italic font-mono uppercase">{dept.code}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNextStep}
          className="w-full sm:w-auto px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md font-semibold transition-all active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  );
}