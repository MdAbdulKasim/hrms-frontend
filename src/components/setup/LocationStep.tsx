'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios'; // 1. Import Axios
import { Location } from './types';

interface LocationsStepProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  onNext: () => void;
  orgId?: string; // Added orgId so we can build the URL: /org/{orgId}/locations
}

export default function LocationsStep({
  locations,
  setLocations,
  onNext,
  orgId,
}: LocationsStepProps) {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track API loading state
  
  // State to track validation errors
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [currentLocation, setCurrentLocation] = useState<Location>({
    id: '',
    locationName: '',
    locationCode: '',
    mailAlias: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    state: '',
    postalCode: '',
    timeZone: '',
  });

  // Helper: Get Token from Cookies
  const getTokenFromCookies = (cookieName: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${cookieName}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const handleSaveLocation = async () => {
    // 1. Identify important fields
    const requiredFields = [
      'locationName',
      'locationCode',
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
        // --- Get Token ---
        const token = getTokenFromCookies('authToken'); // Replace 'authToken' with your actual cookie name
        
        if (!token) {
            alert('Authentication token not found. Please log in.');
            setIsLoading(false);
            return;
        }

        // --- Validate Org ID ---
        // We check if orgId prop is passed, or try to find it in localStorage if you stored it there previously
        const activeOrgId = orgId || localStorage.getItem('currentOrgId'); 
        
        if (!activeOrgId) {
            alert('Organization ID is missing. Cannot save location.');
            setIsLoading(false);
            return;
        }

        // --- Prepare Payload ---
        // Mapping frontend state to API keys (based on Postman screenshot)
        const payload = {
          name: currentLocation.locationName,
          code: currentLocation.locationCode,
          addressLine1: currentLocation.addressLine1,
          addressLine2: currentLocation.addressLine2,
          city: currentLocation.city,
          state: currentLocation.state,
          country: currentLocation.country,
          postalCode: currentLocation.postalCode,
          timeZone: currentLocation.timeZone || 'IST', // Defaulting if empty, or ensure it's selected
        };

        // --- Axios POST Request ---
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}org/${activeOrgId}/locations`, 
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.status === 200 || response.status === 201) {
             // Success: Add the NEW location returned from API (which has the real DB ID)
             // or combine local data with the returned ID.
             const savedLocation = {
                 ...currentLocation,
                 id: response.data.id || Date.now().toString() // Use API ID if available
             };

             setLocations([...locations, savedLocation]);
             
             // Reset form and errors
             setCurrentLocation({
                id: '',
                locationName: '',
                locationCode: '',
                mailAlias: '',
                description: '',
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
            alert(`Failed to save location: ${error.response?.data?.message || error.message}`);
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
      <div className="bg-white rounded-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add Location</h2>
          <button onClick={() => setShowLocationForm(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8">
          <h3 className="text-lg font-medium mb-6">Location Details</h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Location Name */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
                Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentLocation.locationName}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, locationName: e.target.value });
                  if (errors.locationName) setErrors({ ...errors, locationName: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.locationName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.locationName && <span className="text-xs text-red-500">Required</span>}
            </div>

            {/* Location Code */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
                Location Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentLocation.locationCode}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, locationCode: e.target.value });
                  if (errors.locationCode) setErrors({ ...errors, locationCode: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.locationCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
               {errors.locationCode && <span className="text-xs text-red-500">Required</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">Mail Alias</label>
              <input
                type="text"
                value={currentLocation.mailAlias}
                onChange={(e) => setCurrentLocation({ ...currentLocation, mailAlias: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">Description</label>
              <textarea
                value={currentLocation.description}
                onChange={(e) => setCurrentLocation({ ...currentLocation, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm text-gray-700">Address</label>
              <input
                type="text"
                placeholder="Address line 1"
                value={currentLocation.addressLine1}
                onChange={(e) => setCurrentLocation({ ...currentLocation, addressLine1: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <input
                type="text"
                placeholder="Address line 2"
                value={currentLocation.addressLine2}
                onChange={(e) => setCurrentLocation({ ...currentLocation, addressLine2: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
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
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={currentLocation.country}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, country: e.target.value });
                  if (errors.country) setErrors({ ...errors, country: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
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
              <label className="text-sm text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={currentLocation.state}
                onChange={(e) => {
                  setCurrentLocation({ ...currentLocation, state: e.target.value });
                  if (errors.state) setErrors({ ...errors, state: false });
                }}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select State</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
              </select>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
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
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm text-gray-700">Time Zone</label>
              <select
                value={currentLocation.timeZone}
                onChange={(e) => setCurrentLocation({ ...currentLocation, timeZone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option>IST (UTC+5:30)</option>
                <option>EST (UTC-5:00)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSaveLocation}
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Saving...' : 'Submit'}
            </button>
            <button
              onClick={handleSaveLocation}
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              Submit and New
            </button>
            <button
              onClick={() => setShowLocationForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-gray-600">
          Total Count: <span className="text-blue-600 font-semibold">{locations.length}</span>
        </h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Import</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">↓</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">☰</button>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-48 h-48 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <div className="text-6xl">🤖</div>
          </div>
          <p className="text-gray-600 mb-6">
            No locations added currently. Add all the geographical locations your<br />
            organization operates from.
          </p>
          <button
            onClick={() => setShowLocationForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Location
          </button>
        </div>
      ) : (
        <div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">City</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Country</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(loc => (
                <tr key={loc.id} className="border-b">
                  <td className="px-4 py-3">{loc.locationName}</td>
                  <td className="px-4 py-3">{loc.locationCode}</td>
                  <td className="px-4 py-3">{loc.city}</td>
                  <td className="px-4 py-3">{loc.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => setShowLocationForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Location
            </button>
            <button
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}