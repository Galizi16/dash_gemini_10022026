
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_MAP: Record<string, string> = {
  primary: 'from-blue-500/20 text-blue-400',
  success: 'from-emerald-500/20 text-emerald-400',
  warning: 'from-amber-500/20 text-amber-400',
  danger: 'from-rose-500/20 text-rose-400',
  purple: 'from-purple-500/20 text-purple-400',
  accent: 'from-violet-500/20 text-violet-400',
};

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  prefix?: string;
  suffix?: string;
  subValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'accent';
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, value, trend, prefix, suffix, subValue, color = 'primary' 
}) => {
  // Defensive lookup: ensure we have a string from the map, fallback to primary if key is missing or invalid
  const selectedClasses = (color && COLOR_MAP[color]) ? COLOR_MAP[color] : COLOR_MAP.primary;
  
  // Safely get the first class for the gradient background
  const firstClass = selectedClasses ? selectedClasses.split(' ')[0] : 'from-blue-500/20';

  return (
    <div className="gradient-border p-6 transition-all hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : trend < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
            {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : trend < 0 ? <TrendingDown size={12} className="mr-1" /> : <Minus size={12} className="mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-1">
        {prefix && <span className="text-xl font-medium text-slate-500">{prefix}</span>}
        <span className="text-3xl font-bold tracking-tight mono">{value}</span>
        {suffix && <span className="text-lg font-medium text-slate-500">{suffix}</span>}
      </div>
      {subValue && (
        <p className="mt-2 text-sm text-slate-500 flex items-center">
          {subValue}
        </p>
      )}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${firstClass} to-transparent opacity-50`} />
    </div>
  );
};

export default StatCard;
