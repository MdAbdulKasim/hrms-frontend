interface Props {
  onNext: () => void;
}

export default function CompanyDetails({ onNext }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Company Details</h2>
      <p className="text-gray-500 mb-6">
        Tell us about your company to get started
      </p>

      <div className="space-y-4">
        <input
          className="w-full border rounded-md p-3"
          placeholder="Company Name"
        />

        <input
          className="w-full border rounded-md p-3"
          placeholder="Website"
        />

        <input
          className="w-full border rounded-md p-3"
          placeholder="Admin Role Title"
        />
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
      >
        Next →
      </button>
    </div>
  );
}
