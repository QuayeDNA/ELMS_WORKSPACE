/**
 * ELMS Mobile - Screen Container Component
 * Safe area wrapper with scrolling and pull-to-refresh
 */

import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ViewProps,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';

const StyledSafeArea = styled(SafeAreaView);
const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);

export interface ScreenContainerProps extends ViewProps {
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  showsVerticalScrollIndicator?: boolean;
  contentContainerClassName?: string;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  children?: React.ReactNode;
  className?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  scrollable = true,
  refreshing = false,
  onRefresh,
  showsVerticalScrollIndicator = true,
  contentContainerClassName = '',
  edges = ['top', 'bottom'],
  children,
  className = '',
  ...props
}) => {
  if (scrollable) {
    return (
      <StyledSafeArea className={`flex-1 bg-neutral-50 ${className}`} edges={edges}>
        <StyledScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName={contentContainerClassName}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2563eb" // primary-600
                colors={['#2563eb']}
              />
            ) : undefined
          }
          {...props}
        >
          {children}
        </StyledScrollView>
      </StyledSafeArea>
    );
  }

  return (
    <StyledSafeArea
      className={`flex-1 bg-neutral-50 ${className}`}
      edges={edges}
      {...props}
    >
      {children}
    </StyledSafeArea>
  );
};

// Screen Header - sticky header with title and actions
export interface ScreenHeaderProps extends ViewProps {
  title?: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'large';
  className?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <StyledView
      className={`
        px-4 bg-white border-b border-neutral-100
        ${variant === 'large' ? 'py-6' : 'py-4'}
        ${className}
      `}
      {...props}
    >
      <View className="flex-row items-center justify-between">
        {leftAction && <View className="mr-3">{leftAction}</View>}

        <View className="flex-1">
          {title && (
            <styled.Text
              className={`font-semibold text-neutral-900 ${
                variant === 'large' ? 'text-2xl' : 'text-xl'
              }`}
              numberOfLines={1}
            >
              {title}
            </styled.Text>
          )}
          {subtitle && (
            <styled.Text className="text-sm text-neutral-600 mt-1">
              {subtitle}
            </styled.Text>
          )}
        </View>

        {rightAction && <View className="ml-3">{rightAction}</View>}
      </View>
    </StyledView>
  );
};

// Section - content section with optional header
export interface SectionProps extends ViewProps {
  title?: string;
  titleAction?: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

const spacingStyles: Record<string, string> = {
  none: '',
  sm: 'mb-4',
  md: 'mb-6',
  lg: 'mb-8',
};

export const Section: React.FC<SectionProps> = ({
  title,
  titleAction,
  spacing = 'md',
  children,
  className = '',
  ...props
}) => {
  return (
    <StyledView className={`${spacingStyles[spacing]} ${className}`} {...props}>
      {title && (
        <View className="flex-row items-center justify-between px-4 mb-3">
          <styled.Text className="text-lg font-semibold text-neutral-900">
            {title}
          </styled.Text>
          {titleAction && <View>{titleAction}</View>}
        </View>
      )}
      {children}
    </StyledView>
  );
};

// Empty State - display when no content available
export interface EmptyStateProps extends ViewProps {
  icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => {
  const Ionicons = require('@expo/vector-icons').Ionicons;

  return (
    <StyledView
      className={`flex-1 items-center justify-center px-8 ${className}`}
      {...props}
    >
      {icon && (
        <View className="mb-4">
          <Ionicons name={icon} size={64} color="#d4d4d8" />
        </View>
      )}
      <styled.Text className="text-xl font-semibold text-neutral-900 text-center mb-2">
        {title}
      </styled.Text>
      {description && (
        <styled.Text className="text-base text-neutral-600 text-center mb-6">
          {description}
        </styled.Text>
      )}
      {action && <View>{action}</View>}
    </StyledView>
  );
};

export default ScreenContainer;
