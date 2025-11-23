/**
 * ELMS Mobile - Typography Components
 * Material Design 3 text styles
 */

import React from 'react';
import { Text, TextProps } from 'react-native';
import { styled } from 'nativewind';

const StyledText = styled(Text);

export interface TypographyProps extends TextProps {
  variant?:
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  className?: string;
}

const variantStyles: Record<string, string> = {
  displayLarge: 'text-5xl font-normal leading-tight',
  displayMedium: 'text-4xl font-normal leading-tight',
  displaySmall: 'text-3xl font-normal leading-tight',
  headlineLarge: 'text-3xl font-semibold leading-tight',
  headlineMedium: 'text-2xl font-semibold leading-tight',
  headlineSmall: 'text-xl font-semibold leading-tight',
  titleLarge: 'text-lg font-semibold',
  titleMedium: 'text-base font-semibold',
  titleSmall: 'text-sm font-semibold',
  bodyLarge: 'text-base font-normal',
  bodyMedium: 'text-sm font-normal',
  bodySmall: 'text-xs font-normal',
  labelLarge: 'text-sm font-medium',
  labelMedium: 'text-xs font-medium',
  labelSmall: 'text-[11px] font-medium',
};

const colorStyles: Record<string, string> = {
  primary: 'text-neutral-900',
  secondary: 'text-neutral-600',
  tertiary: 'text-neutral-500',
  error: 'text-error-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  className = '',
  children,
  ...props
}) => {
  const textClass = `
    ${variantStyles[variant]}
    ${colorStyles[color]}
    ${className}
  `;

  return (
    <StyledText className={textClass} {...props}>
      {children}
    </StyledText>
  );
};

// Convenience components
export const Heading: React.FC<Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 }> = ({
  level = 1,
  ...props
}) => {
  const variants = ['headlineLarge', 'headlineMedium', 'headlineSmall'] as const;
  return <Typography variant={variants[level - 1]} {...props} />;
};

export const Title: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'lg' | 'md' | 'sm' }> = ({
  size = 'md',
  ...props
}) => {
  const variants = {
    lg: 'titleLarge',
    md: 'titleMedium',
    sm: 'titleSmall',
  } as const;
  return <Typography variant={variants[size]} {...props} />;
};

export const Body: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'lg' | 'md' | 'sm' }> = ({
  size = 'md',
  ...props
}) => {
  const variants = {
    lg: 'bodyLarge',
    md: 'bodyMedium',
    sm: 'bodySmall',
  } as const;
  return <Typography variant={variants[size]} {...props} />;
};

export const Label: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'lg' | 'md' | 'sm' }> = ({
  size = 'md',
  ...props
}) => {
  const variants = {
    lg: 'labelLarge',
    md: 'labelMedium',
    sm: 'labelSmall',
  } as const;
  return <Typography variant={variants[size]} {...props} />;
};

export default Typography;
