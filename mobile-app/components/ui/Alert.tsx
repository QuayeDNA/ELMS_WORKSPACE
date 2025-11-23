/**
 * ELMS Mobile - Alert Component
 * Contextual notification messages with icons
 */

import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

export interface AlertProps extends ViewProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  string,
  { container: string; text: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  info: {
    container: 'bg-info-50 border-info-200',
    text: 'text-info-900',
    icon: 'information-circle',
    iconColor: '#0284c7', // info-600
  },
  success: {
    container: 'bg-success-50 border-success-200',
    text: 'text-success-900',
    icon: 'checkmark-circle',
    iconColor: '#22c55e', // success-500
  },
  warning: {
    container: 'bg-warning-50 border-warning-200',
    text: 'text-warning-900',
    icon: 'warning',
    iconColor: '#f59e0b', // warning-500
  },
  error: {
    container: 'bg-error-50 border-error-200',
    text: 'text-error-900',
    icon: 'close-circle',
    iconColor: '#ef4444', // error-500
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  const config = variantConfig[variant];

  const containerClass = `
    flex-row p-4 rounded-lg border
    ${config.container}
    ${className}
  `;

  return (
    <StyledView className={containerClass} {...props}>
      {/* Icon */}
      <View className="mr-3 pt-0.5">
        <Ionicons name={config.icon} size={20} color={config.iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1">
        {title && (
          <StyledText className={`font-semibold text-base mb-1 ${config.text}`}>
            {title}
          </StyledText>
        )}
        <StyledText className={`text-sm ${config.text}`}>{children}</StyledText>
      </View>

      {/* Dismiss Button */}
      {dismissible && (
        <StyledTouchable
          onPress={onDismiss}
          className="ml-2"
          accessibilityLabel="Dismiss alert"
          accessibilityRole="button"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="close" size={20} color={config.iconColor} />
        </StyledTouchable>
      )}
    </StyledView>
  );
};

export default Alert;
