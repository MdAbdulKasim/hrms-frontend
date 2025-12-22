'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Location } from './types';

interface LocationsStepProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  onNext: () => void;
}

export default function LocationsStep({
  locations,
  setLocations,
  onNext,
}: LocationsStepProps) {
  const [showLocationForm, setShowLocationForm] = useState(false);
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

  const handleSaveLocation = () => {
    if (currentLocation.locationName) {
      setLocations([...locations, { ...currentLocation, id: Date.now().toString() }]);
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
      setShowLocationForm(false);
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
            <div className="space-y-2">
              <label className="text-sm text-gray-700">
                Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentLocation.locationName}
                onChange={(e) => setCurrentLocation({ ...currentLocation, locationName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">Location Code</label>
              <input
                type="text"
                value={currentLocation.locationCode}
                onChange={(e) => setCurrentLocation({ ...currentLocation, locationCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

            <div className="space-y-2">
              <input
                type="text"
                placeholder="City"
                value={currentLocation.city}
                onChange={(e) => setCurrentLocation({ ...currentLocation, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <select
                value={currentLocation.country}
                onChange={(e) => setCurrentLocation({ ...currentLocation, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Country</option>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </div>

            <div className="space-y-2">
              <select
                value={currentLocation.state}
                onChange={(e) => setCurrentLocation({ ...currentLocation, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
              </select>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Postal Code"
                value={currentLocation.postalCode}
                onChange={(e) => setCurrentLocation({ ...currentLocation, postalCode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit
            </button>
            <button
              onClick={handleSaveLocation}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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