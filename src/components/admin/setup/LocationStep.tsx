'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Location } from './types';
import { getApiUrl, getAuthToken, getOrgId, setLocationId as saveLocationId } from '@/lib/auth';

interface LocationsStepProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  onNext: (locationId?: string) => void;
  orgId?: string;
  onLocationCreated?: (locationId: string) => void; // Callback to notify parent
}

export default function LocationsStep({
  locations,
  setLocations,
  onNext,
  orgId,
  onLocationCreated,
}: LocationsStepProps) {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track API loading state

  // State to track validation errors
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [currentLocation, setCurrentLocation] = useState<Location>({
    id: '',
    name: '',
    code: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    state: '',
    postalCode: '',
    timeZone: '',
  });

  const handleSaveLocation = async () => {
    // 1. Identify important fields
    const requiredFields = [
      'name',
      'code',
      'city',
      'country',
      'state',
      'postalCode'
    ];

    // 2. Check for empty fields
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      // @ts-ignore - accessing object by string key for validation loop
      if (!currentLocation[field]) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);

    // 3. Only proceed if valid
    if (isValid) {
      setIsLoading(true);

      try {
        // Get Token using auth utilities
        const token = getAuthToken();

        if (!token) {
          alert('Authentication token not found. Please log in.');
          setIsLoading(false);
          return;
        }

        // Get Org ID - from prop or from localStorage
        const activeOrgId = orgId || getOrgId();

        console.log('LocationStep Debug:');
        console.log('- orgId prop:', orgId);
        console.log('- getOrgId():', getOrgId());
        console.log('- activeOrgId:', activeOrgId);

        if (!activeOrgId) {
          alert('Organization ID is missing. Please try refreshing the page or going back to the Organization Details step to ensure it was saved correctly.');
          setIsLoading(false);
          return;
        }

        // --- Prepare Payload ---
        // Mapping frontend state to API keys (based on Postman screenshot)
        const payload = {
          name: currentLocation.name,
          code: currentLocation.code,
          addressLine1: currentLocation.addressLine1,
          addressLine2: currentLocation.addressLine2,
          city: currentLocation.city,
          state: currentLocation.state,
          country: currentLocation.country,
          postalCode: currentLocation.postalCode,
          timeZone: currentLocation.timeZone || 'IST', // Defaulting if empty, or ensure it's selected
          organizationId: activeOrgId,
        };

        // Axios POST Request - using getApiUrl() for proper URL formatting
        const response = await axios.post(
          `${getApiUrl()}/org/${activeOrgId}/locations`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.status === 200 || response.status === 201) {
          // Get the location ID from response
          const newLocationId = response.data.id;

          // Success: Add the NEW location returned from API
          const savedLocation = {
            ...currentLocation,
            id: newLocationId || Date.now().toString()
          };

          setLocations([...locations, savedLocation]);

          // Store the first location ID for subsequent steps
          if (newLocationId && locations.length === 0) {
            saveLocationId(newLocationId); // Save to localStorage
            onLocationCreated?.(newLocationId); // Notify parent
            console.log('Location created with ID:', newLocationId);
          }

          // Reset form and errors
          setCurrentLocation({
            id: '',
            name: '',
            code: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            country: '',
            state: '',
            postalCode: '',
            timeZone: '',
          });
          setErrors({});
          setShowLocationForm(false);
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Axios error:', error.response?.data || error.message);
          if (error.message === 'Network Error') {
            const activeOrgId = orgId || getOrgId();
            const apiUrl = `${getApiUrl()}/org/${activeOrgId}/locations`;
            alert(`Network Error: Unable to connect to server at ${apiUrl}. Please ensure the backend is running and accessible.`);
          } else {
            alert(`Failed to save location: ${error.response?.data?.message || error.message}`);
          }
        } else {
          console.error('Unexpected error:', error);
          alert('An unexpected error occurred while saving the location.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (showLocationForm) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-xl font-semibold">Add Location</h2>
          <button onClick={() => setShowLocationForm(false)} className="text-gray-500 hover:text-gray-700 p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-8">
          <h3 className="text-lg font-medium mb-6">Location Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Location Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Headquarters"
                value={currentLocation.name}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {errors.name && <span className="text-xs text-red-500 font-medium">Required</span>}
            </div>

            {/* Location Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Location Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. HQ-01"
                value={currentLocation.code}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, code: e.target.value });
                  if (errors.code) setErrors({ ...errors, code: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
              {errors.code && <span className="text-xs text-red-500 font-medium">Required</span>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Address line 1"
                  value={currentLocation.addressLine1}
                  onChange={(e) => setCurrentLocation({ ...currentLocation, addressLine1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Address line 2 (Optional)"
                  value={currentLocation.addressLine2}
                  onChange={(e) => setCurrentLocation({ ...currentLocation, addressLine2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="City"
                value={currentLocation.city}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, city: e.target.value });
                  if (errors.city) setErrors({ ...errors, city: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={currentLocation.country}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, country: e.target.value });
                  if (errors.country) setErrors({ ...errors, country: false });
                }}
                className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              >
                <option value="">Select Country</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={currentLocation.state}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, state: e.target.value });
                  if (errors.state) setErrors({ ...errors, state: false });
                }}
                className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              >
                <option value="">Select State</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
              </select>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Postal Code"
                value={currentLocation.postalCode}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, postalCode: e.target.value });
                  if (errors.postalCode) setErrors({ ...errors, postalCode: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.postalCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Time Zone</label>
              <select
                value={currentLocation.timeZone}
                onChange={(e) => setCurrentLocation({ ...currentLocation, timeZone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>IST (UTC+5:30)</option>
                <option>EST (UTC-5:00)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleSaveLocation}
              disabled={isLoading}
              className={`flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-medium active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Submit'}
            </button>
            <button
              onClick={() => {
                // Logic for Submit and New would be similar but keeping form open
                handleSaveLocation();
                // Note: The original implementation was identical.
              }}
              disabled={isLoading}
              className={`flex-1 px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-all font-medium active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Submit and New
            </button>
            <button
              onClick={() => setShowLocationForm(false)}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-lg text-gray-600">
          Total Count: <span className="text-blue-600 font-bold">{locations.length}</span>
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">Import</button>
          <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">↓</button>
          <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">☰</button>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-10 md:py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
          <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center animate-bounce duration-3000">
            <div className="text-4xl md:text-6xl">📍</div>
          </div>
          <p className="text-gray-600 mb-6 px-4">
            No locations added currently. Add all the geographical locations <br className="hidden md:block" /> your organization operates from.
          </p>
          <button
            onClick={() => setShowLocationForm(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md font-semibold transition-all active:scale-95"
          >
            Add Location
          </button>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Location Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">City</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">{loc.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{loc.code}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{loc.city}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{loc.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
            <button
              onClick={() => setShowLocationForm(true)}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium transition-all"
            >
              Add Another Location
            </button>
            <button
              onClick={() => onNext(locations[0]?.id)}
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md font-semibold transition-all active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}