import React from 'react';
import { ActivityItemProps } from '../../types/dashboard';

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const getSeverityColor = (severity: ActivityItemProps['activity']['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityBg = (severity: ActivityItemProps['activity']['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'bg-green-50 dark:bg-green-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${getSeverityBg(activity.severity)} hover:shadow-sm transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {activity.user}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(activity.severity)} ${getSeverityBg(activity.severity)}`}>
              {activity.severity.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {activity.action} <span className="font-medium">{activity.target}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(activity.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};
