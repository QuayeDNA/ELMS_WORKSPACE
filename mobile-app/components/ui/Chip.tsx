import React from 'react';
import { TouchableOpacity, View, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';

export type ChipVariant = 'default' | 'outlined' | 'filled';
export type ChipColor = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type ChipSize = 'sm' | 'md';

export interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: ChipSize;
  selected?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onDelete?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export interface ChipGroupProps {
  chips: Array<{ id: string; label: string; selected?: boolean }>;
  selectedIds?: string[];
  onSelect?: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
}

const getColorStyles = (color: ChipColor = 'primary', variant: ChipVariant = 'default', selected = false) => {
  const colorMap = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    neutral: colors.neutral,
  };

  const themeColor = colorMap[color];

  switch (variant) {
    case 'filled':
      return {
        backgroundColor: selected ? themeColor[600] : themeColor[100],
        borderColor: selected ? themeColor[600] : themeColor[200],
        textColor: selected ? colors.neutral[50] : themeColor[800],
        iconColor: selected ? colors.neutral[50] : themeColor[600],
      };
    case 'outlined':
      return {
        backgroundColor: selected ? themeColor[50] : 'transparent',
        borderColor: selected ? themeColor[300] : colors.neutral[300],
        textColor: selected ? themeColor[800] : colors.text.primary,
        iconColor: selected ? themeColor[600] : colors.neutral[500],
      };
    default:
      return {
        backgroundColor: selected ? colors.primary[100] : colors.neutral[100],
        borderColor: selected ? colors.primary[200] : colors.neutral[200],
        textColor: selected ? colors.primary[800] : colors.neutral[700],
        iconColor: selected ? colors.primary[600] : colors.neutral[500],
      };
  }
};

const getSizeStyles = (size: ChipSize = 'md') => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: spacing.xs,
        paddingVertical: 4,
        borderRadius: spacing.borderRadius.sm,
        minHeight: 28,
        iconSize: 16,
      };
    default:
      return {
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: spacing.borderRadius.md,
        minHeight: 32,
        iconSize: 18,
      };
  }
};

const getTextVariant = (size: ChipSize = 'md') => {
  return size === 'sm' ? 'labelSmall' : 'labelMedium';
};

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  color = 'primary',
  size = 'md',
  selected = false,
  leftIcon,
  rightIcon,
  onDelete,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const colorStyles = getColorStyles(color, variant, selected);
  const sizeStyles = getSizeStyles(size);
  const textVariant = getTextVariant(size);
  const isTouchable = !!onPress || !!onDelete;
  const isDisabled = disabled;

  const content = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colorStyles.backgroundColor,
          borderColor: colorStyles.borderColor,
          borderWidth: 1,
          borderRadius: sizeStyles.borderRadius,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          minHeight: sizeStyles.minHeight,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={sizeStyles.iconSize}
          color={colorStyles.iconColor}
          style={{ marginRight: spacing.xs }}
        />
      )}

      <Text
        style={[
          {
            color: colorStyles.textColor,
            fontSize: typography[textVariant].fontSize,
            fontWeight: typography[textVariant].fontWeight,
            lineHeight: typography[textVariant].lineHeight,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>

      {rightIcon && !onDelete && (
        <Ionicons
          name={rightIcon}
          size={sizeStyles.iconSize}
          color={colorStyles.iconColor}
          style={{ marginLeft: spacing.xs }}
        />
      )}

      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={{ marginLeft: spacing.xs, padding: 2 }}
          disabled={isDisabled}
        >
          <Ionicons
            name="close-circle"
            size={sizeStyles.iconSize}
            color={colorStyles.iconColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isTouchable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, selected }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selectedIds = [],
  onSelect,
  multiSelect = false,
  style,
}) => {
  const handleChipPress = (chipId: string) => {
    if (!onSelect) return;

    if (multiSelect) {
      const isSelected = selectedIds.includes(chipId);
      const newSelectedIds = isSelected
        ? selectedIds.filter(id => id !== chipId)
        : [...selectedIds, chipId];
      onSelect(newSelectedIds);
    } else {
      onSelect(selectedIds.includes(chipId) ? [] : [chipId]);
    }
  };

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, style]}>
      {chips.map(chip => (
        <Chip
          key={chip.id}
          label={chip.label}
          selected={selectedIds.includes(chip.id)}
          onPress={() => handleChipPress(chip.id)}
        />
      ))}
    </View>
  );
};
