'use client';

import React from 'react';
import { EmployeeIdentityInfo } from './types';

interface EmployeeIdentityInfoStepProps {
  identityInfo: EmployeeIdentityInfo;
  setIdentityInfo: (data: EmployeeIdentityInfo) => void;
  onNext: () => void;
}

export default function EmployeeIdentityInfoStep({
  identityInfo,
  setIdentityInfo,
  onNext,
}: EmployeeIdentityInfoStepProps) {
  
  const handleChange = (field: keyof EmployeeIdentityInfo, value: string) => {
    setIdentityInfo({ ...identityInfo, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <p className="text-sm text-gray-600 mb-6">
        Please provide your identity documents information. These details are required for official records.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              UAN (Universal Account Number) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={identityInfo.uan}
              onChange={(e) => handleChange('uan', e.target.value)}
              placeholder="Enter UAN"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">12-digit UAN for EPF</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              PAN (Permanent Account Number) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={identityInfo.pan}
              onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
              placeholder="Enter PAN"
              maxLength={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">10-character alphanumeric PAN</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Aadhar Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={identityInfo.aadhar}
              onChange={(e) => handleChange('aadhar', e.target.value)}
              placeholder="Enter Aadhar Number"
              maxLength={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">12-digit Aadhar number</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Passport Number</label>
            <input
              type="text"
              value={identityInfo.passport}
              onChange={(e) => handleChange('passport', e.target.value.toUpperCase())}
              placeholder="Enter Passport Number (Optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - if available</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Driving License Number</label>
            <input
              type="text"
              value={identityInfo.drivingLicense}
              onChange={(e) => handleChange('drivingLicense', e.target.value.toUpperCase())}
              placeholder="Enter Driving License (Optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - if available</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> All identity information will be kept confidential and used only for official purposes.
          </p>
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