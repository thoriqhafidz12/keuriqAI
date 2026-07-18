import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id?: string;
  className?: string;
}

export default function DatePicker({
  label,
  error,
  id,
  className = '',
  ...props
}: DatePickerProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
      <input
        type="date"
        id={inputId}
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
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
