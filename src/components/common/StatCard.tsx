import React from 'react';
import Card from './Card';

interface TrendProps {
  value: string;
  positive: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: TrendProps;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <Card className={`flex items-center gap-4 ${className}`}>
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {trend && (
          <p
            className={`text-sm mt-0.5 flex items-center gap-1 ${
              trend.positive ? 'text-green-600' : 'text-red-500'
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${trend.positive ? '' : 'rotate-180'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
}
