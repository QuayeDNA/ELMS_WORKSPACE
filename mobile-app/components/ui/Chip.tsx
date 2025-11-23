/**
 * ELMS Mobile - Chip Component
 * Small labeled buttons for filters and tags
 */

import React from 'react';
import { TouchableOpacity, Text, View, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);
const StyledView = styled(View);

export interface ChipProps extends TouchableOpacityProps {
  label: string;
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  selected?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onDelete?: () => void;
  className?: string;
}

const variantStyles: Record<
  string,
  Record<string, { container: string; text: string; iconColor: string }>
> = {
  default: {
    primary: {
      container: 'bg-primary-100',
      text: 'text-primary-700',
      iconColor: '#2563eb',
    },
    success: {
      container: 'bg-success-100',
      text: 'text-success-700',
      iconColor: '#22c55e',
    },
    warning: {
      container: 'bg-warning-100',
      text: 'text-warning-700',
      iconColor: '#f59e0b',
    },
    error: {
      container: 'bg-error-100',
      text: 'text-error-700',
      iconColor: '#ef4444',
    },
    neutral: {
      container: 'bg-neutral-100',
      text: 'text-neutral-700',
      iconColor: '#64748b',
    },
  },
  outlined: {
    primary: {
      container: 'bg-transparent border border-primary-300',
      text: 'text-primary-700',
      iconColor: '#2563eb',
    },
    success: {
      container: 'bg-transparent border border-success-300',
      text: 'text-success-700',
      iconColor: '#22c55e',
    },
    warning: {
      container: 'bg-transparent border border-warning-300',
      text: 'text-warning-700',
      iconColor: '#f59e0b',
    },
    error: {
      container: 'bg-transparent border border-error-300',
      text: 'text-error-700',
      iconColor: '#ef4444',
    },
    neutral: {
      container: 'bg-transparent border border-neutral-300',
      text: 'text-neutral-700',
      iconColor: '#64748b',
    },
  },
  filled: {
    primary: {
      container: 'bg-primary-600',
      text: 'text-white',
      iconColor: '#ffffff',
    },
    success: {
      container: 'bg-success-500',
      text: 'text-white',
      iconColor: '#ffffff',
    },
    warning: {
      container: 'bg-warning-500',
      text: 'text-white',
      iconColor: '#ffffff',
    },
    error: {
      container: 'bg-error-500',
      text: 'text-white',
      iconColor: '#ffffff',
    },
    neutral: {
      container: 'bg-neutral-600',
      text: 'text-white',
      iconColor: '#ffffff',
    },
  },
};

const sizeStyles: Record<string, { container: string; text: string; iconSize: number }> = {
  sm: {
    container: 'px-2 py-1 rounded-full',
    text: 'text-xs',
    iconSize: 14,
  },
  md: {
    container: 'px-3 py-1.5 rounded-full',
    text: 'text-sm',
    iconSize: 16,
  },
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
  disabled = false,
  className = '',
  ...props
}) => {
  const styles = variantStyles[variant][color];
  const selectedVariant = selected && variant !== 'filled' ? 'filled' : variant;
  const selectedStyles = variantStyles[selectedVariant][color];

  const containerClass = `
    flex-row items-center
    ${selectedStyles.container}
    ${sizeStyles[size].container}
    ${disabled ? 'opacity-50' : ''}
    ${className}
  `;

  const textClass = `
    font-medium
    ${selectedStyles.text}
    ${sizeStyles[size].text}
  `;

  const iconColor = selectedStyles.iconColor;

  return (
    <StyledTouchable
      className={containerClass}
      activeOpacity={0.7}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && (
        <View className="mr-1">
          <Ionicons name={leftIcon} size={sizeStyles[size].iconSize} color={iconColor} />
        </View>
      )}

      {/* Label */}
      <StyledText className={textClass}>{label}</StyledText>

      {/* Right Icon or Delete Button */}
      {onDelete ? (
        <TouchableOpacity
          onPress={onDelete}
          disabled={disabled}
          className="ml-1"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityLabel="Delete"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={sizeStyles[size].iconSize} color={iconColor} />
        </TouchableOpacity>
      ) : rightIcon ? (
        <View className="ml-1">
          <Ionicons name={rightIcon} size={sizeStyles[size].iconSize} color={iconColor} />
        </View>
      ) : null}
    </StyledTouchable>
  );
};

// ChipGroup - Multiple chips with selection
export interface ChipGroupProps {
  chips: Array<{ id: string; label: string }>;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  multiSelect?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  chips,
  selectedIds = [],
  onSelect,
  multiSelect = false,
  variant = 'default',
  color = 'primary',
  size = 'md',
  className = '',
}) => {
  return (
    <StyledView className={`flex-row flex-wrap gap-2 ${className}`}>
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          label={chip.label}
          variant={variant}
          color={color}
          size={size}
          selected={selectedIds.includes(chip.id)}
          onPress={() => onSelect?.(chip.id)}
        />
      ))}
    </StyledView>
  );
};

export default Chip;
