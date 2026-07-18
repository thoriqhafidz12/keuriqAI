import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: SelectOption[];
  id?: string;
  className?: string;
}

export default function Select({
  label,
  error,
  options,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
      <select
        id={selectId}
        className={`
          block w-full rounded-lg border px-3 py-2 text-sm
          text-slate-900
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}
          disabled:bg-slate-100 disabled:cursor-not-allowed
          ${className}
        `.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
