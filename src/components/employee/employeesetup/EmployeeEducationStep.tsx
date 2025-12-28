'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Education } from '../../admin/setup/types';

interface EmployeeEducationStepProps {
  education: Education[];
  setEducation: (data: Education[]) => void;
  onComplete: () => void;
}

export default function EmployeeEducationStep({
  education,
  setEducation,
  onComplete,
}: EmployeeEducationStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<Education>({
    id: '',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
  });

  const handleAddEducation = () => {
    if (currentEdu.institution && currentEdu.degree && currentEdu.fieldOfStudy) {
      setEducation([...education, { ...currentEdu, id: Date.now().toString() }]);
      setCurrentEdu({
        id: '',
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
      });
      setShowForm(false);
    }
  };

  const handleDeleteEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-6">Add Education</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-2">
                Institute Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentEdu.institution}
                onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                placeholder="Enter institute/university name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentEdu.degree}
                onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                placeholder="e.g., B.Tech, M.Sc, MBA"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Field of Study <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentEdu.fieldOfStudy}
                onChange={(e) => setCurrentEdu({ ...currentEdu, fieldOfStudy: e.target.value })}
                placeholder="e.g., Computer Science, Business"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Start Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentEdu.startYear}
                onChange={(e) => setCurrentEdu({ ...currentEdu, startYear: e.target.value })}
                placeholder="e.g., 2018"
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                End Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentEdu.endYear}
                onChange={(e) => setCurrentEdu({ ...currentEdu, endYear: e.target.value })}
                placeholder="e.g., 2022"
                maxLength={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleAddEducation}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Education
          </button>
          <button
            onClick={() => setShowForm(false)}
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
        <h3 className="text-lg font-semibold text-gray-800">
          Education ({education.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No education details added yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {edu.startYear} - {edu.endYear}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEducation(edu.id ?? '')}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Complete Profile Setup
        </button>
      </div>
    </div>
  );
}