'use client';

import React, { useState } from 'react';
import axios from 'axios'; // 1. Import Axios
import { Department } from './types';

interface DepartmentsStepProps {
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
  onNext: () => void;
  // Added these props because the API requires them (see Postman screenshot)
  orgId?: string; 
  locationId?: string;
}

export default function DepartmentsStep({
  departments,
  setDepartments,
  onNext,
  orgId,
  locationId,
}: DepartmentsStepProps) {
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  
  // 1. Added state to track input fields
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  // Helper: Get Token from Cookies
  const getTokenFromCookies = (cookieName: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  // Helper to handle form submission
  const handleAddDepartment = async () => {
    // 2. Validation: Check if important fields are completed
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Please complete the Department Name and Code fields.");
      return;
    }

    setIsLoading(true);

    try {
      // --- 1. Get Token ---
      const token = getTokenFromCookies('authToken'); // Replace 'authToken' with your specific cookie name
      if (!token) {
        alert('Authentication token not found. Please log in.');
        setIsLoading(false);
        return;
      }

      // --- 2. Validation for Parent IDs ---
      if (!orgId) {
        alert('Organization ID is missing. Cannot create department.');
        setIsLoading(false);
        return;
      }

      // --- 3. Prepare Payload ---
      // Matches the keys in your Postman screenshot
      const payload = {
        departmentName: formData.name, 
        code: formData.code,
        locationId: locationId // Optional: Pass this if your API requires linking a specific location
      };

      // --- 4. Axios POST Request ---
      // URL pattern: http://localhost:5000/org/{orgId}/departments
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}org/${orgId}/departments`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Create new department object using the REAL ID from the backend
        const newDept: Department = {
          id: response.data.id || Date.now().toString(), 
          name: formData.name,
          code: formData.code,
          associatedUsers: 0, 
          mailAlias: '',      
          departmentLead: '', 
          parentDepartment: '' 
        };

        // Update parent state
        setDepartments([...departments, newDept]);
        
        // Reset form and close
        setFormData({ name: '', code: '' });
        setShowDepartmentForm(false);
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        alert(`Failed to create department: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    // 3. Validation: Ensure at least one department exists before continuing
    if (departments.length === 0) {
      alert("Please add at least one department before continuing.");
      return;
    }
    onNext();
  };

  if (showDepartmentForm) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Add Department</h2>
        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Department Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleAddDepartment}
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Submit'}
          </button>
          <button
            onClick={() => setShowDepartmentForm(false)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-gray-600">
          Total Count: <span className="text-blue-600 font-semibold">{departments.length}</span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDepartmentForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Department
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Import</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">☰</button>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Associated users</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mail Alias</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department Lead</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parent Department</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{dept.name}</td>
              <td className="px-4 py-3">{dept.code}</td>
              <td className="px-4 py-3">
                <span className="text-blue-600">{dept.associatedUsers}</span>
              </td>
              <td className="px-4 py-3">{dept.mailAlias}</td>
              <td className="px-4 py-3">{dept.departmentLead}</td>
              <td className="px-4 py-3">{dept.parentDepartment}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNextStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}