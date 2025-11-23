/**
 * ELMS Mobile - Card Component
 * Material Design 3 surface component
 */

import React from 'react';
import { View, ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

export interface CardProps extends ViewProps {
  variant?: 'default' | 'outlined' | 'elevated';
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white',
  outlined: 'bg-white border border-neutral-200',
  elevated: 'bg-white shadow-md',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const cardClass = `
    rounded-xl
    ${variantStyles[variant]}
    ${className}
  `;

  return (
    <StyledView className={cardClass} {...props}>
      {children}
    </StyledView>
  );
};

export const CardHeader: React.FC<ViewProps & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <StyledView className={`p-4 border-b border-neutral-100 ${className}`} {...props}>
      {children}
    </StyledView>
  );
};

export const CardContent: React.FC<ViewProps & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <StyledView className={`p-4 ${className}`} {...props}>
      {children}
    </StyledView>
  );
};

export const CardFooter: React.FC<ViewProps & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <StyledView className={`p-4 border-t border-neutral-100 ${className}`} {...props}>
      {children}
    </StyledView>
  );
};

export default Card;
