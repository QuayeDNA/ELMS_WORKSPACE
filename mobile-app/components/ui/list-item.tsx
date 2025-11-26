import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';
import { Typography } from './Typography';

export type ListItemVariant = 'default' | 'compact';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  variant?: ListItemVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
}

const getVariantStyles = (variant: ListItemVariant = 'default') => {
  switch (variant) {
    case 'compact':
      return {
        paddingVertical: spacing.sm,
        minHeight: 48,
      };
    default:
      return {
        paddingVertical: spacing.md,
        minHeight: 56,
      };
  }
};

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor = colors.neutral[500],
  rightIcon,
  rightElement,
  showChevron = false,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  className,
}) => {
  const variantStyles = getVariantStyles(variant);
  const isTouchable = !!onPress && !disabled;

  const content = (
    <View
      className={className}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          ...variantStyles,
        },
        style,
      ]}
    >
      {leftIcon && (
        <View style={{ marginRight: spacing.md }}>
          <Ionicons
            name={leftIcon}
            size={24}
            color={leftIconColor}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Typography variant="bodyMedium" color="primary" numberOfLines={1}>
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="bodySmall"
            color="secondary"
            numberOfLines={1}
            style={{ marginTop: 2 }}
          >
            {subtitle}
          </Typography>
        )}

        {description && (
          <Typography
            variant="bodySmall"
            color="tertiary"
            numberOfLines={2}
            style={{ marginTop: 2 }}
          >
            {description}
          </Typography>
        )}
      </View>

      {rightElement && (
        <View style={{ marginLeft: spacing.md }}>
          {rightElement}
        </View>
      )}

      {rightIcon && !rightElement && (
        <View style={{ marginLeft: spacing.md }}>
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.neutral[500]}
          />
        </View>
      )}

      {showChevron && !rightIcon && !rightElement && (
        <View style={{ marginLeft: spacing.md }}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.neutral[400]}
          />
        </View>
      )}
    </View>
  );

  if (isTouchable) {
    return (
      <TouchableOpacity
        className={className}
        onPress={onPress}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};
