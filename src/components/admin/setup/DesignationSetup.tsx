'use client';

import React, { useState } from 'react';
import axios from 'axios'; // 1. Import Axios
import { Designation } from './types';

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
  });

  // Helper: Get Token from Cookies
  const getTokenFromCookies = (cookieName: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const handleSaveDesignation = async () => {
    // 1. Basic Validation
    if (!currentDesignation.name) return;

    setIsLoading(true);

    try {
      // 2. Get Token
      const token = getTokenFromCookies('authToken'); // Replace with your actual cookie name
      if (!token) {
        alert('Authentication token not found. Please log in.');
        setIsLoading(false);
        return;
      }

      // 3. Ensure we have necessary Parent IDs
      // The API endpoint requires an Org ID, and the Body requires Location/Department IDs
      if (!orgId) {
        alert('Organization ID is missing.');
        setIsLoading(false);
        return;
      }

      // 4. Prepare Payload based on Postman Screenshot
      const payload = {
        name: currentDesignation.name,
        code: currentDesignation.code,
        description: currentDesignation.description,
        locationId: locationId,       // Passed from props
        departmentId: departmentId,   // Passed from props
      };

      // 5. Axios POST Request
      // URL structure from screenshot: http://localhost:5000/org/{orgId}/designations
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}org/${orgId}/designations`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // 6. Handle Success
      if (response.status === 200 || response.status === 201) {
        // Use the ID returned from API, or fallback to date
        const newDesignation = { 
          ...currentDesignation, 
          id: response.data.id || Date.now().toString() 
        };

        setDesignations([...designations, newDesignation]);
        
        // Reset Form
        setCurrentDesignation({ id: '', name: '', code: '', description: '' });
        setShowDesignationForm(false);
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        alert(`Failed to save designation: ${error.response?.data?.message || error.message}`);
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showDesignationForm) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Add Designation</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Designation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentDesignation.name}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Code</label>
            <input
              type="text"
              value={currentDesignation.code}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Description</label>
            <textarea
              value={currentDesignation.description}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveDesignation}
            disabled={!currentDesignation.name || isLoading} 
            className={`px-6 py-2 rounded-md text-white ${
               (!currentDesignation.name || isLoading)
               ? 'bg-blue-300 cursor-not-allowed' 
               : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Saving...' : 'Submit and New'}
          </button>
          <button
            onClick={() => setShowDesignationForm(false)}
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
          Total Count: <span className="text-blue-600 font-semibold">{designations.length}</span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDesignationForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Designation
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Import</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">☰</button>
        </div>
      </div>

      {designations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-6">No designations added yet. Click "Add Designation" to get started.</p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Designation Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody>
            {designations.map(desig => (
              <tr key={desig.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{desig.name}</td>
                <td className="px-4 py-3">{desig.code}</td>
                <td className="px-4 py-3">{desig.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={onComplete}
          // Change: Button is disabled if list is empty
          disabled={designations.length === 0}
          className={`px-6 py-2 rounded-md text-white ${
            designations.length === 0
              ? 'bg-gray-400 cursor-not-allowed' // Disabled style
              : 'bg-green-600 hover:bg-green-700' // Active style
          }`}
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}