'use client';

import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { OrganizationData } from './types';
import { getApiUrl, getAuthToken, setOrgId, getOrgId, getCookie } from '@/lib/auth';

interface OrganizationDetailsStepProps {
  onNext: (orgId: string) => void;
  existingOrgId?: string; // Optional: if provided, component is in edit mode
  existingOrgData?: Partial<OrganizationData>; // Optional: pre-fill form with existing data
}

export default function OrganizationDetailsStep({
  onNext,
  existingOrgId,
  existingOrgData,
}: OrganizationDetailsStepProps) {

  const isEditMode = !!existingOrgId;

  const [orgData, setOrgData] = useState<OrganizationData>({
    name: existingOrgData?.name || '',
    website: existingOrgData?.website || '',
    type: existingOrgData?.type || 'Software House',
    contactPerson: existingOrgData?.contactPerson || '',
    contactNumber: existingOrgData?.contactNumber || '',
    contactEmail: existingOrgData?.contactEmail || '',
    address: existingOrgData?.address || '',
  });

  // Load registration data and fetch organization details from API
  useEffect(() => {
    const fetchOrgData = async () => {
      const orgIdToFetch = existingOrgId || getOrgId();
      const token = getAuthToken();

      if (orgIdToFetch && token) {
        try {
          const apiUrl = `${getApiUrl()}/org/${orgIdToFetch}`;
          console.log('Fetching organization details from:', apiUrl);

          const response = await axios.get(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('Fetched organization data:', response.data);

          // Extract data from response (handle both direct data and nested data.data)
          const fetchedData = response.data.data || response.data;

          // Update form with fetched data
          setOrgData(prev => ({
            ...prev,
            name: fetchedData.name || prev.name,
            website: fetchedData.OrgWebsite || fetchedData.website || prev.website,
            type: fetchedData.orgType || prev.type,
            contactPerson: fetchedData.contactPerson || prev.contactPerson,
            contactNumber: fetchedData.contactNumber || prev.contactNumber,
            contactEmail: fetchedData.contactMail || fetchedData.contactEmail || prev.contactEmail,
            address: fetchedData.address || prev.address,
          }));
        } catch (error) {
          console.error('Error fetching organization details:', error);
          // Fallback to localStorage data if API fails
          loadFromLocalStorage();
        }
      } else {
        // No orgId or token, load from localStorage
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      // Priority: Cookie -> LocalStorage
      const registrationOrgName = getCookie('registrationOrgName') || localStorage.getItem('registrationOrgName');
      const registrationEmail = getCookie('registrationEmail') || getCookie('hrms_user_email') || localStorage.getItem('registrationEmail') || localStorage.getItem('hrms_user_email');
      const userFirstName = getCookie('hrms_user_firstName') || localStorage.getItem('hrms_user_firstName');
      const userLastName = getCookie('hrms_user_lastName') || localStorage.getItem('hrms_user_lastName');

      const fullName = userFirstName && userLastName
        ? `${userFirstName} ${userLastName}`.trim()
        : userFirstName || '';

      setOrgData(prev => ({
        ...prev,
        name: existingOrgData?.name || registrationOrgName || prev.name,
        contactEmail: existingOrgData?.contactEmail || registrationEmail || prev.contactEmail,
        contactPerson: existingOrgData?.contactPerson || fullName || prev.contactPerson,
      }));
    };

    fetchOrgData();
  }, [existingOrgData, existingOrgId]);

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

      try {
        const token = getAuthToken();

        if (!token) {
          alert('Authentication token not found. Please log in again.');
          setIsLoading(false);
          return;
        }

        // Get organization ID from props or from auth utilities
        const orgIdToUse = existingOrgId || getOrgId();

        if (!orgIdToUse) {
          alert('Organization ID not found. Please complete registration first.');
          setIsLoading(false);
          return;
        }

        // UPDATE MODE - PUT request (always update, never create)
        const apiUrl = `${getApiUrl()}/org/${orgIdToUse}`;

        // Payload for update
        const updatePayload = {
          address: orgData.address,
          orgType: orgData.type || 'Software House',
          contactPerson: orgData.contactPerson,
          contactNumber: orgData.contactNumber,
          logoUrl: orgData.logoUrl || "https://zendev.io/logo.png",
          OrgWebsite: orgData.website,
        };

        console.log('Updating organization at:', apiUrl);
        console.log('Update payload:', updatePayload);

        const response = await axios.put(apiUrl, updatePayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        console.log('Organization updated successfully:', response.data);

        // Store orgId if not already stored
        if (!existingOrgId) {
          setOrgId(orgIdToUse);
        }

        onNext(orgIdToUse); // Pass orgId to parent

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.response?.data || error.message);
          const errorMsg = error.response?.data?.message || error.message;
          alert(`Failed to update organization: ${errorMsg}`);
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
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Organization name cannot be changed</p>
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
          <input
            type="text"
            placeholder="e.g. Software House, Manufacturing, Services"
            value={orgData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Contact email cannot be changed</p>
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
          {isLoading ? 'Updating...' : 'Update & Continue'}
        </button>
      </div>
    </div>
  );
}