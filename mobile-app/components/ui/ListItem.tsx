/**
 * ELMS Mobile - List Item Component
 * Touchable row for scrollable lists
 */

import React from 'react';
import { View, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

export interface ListItemProps extends TouchableOpacityProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor = '#64748b', // neutral-500
  rightIcon,
  rightElement,
  showChevron = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const containerClass = `
    flex-row items-center px-4
    ${variant === 'default' ? 'py-4' : 'py-3'}
    border-b border-neutral-100 bg-white
    active:bg-neutral-50
    ${className}
  `;

  return (
    <StyledTouchable
      className={containerClass}
      activeOpacity={0.7}
      accessibilityRole="button"
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && (
        <View className="mr-3">
          <Ionicons
            name={leftIcon}
            size={variant === 'default' ? 24 : 20}
            color={leftIconColor}
          />
        </View>
      )}

      {/* Content */}
      <View className="flex-1">
        <StyledText
          className={`font-medium text-neutral-900 ${
            variant === 'default' ? 'text-base' : 'text-sm'
          }`}
          numberOfLines={1}
        >
          {title}
        </StyledText>

        {subtitle && (
          <StyledText
            className={`text-neutral-600 mt-0.5 ${
              variant === 'default' ? 'text-sm' : 'text-xs'
            }`}
            numberOfLines={1}
          >
            {subtitle}
          </StyledText>
        )}

        {description && (
          <StyledText
            className="text-xs text-neutral-500 mt-1"
            numberOfLines={2}
          >
            {description}
          </StyledText>
        )}
      </View>

      {/* Right Element or Icon */}
      {rightElement ? (
        <View className="ml-3">{rightElement}</View>
      ) : rightIcon ? (
        <View className="ml-3">
          <Ionicons name={rightIcon} size={20} color="#9ca3af" />
        </View>
      ) : showChevron ? (
        <View className="ml-3">
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      ) : null}
    </StyledTouchable>
  );
};

export default ListItem;
