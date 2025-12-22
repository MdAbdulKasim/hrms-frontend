'use client';

import React, { useState } from 'react';
import { Department } from './types';

interface DepartmentsStepProps {
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
  onNext: () => void;
}

export default function DepartmentsStep({
  departments,
  setDepartments,
  onNext,
}: DepartmentsStepProps) {
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);

  if (showDepartmentForm) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Add Department</h2>
        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Department Name"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Code"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setShowDepartmentForm(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
          <button
            onClick={() => setShowDepartmentForm(false)}
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
          Total Count: <span className="text-blue-600 font-semibold">#</span>
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDepartmentForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Department
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Import</button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">☰</button>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Associated users</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mail Alias</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department Lead</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Parent Department</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{dept.name}</td>
              <td className="px-4 py-3">{dept.code}</td>
              <td className="px-4 py-3">
                <span className="text-blue-600">{dept.associatedUsers}</span>
              </td>
              <td className="px-4 py-3">{dept.mailAlias}</td>
              <td className="px-4 py-3">{dept.departmentLead}</td>
              <td className="px-4 py-3">{dept.parentDepartment}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}