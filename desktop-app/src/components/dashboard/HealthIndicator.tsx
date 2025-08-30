import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { HealthIndicatorProps } from '../../types/dashboard';

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  label,
  value,
  status,
  icon,
}) => {
  const getStatusConfig = (status: HealthIndicatorProps['status']) => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'critical':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
        };
      default:
        return {
          icon: <CheckCircle className="h-5 w-5 text-gray-500" />,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center space-x-3">
        {icon || config.icon}
        <div>
          <p className={`text-sm font-medium ${config.textColor}`}>
            {label}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        {config.icon}
      </div>
    </div>
  );
};
