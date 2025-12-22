'use client';

import React from 'react';
import { Upload } from 'lucide-react';
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
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={orgData.name}
            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Website */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Website</label>
          <input
            type="text"
            placeholder="Company Website"
            value={orgData.website}
            onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type of organization */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Type of organization</label>
          <select
            value={orgData.type}
            onChange={(e) => setOrgData({ ...orgData, type: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Software</option>
            <option>Manufacturing</option>
            <option>Services</option>
          </select>
        </div>

        {/* Contact person */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Contact person</label>
          <input
            type="text"
            placeholder="Contact person"
            value={orgData.contactPerson}
            onChange={(e) => setOrgData({ ...orgData, contactPerson: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact number */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">Contact number</label>
          <input
            type="text"
            value={orgData.contactNumber}
            onChange={(e) => setOrgData({ ...orgData, contactNumber: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact email */}
        <div className="flex items-center gap-8">
          <label className="text-sm text-gray-700 w-32">
            Contact email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={orgData.contactEmail}
            onChange={(e) => setOrgData({ ...orgData, contactEmail: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Primary address */}
        <div className="flex items-start gap-8">
          <label className="text-sm text-gray-700 w-32 pt-2">Primary address</label>
          <div className="flex-1 space-y-4">
            <input
              type="text"
              placeholder="Address Line 1"
              value={orgData.addressLine1}
              onChange={(e) => setOrgData({ ...orgData, addressLine1: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={orgData.addressLine2}
              onChange={(e) => setOrgData({ ...orgData, addressLine2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={orgData.city}
                onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={orgData.state}
                onChange={(e) => setOrgData({ ...orgData, state: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Select State</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
                <option>Maharashtra</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={orgData.country}
                onChange={(e) => setOrgData({ ...orgData, country: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
              <input
                type="text"
                placeholder="ZIP/PIN Code"
                value={orgData.zipCode}
                onChange={(e) => setOrgData({ ...orgData, zipCode: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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