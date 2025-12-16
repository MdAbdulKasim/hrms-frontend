"use client";

interface Props {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

export default function Toggle({ enabled, setEnabled }: Props) {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-12 h-6 rounded-full relative transition ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
