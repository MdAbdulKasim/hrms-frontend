"use client";

import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

export default function Dropdown({ value, options, onChange }: Props) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        {/* Button */}
        <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white text-sm hover:border-blue-500 transition">
          <span>{value}</span>
          <ChevronDown size={16} />
        </Listbox.Button>

        {/* Dropdown */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-150"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Listbox.Options className="absolute z-10 mt-2 w-full bg-white border rounded-xl shadow-lg text-sm overflow-hidden">
            {options.map((opt) => (
              <Listbox.Option
                key={opt}
                value={opt}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`
                }
              >
                {opt}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
