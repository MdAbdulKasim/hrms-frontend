'use client';

import React, { useState } from 'react';
import { Designation } from './types';

interface DesignationsStepProps {
  designations: Designation[];
  setDesignations: (designations: Designation[]) => void;
  onComplete: () => void;
}

export default function DesignationsStep({
  designations,
  setDesignations,
  onComplete,
}: DesignationsStepProps) {
  const [showDesignationForm, setShowDesignationForm] = useState(false);
  const [currentDesignation, setCurrentDesignation] = useState<Designation>({
    id: '',
    name: '',
    code: '',
    description: '',
  });

  const handleSaveDesignation = () => {
    if (currentDesignation.name) {
      setDesignations([...designations, { ...currentDesignation, id: Date.now().toString() }]);
      setCurrentDesignation({ id: '', name: '', code: '', description: '' });
      setShowDesignationForm(false);
    }
  };

  if (showDesignationForm) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Add Designation</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Designation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentDesignation.name}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Code</label>
            <input
              type="text"
              value={currentDesignation.code}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Description</label>
            <textarea
              value={currentDesignation.description}
              onChange={(e) => setCurrentDesignation({ ...currentDesignation, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSaveDesignation}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit and New
          </button>
          <button
            onClick={() => setShowDesignationForm(false)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg text-gray-600">
          Total Count: <span className="text-blue-600 font-semibold">{designations.length}</span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDesignationForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Designation
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Import</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">☰</button>
        </div>
      </div>

      {designations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-6">No designations added yet. Click "Add Designation" to get started.</p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Designation Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
            </tr>
          </thead>
          <tbody>
            {designations.map(desig => (
              <tr key={desig.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{desig.name}</td>
                <td className="px-4 py-3">{desig.code}</td>
                <td className="px-4 py-3">{desig.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}