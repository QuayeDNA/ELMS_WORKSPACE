import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';
import { Typography } from './Typography';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: ViewStyle;
  className?: string;
}

const getVariantStyles = (variant: AlertVariant = 'info') => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: colors.success[50],
        borderColor: colors.success[200],
        iconName: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
        iconColor: colors.success[600],
      };
    case 'warning':
      return {
        backgroundColor: colors.warning[50],
        borderColor: colors.warning[200],
        iconName: 'warning' as keyof typeof Ionicons.glyphMap,
        iconColor: colors.warning[600],
      };
    case 'error':
      return {
        backgroundColor: colors.error[50],
        borderColor: colors.error[200],
        iconName: 'close-circle' as keyof typeof Ionicons.glyphMap,
        iconColor: colors.error[600],
      };
    default:
      return {
        backgroundColor: colors.info[50],
        borderColor: colors.info[200],
        iconName: 'information-circle' as keyof typeof Ionicons.glyphMap,
        iconColor: colors.info[600],
      };
  }
};

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  style,
  className,
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: 1,
          borderRadius: spacing.borderRadius.md,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        style,
      ]}
    >
      <Ionicons
        name={variantStyles.iconName}
        size={20}
        color={variantStyles.iconColor}
        style={{ marginRight: spacing.sm, marginTop: 2 }}
      />

      <View style={{ flex: 1 }}>
        {title && (
          <Typography
            variant="labelLarge"
            color="primary"
            style={{ marginBottom: spacing.xs, fontWeight: '600' }}
          >
            {title}
          </Typography>
        )}

        <Typography variant="bodyMedium" color="primary">
          {children}
        </Typography>
      </View>

      {dismissible && onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={{ marginLeft: spacing.sm, padding: spacing.xs }}
        >
          <Ionicons
            name="close"
            size={20}
            color={colors.neutral[500]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
