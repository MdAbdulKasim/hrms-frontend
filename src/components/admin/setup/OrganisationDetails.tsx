'use client';

import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { OrganizationData } from './types';
import { getApiUrl, getAuthToken, setOrgId, getOrgId, getCookie } from '@/lib/auth';
import { CustomAlertDialog } from '@/components/ui/custom-dialogs';

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

  // Logo State
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);

  // Load registration data and fetch organization details from API
  useEffect(() => {
    const fetchOrgData = async () => {
      const orgIdToFetch = existingOrgId || getOrgId();
      const token = getAuthToken();
      const apiUrl = getApiUrl();

      if (orgIdToFetch && token) {
        try {
          const apiEndpoint = `${apiUrl}/org/${orgIdToFetch}`;
          console.log('Fetching organization details from:', apiEndpoint);

          const response = await axios.get(apiEndpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          console.log('Fetched organization data:', response.data);

          const fetchedData = response.data.data || response.data;

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

          // Fetch Logo
          try {
            const logoResponse = await axios.get(`${apiUrl}/org/${orgIdToFetch}/logo`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (logoResponse.data.success && logoResponse.data.imageUrl) {
              setLogoPreviewUrl(logoResponse.data.imageUrl);
            }
          } catch (logoError) {
            console.error("Failed to fetch logo:", logoError);
          }

        } catch (error) {
          console.error('Error fetching organization details:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
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

  const [errors, setErrors] = useState<Partial<OrganizationData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Alert State
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreviewUrl(url);
    }
  };

  const validateAndProceed = async () => {
    console.log('validateAndProceed called with:', orgData);
    let isValid = true;
    const newErrors: Partial<OrganizationData> = {};

    if (!orgData.name || orgData.name.trim() === '') {
      newErrors.name = 'Organization name is required';
      isValid = false;
    }

    if (!orgData.contactEmail || orgData.contactEmail.trim() === '') {
      newErrors.contactEmail = 'Contact email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(orgData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email';
      isValid = false;
    }

    if (!orgData.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contact person is required';
      isValid = false;
    }
    if (!orgData.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact number is required';
      isValid = false;
    }
    if (!orgData.address?.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsLoading(true);

      try {
        const token = getAuthToken();

        if (!token) {
          showAlert('Error', 'Authentication token not found. Please log in again.', 'error');
          setIsLoading(false);
          return;
        }

        const orgIdToUse = existingOrgId || getOrgId();

        if (!orgIdToUse) {
          showAlert('Error', 'Organization ID not found. Please complete registration first.', 'error');
          setIsLoading(false);
          return;
        }

        const apiUrl = `${getApiUrl()}/org/${orgIdToUse}`;

        let response;

        // Use FormData for updates
        const formData = new FormData();
        formData.append('address', orgData.address);
        formData.append('orgType', orgData.type || 'Software House');
        formData.append('contactPerson', orgData.contactPerson);
        formData.append('contactNumber', orgData.contactNumber);
        formData.append('OrgWebsite', orgData.website || '');
        // Note: name and contactEmail are typically read-only or handled separately, but we can append them if needed. 
        // Based on existing code, they were not in the update payload, so we skip them or keep as is.
        // Existing payload: address, orgType, contactPerson, contactNumber, logoUrl, OrgWebsite.
        // We replace logoUrl with the file if present.

        if (selectedLogoFile) {
          formData.append('logo', selectedLogoFile);
        } else if (logoPreviewUrl && !logoPreviewUrl.startsWith('blob:')) {
          // If existing logo URL and no new file, we might want to preserve it or send the URL string?
          // Usually backend handles "if no file, keep existing".
          // We can optionally send 'logoUrl' if we want to explicitly set a URL, but for file upload flow, usually omitting file means no change.
          // But existing code sent `logoUrl`.
          formData.append('logoUrl', logoPreviewUrl);
        }

        console.log('Updating organization at:', apiUrl);

        response = await axios.put(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });

        console.log('Organization updated successfully:', response.data);

        if (!existingOrgId) {
          setOrgId(orgIdToUse);
        }

        onNext(orgIdToUse);

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.response?.data || error.message);
          const errorMsg = error.response?.data?.message || error.message;
          showAlert('Error', `Failed to update organization: ${errorMsg}`, 'error');
        } else {
          console.error('Unexpected error:', error);
          showAlert('Error', 'An unexpected error occurred.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

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
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                {logoPreviewUrl ? (
                  <img
                    src={logoPreviewUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer inline-flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedLogoFile ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedLogoFile ? selectedLogoFile.name : 'Max 5MB. PNG, JPG, GIF.'}
                </p>
              </div>
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

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div >
  );
}