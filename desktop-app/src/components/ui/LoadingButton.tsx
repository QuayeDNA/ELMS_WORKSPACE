import React from 'react';
import { Button } from './button';
import { Loader } from './Loader';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  ariaLabel?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  ariaLabel,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  return (
    <Button
      {...rest}
      className={className}
      aria-label={ariaLabel}
      disabled={loading || disabled}
    >
      {loading ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <Loader size={16} className="text-current" />
          <span className="sr-only">{ariaLabel || 'Loading'}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
};
