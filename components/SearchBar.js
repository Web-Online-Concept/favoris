'use client';

import { useState, useEffect, useCallback } from 'react';

export default function SearchBar({ value, onChange, placeholder, compact = false }) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useCallback(onChange, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      debouncedOnChange(localValue);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localValue, debouncedOnChange]);

  // Classes conditionnelles pour version compacte
  const inputClasses = compact 
    ? "block w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    : "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const iconClasses = compact
    ? "h-4 w-4 text-gray-400"
    : "h-5 w-5 text-gray-400";

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={inputClasses}
      />
      {localValue && (
        <button
          onClick={() => setLocalValue('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}