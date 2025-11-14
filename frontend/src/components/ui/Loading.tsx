import { GraduationCap } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-6">
    {/* Logo */}
    <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center">
      <GraduationCap className="w-8 h-8 text-white" />
    </div>

    {/* Progress Bar */}
    <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
    </div>
  </div>
);

// Inline loading spinner for buttons and small areas
const InlineLoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} border border-blue-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};

export { LoadingSpinner, InlineLoadingSpinner };


