'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { WorkExperience } from '../../admin/setup/types';

interface EmployeeWorkExperienceStepProps {
  workExperience: WorkExperience[];
  setWorkExperience: (data: WorkExperience[]) => void;
  onNext: () => void;
}

export default function EmployeeWorkExperienceStep({
  workExperience,
  setWorkExperience,
  onNext,
}: EmployeeWorkExperienceStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentExp, setCurrentExp] = useState<WorkExperience>({
    id: '',
    companyName: '',
    jobTitle: '',
    fromDate: '',
    toDate: '',
    currentlyWorking: false,
    jobDescription: '',
  });

  const handleAddExperience = () => {
    if (currentExp.companyName && currentExp.jobTitle && currentExp.fromDate) {
      setWorkExperience([...workExperience, { ...currentExp, id: Date.now().toString() }]);
      setCurrentExp({
        id: '',
        companyName: '',
        jobTitle: '',
        fromDate: '',
        toDate: '',
        currentlyWorking: false,
        jobDescription: '',
      });
      setShowForm(false);
    }
  };

  const handleDeleteExperience = (id: string) => {
    setWorkExperience(workExperience.filter(exp => exp.id !== id));
  };

  const handleCurrentlyWorkingChange = (checked: boolean) => {
    setCurrentExp({
      ...currentExp,
      currentlyWorking: checked,
      toDate: checked ? '' : currentExp.toDate
    });
  };

  if (showForm) {
    return (
      <div className="bg-white rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-6">Add Work Experience</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentExp.companyName}
                onChange={(e) => setCurrentExp({ ...currentExp, companyName: e.target.value })}
                placeholder="Enter company name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentExp.jobTitle}
                onChange={(e) => setCurrentExp({ ...currentExp, jobTitle: e.target.value })}
                placeholder="Enter job title"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={currentExp.fromDate}
                onChange={(e) => setCurrentExp({ ...currentExp, fromDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                To Date {!currentExp.currentlyWorking && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={currentExp.toDate}
                onChange={(e) => setCurrentExp({ ...currentExp, toDate: e.target.value })}
                disabled={currentExp.currentlyWorking}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={currentExp.currentlyWorking}
                onChange={(e) => handleCurrentlyWorkingChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Job Description</label>
            <textarea
              value={currentExp.jobDescription}
              onChange={(e) => setCurrentExp({ ...currentExp, jobDescription: e.target.value })}
              placeholder="Brief description of your role and responsibilities"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleAddExperience}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Experience
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
          Work Experience ({workExperience.length})
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {workExperience.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No work experience added yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workExperience.map((exp) => (
            <div key={exp.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{exp.jobTitle}</h4>
                  <p className="text-sm text-gray-600">{exp.companyName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {exp.fromDate} - {exp.currentlyWorking ? 'Present' : exp.toDate}
                  </p>
                  {exp.jobDescription && (
                    <p className="text-sm text-gray-700 mt-2">{exp.jobDescription}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <p className="text-sm text-gray-600">
          {workExperience.length === 0 ? (
            'You can skip this step if you are a fresher'
          ) : (
            'You can add more experiences or continue'
          )}
        </p>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {workExperience.length === 0 ? 'Skip & Continue' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}