'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { OrganizationData } from './types';
import { getApiUrl, getAuthToken, setOrgId } from '@/lib/auth';

interface OrganizationDetailsStepProps {
  onNext: (orgId: string) => void; // Modified to pass orgId back
}

export default function OrganizationDetailsStep({
  onNext,
}: OrganizationDetailsStepProps) {

  const [orgData, setOrgData] = useState<OrganizationData>({
    name: '',
    website: '',
    type: 'Software House', // Set default
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    address: '',
  });

  // Local state to track validation errors
  const [errors, setErrors] = useState<Partial<OrganizationData>>({});
  // Local state to track API loading status
  const [isLoading, setIsLoading] = useState(false);

  // Validation and API Submission function
  const validateAndProceed = async () => {
    console.log('validateAndProceed called with:', orgData);
    let isValid = true;
    const newErrors: Partial<OrganizationData> = {};

    // Check Name (Marked with *)
    if (!orgData.name || orgData.name.trim() === '') {
      newErrors.name = 'Organization name is required';
      isValid = false;
    }

    // Check Email (Marked with *)
    if (!orgData.contactEmail || orgData.contactEmail.trim() === '') {
      newErrors.contactEmail = 'Contact email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(orgData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email';
      isValid = false;
    }

    // New: Check other fields to prevent 400 Bad Request
    if (!orgData.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person is required';
      isValid = false;
    }
    if (!orgData.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact number is required';
      isValid = false;
    }
    // Validate Address
    if (!orgData.address?.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    console.log('Validation results:', { isValid, newErrors });
    setErrors(newErrors);

    // Only call API and onNext if validation passes
    if (isValid) {
      setIsLoading(true);
      // Construct API URL outside try block to be available in catch
      const apiUrl = `${getApiUrl()}/org`;

      try {
        // Get token from auth utilities
        const token = getAuthToken();

        if (!token) {
          alert('Authentication token not found. Please log in again.');
          setIsLoading(false);
          return;
        }

        // Prepare the payload matching the Postman screenshot keys (Reverted to OrgWebsite)
        const payload = {
          name: orgData.name,
          orgType: orgData.type || 'Software House',
          address: orgData.address,
          contactMail: orgData.contactEmail,
          contactPerson: orgData.contactPerson,
          contactNumber: orgData.contactNumber,
          logoUrl: orgData.logoUrl || "https://zendev.io/logo.png",
          OrgWebsite: orgData.website,
        };

        // Axios POST request with Headers - using getApiUrl() for proper URL formatting
        console.log('Attempting to create org at:', apiUrl);
        console.log('Payload:', payload);

        const response = await axios.post(
          apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });


        // Axios automatically checks for 2xx status codes
        if (response.status === 200 || response.status === 201) {
          console.log('API Response Data:', response.data);
          // Store the organization ID from API response - check multiple possible fields
          const newOrgId = response.data.orgId || response.data.id || response.data._id;

          if (newOrgId) {
            setOrgId(newOrgId); // Save to localStorage
            console.log('Organization created with ID:', newOrgId);
            onNext(String(newOrgId)); // Pass orgId to parent
          } else {
            console.error('No orgId found in response:', response.data);
            console.error('Organization created but ID was not found in the response (checked orgId, id, _id). Please check console for details.');
          }
        }

      } catch (error) {
        // Axios Error Handling
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.response?.data || error.message);
          if (error.message === 'Network Error') {
            console.error(`Network Error: Unable to connect to server at ${apiUrl}. Please ensure the backend is running and accessible.`);
          } else {
            // Debugging 400 errors: Show full detail
            const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            console.error(`Failed to create organization: ${errorDetails}`);
          }
        } else {
          console.error('Unexpected error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Helper to clear error when user types
  const handleChange = (field: keyof OrganizationData, value: string) => {
    setOrgData({ ...orgData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-6">Basic Details</h2>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 border-b border-gray-50 pb-6">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32">Logo</label>
          <div className="flex-1 w-full">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 md:p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm text-gray-600">Click to upload logo</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col md:flex-row items-start gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32 pt-2">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={orgData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Website */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32">Website</label>
          <input
            type="text"
            placeholder="https://company.com"
            value={orgData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type of organization */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32">Type</label>
          <select
            value={orgData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Software House">Software House</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
          </select>
        </div>

        {/* Contact person */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32">Contact Person <span className="text-red-500">*</span></label>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Full Name"
              value={orgData.contactPerson}
              onChange={(e) => handleChange('contactPerson', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactPerson ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
          </div>
        </div>

        {/* Contact number */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32">Phone <span className="text-red-500">*</span></label>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="+1-234-567-890"
              value={orgData.contactNumber}
              onChange={(e) => handleChange('contactNumber', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
          </div>
        </div>

        {/* Contact email */}
        <div className="flex flex-col md:flex-row items-start gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32 pt-2">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="flex-1 w-full">
            <input
              type="email"
              placeholder="contact@company.com"
              value={orgData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            />
            {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col md:flex-row items-start gap-1 md:gap-8">
          <label className="text-sm font-medium text-gray-700 w-full md:w-32 pt-2">Address <span className="text-red-500">*</span></label>
          <div className="flex-1 w-full">
            <textarea
              placeholder="Legal Registered Address"
              value={orgData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none transition-all ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={validateAndProceed}
          disabled={isLoading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}