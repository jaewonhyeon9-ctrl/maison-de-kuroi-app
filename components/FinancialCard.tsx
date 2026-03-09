
import React from 'react';

interface FinancialCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'indigo';
}

const FinancialCard: React.FC<FinancialCardProps> = ({ title, value, change, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorClasses[color]} shadow-sm transition-all hover:shadow-md`}>
      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {change && (
        <div className={`text-xs font-medium flex items-center ${
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
        }`}>
          {trend === 'up' && '▲'} {trend === 'down' && '▼'} {change} from last period
        </div>
      )}
    </div>
  );
};

export default FinancialCard;
