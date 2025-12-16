"use client";

import { useState } from "react";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function LocationsStep({ onNext, onBack }: Props) {
  const [locations, setLocations] = useState<string[]>([""]);

  const updateLocation = (value: string, index: number) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
  };

  const addLocationField = () => {
    setLocations([...locations, ""]);
  };

  const removeLocationField = (index: number) => {
    const updated = locations.filter((_, i) => i !== index);
    setLocations(updated.length ? updated : [""]);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold">Locations</h2>
        <p className="text-sm text-gray-500">
          Add all company locations
        </p>
      </div>

      {/* Location Inputs */}
      <div className="space-y-3">
        {locations.map((location, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={location}
              onChange={(e) => updateLocation(e.target.value, index)}
              className="flex-1 border p-3 rounded-md"
              placeholder={`Location ${index + 1}`}
            />

            {locations.length > 1 && (
              <button
                onClick={() => removeLocationField(index)}
                className="px-3 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add More */}
      <button
        onClick={addLocationField}
        className="text-blue-600 text-sm font-medium hover:underline"
      >
        + Add another location
      </button>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
