import { GraduationCap } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px] p-8">
    <div className="text-center space-y-4">
      {/* Animated Logo */}
      <div className="relative inline-block">
        {/* Spinning ring */}
        <div className="absolute inset-0">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>

        {/* Logo */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Loading text */}
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Loading...
      </p>
    </div>
  </div>
);

// Inline loading spinner for buttons and small areas
const InlineLoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

export { LoadingSpinner, InlineLoadingSpinner };


