/**
 * ELMS Mobile - Button Component
 * Material Design 3 + Tailwind styling
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-primary-600 active:bg-primary-700',
  outline: 'bg-transparent border-2 border-primary-600 active:bg-primary-50',
  ghost: 'bg-transparent active:bg-neutral-100',
  destructive: 'bg-error-500 active:bg-error-600',
  success: 'bg-success-500 active:bg-success-600',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-9 px-3 rounded-lg',
  md: 'h-11 px-4 rounded-lg',
  lg: 'h-14 px-6 rounded-xl',
  icon: 'h-11 w-11 rounded-lg',
};

const textVariantStyles: Record<string, string> = {
  default: 'text-white',
  outline: 'text-primary-600',
  ghost: 'text-primary-600',
  destructive: 'text-white',
  success: 'text-white',
};

const textSizeStyles: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  icon: '',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  textClassName = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const buttonClass = `
    flex-row items-center justify-center
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${isDisabled ? 'opacity-50' : ''}
    ${className}
  `;

  const textClass = `
    font-medium
    ${textVariantStyles[variant]}
    ${textSizeStyles[size]}
    ${textClassName}
  `;

  return (
    <StyledTouchableOpacity
      className={buttonClass}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#2563eb' : '#ffffff'}
          size="small"
        />
      ) : (
        <StyledView className="flex-row items-center justify-center gap-2">
          {leftIcon && <StyledView>{leftIcon}</StyledView>}
          {children && size !== 'icon' && (
            <StyledText className={textClass}>{children}</StyledText>
          )}
          {size === 'icon' && children}
          {rightIcon && <StyledView>{rightIcon}</StyledView>}
        </StyledView>
      )}
    </StyledTouchableOpacity>
  );
};

export default Button;
