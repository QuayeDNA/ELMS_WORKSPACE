/**
 * ELMS Mobile - Badge Component
 * Status and role indicators
 */

import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export interface BadgeProps extends ViewProps {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, { container: string; text: string }> = {
  default: {
    container: 'bg-primary-100',
    text: 'text-primary-700',
  },
  success: {
    container: 'bg-success-100',
    text: 'text-success-700',
  },
  warning: {
    container: 'bg-warning-100',
    text: 'text-warning-700',
  },
  error: {
    container: 'bg-error-100',
    text: 'text-error-700',
  },
  info: {
    container: 'bg-info-100',
    text: 'text-info-700',
  },
  outline: {
    container: 'bg-transparent border border-neutral-300',
    text: 'text-neutral-700',
  },
};

const sizeStyles: Record<string, { container: string; text: string }> = {
  sm: {
    container: 'px-2 py-0.5 rounded',
    text: 'text-xs',
  },
  md: {
    container: 'px-2.5 py-1 rounded-md',
    text: 'text-sm',
  },
  lg: {
    container: 'px-3 py-1.5 rounded-lg',
    text: 'text-base',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const containerClass = `
    inline-flex items-center justify-center
    ${variantStyles[variant].container}
    ${sizeStyles[size].container}
    ${className}
  `;

  const textClass = `
    font-medium
    ${variantStyles[variant].text}
    ${sizeStyles[size].text}
  `;

  return (
    <StyledView className={containerClass} {...props}>
      <StyledText className={textClass}>{children}</StyledText>
    </StyledView>
  );
};

// Role-specific badge
export interface RoleBadgeProps extends Omit<BadgeProps, 'variant'> {
  role:
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'HOD'
    | 'LECTURER'
    | 'EXAMS_OFFICER'
    | 'INVIGILATOR'
    | 'STUDENT';
}

const roleColors: Record<string, { container: string; text: string }> = {
  SUPER_ADMIN: { container: 'bg-red-100', text: 'text-red-700' },
  ADMIN: { container: 'bg-orange-100', text: 'text-orange-700' },
  HOD: { container: 'bg-blue-100', text: 'text-blue-700' },
  LECTURER: { container: 'bg-violet-100', text: 'text-violet-700' },
  EXAMS_OFFICER: { container: 'bg-emerald-100', text: 'text-emerald-700' },
  INVIGILATOR: { container: 'bg-cyan-100', text: 'text-cyan-700' },
  STUDENT: { container: 'bg-slate-100', text: 'text-slate-700' },
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  HOD: 'HOD',
  LECTURER: 'Lecturer',
  EXAMS_OFFICER: 'Exams Officer',
  INVIGILATOR: 'Invigilator',
  STUDENT: 'Student',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className = '',
  ...props
}) => {
  const colors = roleColors[role];
  const containerClass = `
    inline-flex items-center justify-center
    ${colors.container}
    ${sizeStyles[size].container}
    ${className}
  `;

  const textClass = `
    font-medium
    ${colors.text}
    ${sizeStyles[size].text}
  `;

  return (
    <StyledView className={containerClass} {...props}>
      <StyledText className={textClass}>{roleLabels[role]}</StyledText>
    </StyledView>
  );
};

export default Badge;
