import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'HOD' | 'LECTURER' | 'INVIGILATOR' | 'STUDENT';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export interface RoleBadgeProps {
  role: UserRole;
  size?: BadgeSize;
  style?: ViewStyle;
}

const getVariantStyles = (variant: BadgeVariant = 'default') => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: colors.success[100],
        borderColor: colors.success[200],
        textColor: colors.success[800],
      };
    case 'warning':
      return {
        backgroundColor: colors.warning[100],
        borderColor: colors.warning[200],
        textColor: colors.warning[800],
      };
    case 'error':
      return {
        backgroundColor: colors.error[100],
        borderColor: colors.error[200],
        textColor: colors.error[800],
      };
    case 'info':
      return {
        backgroundColor: colors.info[100],
        borderColor: colors.info[200],
        textColor: colors.info[800],
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.neutral[300],
        textColor: colors.text.primary,
      };
    default:
      return {
        backgroundColor: colors.neutral[100],
        borderColor: colors.neutral[200],
        textColor: colors.neutral[800],
      };
  }
};

const getSizeStyles = (size: BadgeSize = 'md') => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: spacing.borderRadius.sm,
        minHeight: 20,
      };
    case 'lg':
      return {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: spacing.borderRadius.md,
        minHeight: 28,
      };
    default:
      return {
        paddingHorizontal: spacing.xs,
        paddingVertical: 3,
        borderRadius: spacing.borderRadius.sm,
        minHeight: 24,
      };
  }
};

const getTextVariant = (size: BadgeSize = 'md') => {
  switch (size) {
    case 'sm':
      return 'labelSmall';
    case 'lg':
      return 'labelMedium';
    default:
      return 'labelSmall';
  }
};

const getRoleStyles = (role: UserRole) => {
  const roleColors = {
    SUPER_ADMIN: colors.roles.superAdmin,
    ADMIN: colors.roles.admin,
    HOD: colors.roles.hod,
    LECTURER: colors.roles.lecturer,
    INVIGILATOR: colors.roles.invigilator,
    STUDENT: colors.roles.student,
  };

  const color = roleColors[role];
  return {
    backgroundColor: `${color}20`, // 20% opacity
    borderColor: color,
    textColor: color,
  };
};

const getRoleLabel = (role: UserRole) => {
  const labels = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    HOD: 'HOD',
    LECTURER: 'Lecturer',
    INVIGILATOR: 'Invigilator',
    STUDENT: 'Student',
  };
  return labels[role];
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const textVariant = getTextVariant(size);

  return (
    <View
      style={[
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: 1,
          alignSelf: 'flex-start',
          ...sizeStyles,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: variantStyles.textColor,
            fontSize: typography[textVariant].fontSize,
            fontWeight: typography[textVariant].fontWeight,
            lineHeight: typography[textVariant].lineHeight,
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', style }) => {
  const roleStyles = getRoleStyles(role);
  const sizeStyles = getSizeStyles(size);
  const textVariant = getTextVariant(size);
  const label = getRoleLabel(role);

  return (
    <View
      style={[
        {
          backgroundColor: roleStyles.backgroundColor,
          borderColor: roleStyles.borderColor,
          borderWidth: 1,
          alignSelf: 'flex-start',
          ...sizeStyles,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: roleStyles.textColor,
          fontSize: typography[textVariant].fontSize,
          fontWeight: typography[textVariant].fontWeight,
          lineHeight: typography[textVariant].lineHeight,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
};
