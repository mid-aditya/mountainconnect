import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'danger';
  className?: string;
}

const colorStyles = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600', ring: 'ring-primary-500/20' },
  secondary: { bg: 'bg-secondary-50', icon: 'text-secondary-600', ring: 'ring-secondary-500/20' },
  accent: { bg: 'bg-accent-50', icon: 'text-accent-600', ring: 'ring-accent-500/20' },
  danger: { bg: 'bg-danger-50', icon: 'text-danger-600', ring: 'ring-danger-500/20' },
};

export default function StatCard({ icon, label, value, trend, color = 'primary', className }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div className={clsx('card p-6 hover:shadow-md transition-shadow group', className)}>
      <div className="flex items-start justify-between">
        <div className={clsx('p-3 rounded-xl', styles.bg)}>
          <div className={clsx('w-6 h-6', styles.icon)}>
            {icon}
          </div>
        </div>
        {trend && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium',
              trend.isUp ? 'bg-secondary-50 text-secondary-700' : 'bg-danger-50 text-danger-700'
            )}
          >
            <svg
              className={clsx('w-3 h-3', trend.isUp ? 'rotate-0' : 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 font-display">{value}</p>
      </div>
    </div>
  );
}
