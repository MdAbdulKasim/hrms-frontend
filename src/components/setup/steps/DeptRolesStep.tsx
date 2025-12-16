"use client";

import { useState } from "react";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export default function DeptRolesStep({ onBack, onComplete }: Props) {
  const [departments, setDepartments] = useState<string[]>([""]);
  const [roles, setRoles] = useState<string[]>([""]);

  /* =====================
     DEPARTMENTS HANDLERS
  ====================== */
  const updateDepartment = (value: string, index: number) => {
    const updated = [...departments];
    updated[index] = value;
    setDepartments(updated);
  };

  const addDepartment = () => {
    setDepartments([...departments, ""]);
  };

  const removeDepartment = (index: number) => {
    const updated = departments.filter((_, i) => i !== index);
    setDepartments(updated);
  };

  /* =====================
        ROLES HANDLERS
  ====================== */
  const updateRole = (value: string, index: number) => {
    const updated = [...roles];
    updated[index] = value;
    setRoles(updated);
  };

  const addRole = () => {
    setRoles([...roles, ""]);
  };

  const removeRole = (index: number) => {
    const updated = roles.filter((_, i) => i !== index);
    setRoles(updated);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Departments & Roles</h2>
        <p className="text-sm text-gray-500">
          Define your organization structure
        </p>
      </div>

      {/* =====================
           DEPARTMENTS
      ====================== */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Departments</label>

        {departments.map((dept, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={dept}
              onChange={(e) => updateDepartment(e.target.value, index)}
              placeholder="Department name"
              className="flex-1 border p-3 rounded-md"
            />

            {/* ADD BUTTON (only on last input) */}
            {index === departments.length - 1 && (
              <button
                type="button"
                onClick={addDepartment}
                className="px-4 bg-blue-600 text-white rounded-md"
              >
                +
              </button>
            )}

            {/* REMOVE BUTTON (not for first field) */}
            {departments.length > 1 && index !== 0 && (
              <button
                type="button"
                onClick={() => removeDepartment(index)}
                className="px-4 bg-red-100 text-red-600 rounded-md"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* =====================
              ROLES
      ====================== */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Roles</label>

        {roles.map((role, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={role}
              onChange={(e) => updateRole(e.target.value, index)}
              placeholder="Role name"
              className="flex-1 border p-3 rounded-md"
            />

            {/* ADD BUTTON */}
            {index === roles.length - 1 && (
              <button
                type="button"
                onClick={addRole}
                className="px-4 bg-blue-600 text-white rounded-md"
              >
                +
              </button>
            )}

            {/* REMOVE BUTTON */}
            {roles.length > 1 && index !== 0 && (
              <button
                type="button"
                onClick={() => removeRole(index)}
                className="px-4 bg-red-100 text-red-600 rounded-md"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 rounded-md"
        >
          Back
        </button>

        <button
          onClick={onComplete}
          className="px-6 py-2 bg-green-600 text-white rounded-md"
        >
          Finish Setup ✓
        </button>
      </div>
    </div>
  );
}
