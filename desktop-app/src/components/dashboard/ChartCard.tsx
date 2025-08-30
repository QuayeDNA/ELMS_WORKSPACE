import React from 'react';
import { ChartCardProps } from '../../types/dashboard';

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  type,
  className = "",
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      {type === 'bar' ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color || '#3B82F6',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {data.map((item) => (
            <div key={item.name} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2"
                style={{ backgroundColor: item.color || '#3B82F6' }}
              >
                {item.value}
              </div>
              <span className="text-xs text-center text-gray-600 dark:text-gray-400 max-w-20">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
