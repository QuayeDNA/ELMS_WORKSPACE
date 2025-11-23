/**
 * ELMS Mobile - FAB (Floating Action Button) Component
 * Primary action button with elevation
 */

import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledTouchable = styled(TouchableOpacity);

export interface FABProps extends TouchableOpacityProps {
  icon: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

const variantStyles: Record<string, { container: string; iconColor: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    iconColor: '#ffffff',
  },
  secondary: {
    container: 'bg-violet-600 active:bg-violet-700',
    iconColor: '#ffffff',
  },
  success: {
    container: 'bg-success-500 active:bg-success-600',
    iconColor: '#ffffff',
  },
  error: {
    container: 'bg-error-500 active:bg-error-600',
    iconColor: '#ffffff',
  },
};

const sizeStyles: Record<string, { container: string; iconSize: number }> = {
  md: {
    container: 'w-14 h-14',
    iconSize: 24,
  },
  lg: {
    container: 'w-16 h-16',
    iconSize: 28,
  },
};

export const FAB: React.FC<FABProps> = ({
  icon,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const containerClass = `
    rounded-full items-center justify-center
    shadow-lg
    ${variantStyles[variant].container}
    ${sizeStyles[size].container}
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `;

  return (
    <StyledTouchable
      className={containerClass}
      activeOpacity={0.8}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel || 'Floating action button'}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].iconColor} size="small" />
      ) : (
        <Ionicons
          name={icon}
          size={sizeStyles[size].iconSize}
          color={variantStyles[variant].iconColor}
        />
      )}
    </StyledTouchable>
  );
};

export default FAB;
