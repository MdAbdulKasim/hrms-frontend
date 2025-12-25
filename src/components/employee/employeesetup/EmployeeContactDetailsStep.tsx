'use client';

import React from 'react';
import { EmployeeContactDetails } from '../../admin/setup/types';

interface EmployeeContactDetailsStepProps {
  contactDetails: EmployeeContactDetails;
  setContactDetails: (data: EmployeeContactDetails) => void;
  onNext: () => void;
}

export default function EmployeeContactDetailsStep({
  contactDetails,
  setContactDetails,
  onNext,
}: EmployeeContactDetailsStepProps) {

  const handlePresentAddressChange = (field: string, value: string) => {
    setContactDetails({
      ...contactDetails,
      presentAddress: { ...contactDetails.presentAddress, [field]: value }
    });
  };

  const handlePermanentAddressChange = (field: string, value: string) => {
    setContactDetails({
      ...contactDetails,
      permanentAddress: { ...contactDetails.permanentAddress, [field]: value }
    });
  };

  const handleSameAsPresent = (checked: boolean) => {
    if (checked) {
      setContactDetails({
        ...contactDetails,
        sameAsPresent: true,
        permanentAddress: { ...contactDetails.presentAddress }
      });
    } else {
      setContactDetails({
        ...contactDetails,
        sameAsPresent: false
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="space-y-8">
        {/* Present Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Present Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactDetails.presentAddress.addressLine1}
                onChange={(e) => handlePresentAddressChange('addressLine1', e.target.value)}
                placeholder="Enter address line 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={contactDetails.presentAddress.addressLine2}
                onChange={(e) => handlePresentAddressChange('addressLine2', e.target.value)}
                placeholder="Enter address line 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactDetails.presentAddress.city}
                  onChange={(e) => handlePresentAddressChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactDetails.presentAddress.state}
                  onChange={(e) => handlePresentAddressChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactDetails.presentAddress.country}
                  onChange={(e) => handlePresentAddressChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactDetails.presentAddress.pinCode}
                  onChange={(e) => handlePresentAddressChange('pinCode', e.target.value)}
                  placeholder="Enter PIN code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Permanent Address</h3>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={contactDetails.sameAsPresent}
                onChange={(e) => handleSameAsPresent(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Same as Present Address
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactDetails.permanentAddress.addressLine1}
                onChange={(e) => handlePermanentAddressChange('addressLine1', e.target.value)}
                disabled={contactDetails.sameAsPresent}
                placeholder="Enter address line 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={contactDetails.permanentAddress.addressLine2}
                onChange={(e) => handlePermanentAddressChange('addressLine2', e.target.value)}
                disabled={contactDetails.sameAsPresent}
                placeholder="Enter address line 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactDetails.permanentAddress.city}
                  onChange={(e) => handlePermanentAddressChange('city', e.target.value)}
                  disabled={contactDetails.sameAsPresent}
                  placeholder="Enter city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactDetails.permanentAddress.state}
                  onChange={(e) => handlePermanentAddressChange('state', e.target.value)}
                  disabled={contactDetails.sameAsPresent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select State</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactDetails.permanentAddress.country}
                  onChange={(e) => handlePermanentAddressChange('country', e.target.value)}
                  disabled={contactDetails.sameAsPresent}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactDetails.permanentAddress.pinCode}
                  onChange={(e) => handlePermanentAddressChange('pinCode', e.target.value)}
                  disabled={contactDetails.sameAsPresent}
                  placeholder="Enter PIN code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactDetails.emergencyContactName}
                onChange={(e) => setContactDetails({ ...contactDetails, emergencyContactName: e.target.value })}
                placeholder="Enter name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Relation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactDetails.emergencyContactRelation}
                onChange={(e) => setContactDetails({ ...contactDetails, emergencyContactRelation: e.target.value })}
                placeholder="e.g., Father, Mother, Spouse"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactDetails.emergencyContactNumber}
                onChange={(e) => setContactDetails({ ...contactDetails, emergencyContactNumber: e.target.value })}
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}