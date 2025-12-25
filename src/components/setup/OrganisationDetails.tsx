'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios'; 
import { OrganizationData } from './types';

interface OrganizationDetailsStepProps {
  orgData: OrganizationData;
  setOrgData: (data: OrganizationData) => void;
  onNext: () => void;
}

export default function OrganizationDetailsStep({
  orgData,
  setOrgData,
  onNext,
}: OrganizationDetailsStepProps) {
  // Local state to track validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Local state to track API loading status
  const [isLoading, setIsLoading] = useState(false);

  // Helper to retrieve token from cookies
  const getTokenFromCookies = (cookieName: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  // Validation and API Submission function
  const validateAndProceed = async () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

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

    setErrors(newErrors);

    // Only call API and onNext if validation passes
    if (isValid) {
      setIsLoading(true);

      try {
        // --- 1. Retrieve Token from Cookies ---
        // REPLACE 'authToken' with the actual name of the cookie set by your login page
        const token = getTokenFromCookies('authToken'); 

        if (!token) {
           alert('Authentication token not found. Please log in again.');
           setIsLoading(false);
           return;
        }

        // Construct the single address string required by the API
        const fullAddress = [
          orgData.addressLine1,
          orgData.addressLine2,
          orgData.city,
          orgData.state,
          orgData.country,
          orgData.zipCode ? `- ${orgData.zipCode}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        // Prepare the payload matching the Postman screenshot keys
        const payload = {
          name: orgData.name,
          orgType: orgData.type || 'Software House',
          address: fullAddress,
          contactMail: orgData.contactEmail,
          contactPerson: orgData.contactPerson,
          contactNumber: orgData.contactNumber,
          logoUrl: "https://zendev.io/logo.png", // Hardcoded per requirements
          OrgWebsite: orgData.website,
        };

        // --- 2. Axios POST request with Headers ---
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}org`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Attaching the token here
          },
          // If your backend expects the cookie strictly via browser transport (not Header),
          // uncomment the line below:
          // withCredentials: true 
        });

        // Axios automatically checks for 2xx status codes
        if (response.status === 200 || response.status === 201) {
            // Optional: You can access the response data via response.data
            // const newOrgId = response.data.orgId; 
            onNext();
        }

      } catch (error) {
        // Axios Error Handling
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.response?.data || error.message);
          alert(`Failed to create organization: ${error.response?.data?.message || error.message}`);
        } else {
          console.error('Unexpected error:', error);
          alert('An unexpected error occurred.');
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
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Basic Details</h2>
      
      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="flex items-start gap-8">
          <label className="text-sm text-gray-700 w-32">Logo</label>
          <div className="flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload logo</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="flex items-start gap-8">
          <label className="text-sm text-gray-700 w-32 pt-2">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={orgData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Website */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Website</label>
          <input
            type="text"
            placeholder="Company Website"
            value={orgData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type of organization */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Type of organization</label>
          <select
            value={orgData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Software House">Software House</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
          </select>
        </div>

        {/* Contact person */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Contact person</label>
          <input
            type="text"
            placeholder="Contact person"
            value={orgData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact number */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Contact number</label>
          <input
            type="text"
            value={orgData.contactNumber}
            onChange={(e) => handleChange('contactNumber', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact email */}
        <div className="flex items-start gap-8">
          <label className="text-sm text-gray-700 w-32 pt-2">
            Contact email <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <input
              type="email"
              value={orgData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactEmail ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
          </div>
        </div>

        {/* Primary address */}
        <div className="flex items-start gap-8">
          <label className="text-sm text-gray-700 w-32 pt-2">Primary address</label>
          <div className="flex-1 space-y-4">
            <input
              type="text"
              placeholder="Address Line 1"
              value={orgData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={orgData.addressLine2}
              onChange={(e) => handleChange('addressLine2', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={orgData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={orgData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={orgData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
              <input
                type="text"
                placeholder="ZIP/PIN Code"
                value={orgData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={validateAndProceed}
          disabled={isLoading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}