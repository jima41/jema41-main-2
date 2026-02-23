import React from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';

interface DashboardStatProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'gold' | 'emerald' | 'red' | 'blue';
}

const colorClasses = {
  gold: 'text-admin-gold bg-admin-gold/10 border-admin-gold/30',
  emerald: 'text-emerald-400 bg-emerald-900/20 border-emerald-700/30',
  red: 'text-red-400 bg-red-900/20 border-red-700/30',
  blue: 'text-blue-400 bg-blue-900/20 border-blue-700/30',
};

const MobileDashboardStat: React.FC<DashboardStatProps> = ({
  title,
  value,
  change,
  icon,
  color,
}) => {
  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-admin-text-secondary mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-admin-text-primary">
            {value}
          </p>
        </div>
        <div className="flex-shrink-0 opacity-50">
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {change >= 0 ? (
            <>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">
                +{change}%
              </span>
            </>
          ) : (
            <>
              <ArrowDownLeft className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">
                {change}%
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileDashboardStat;
