import React from 'react';
import { ScrollView, RefreshControl, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';
import { Typography } from './Typography';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'compact';
  style?: ViewStyle;
}

export interface SectionProps {
  title?: string;
  titleAction?: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  style,
  className,
  edges = ['top', 'bottom', 'left', 'right'],
}) => {
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: edges.includes('top') ? 0 : insets.top,
        paddingBottom: edges.includes('bottom') ? 0 : insets.bottom,
        paddingLeft: edges.includes('left') ? 0 : insets.left,
        paddingRight: edges.includes('right') ? 0 : insets.right,
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{
      flex: 1,
      paddingTop: edges.includes('top') ? 0 : insets.top,
      paddingBottom: edges.includes('bottom') ? 0 : insets.bottom,
      paddingLeft: edges.includes('left') ? 0 : insets.left,
      paddingRight: edges.includes('right') ? 0 : insets.right,
    }}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      className={`flex-1 bg-surface-primary ${className || ''}`}
      style={[
        style,
      ]}
      edges={edges}
    >
      {content}
    </SafeAreaView>
  );
};

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
  style,
}) => {
  const paddingClasses = variant === 'compact' ? 'py-2' : 'py-4';

  return (
    <View
      className={`flex-row items-center justify-between px-6 ${paddingClasses} border-b border-neutral-100`}
      style={style}
    >
      <View className="flex-1">
        {leftAction}
      </View>

      <View className="flex-2 items-center">
        {title && (
          <Typography
            variant={variant === 'compact' ? 'titleMedium' : 'headlineSmall'}
            color="primary"
            style={{ textAlign: 'center' }}
          >
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography
            variant="bodySmall"
            color="secondary"
            style={{ textAlign: 'center', marginTop: 2 }}
          >
            {subtitle}
          </Typography>
        )}
      </View>

      <View className="flex-1 items-end">
        {rightAction}
      </View>
    </View>
  );
};

export const Section: React.FC<SectionProps> = ({
  title,
  titleAction,
  spacing: sectionSpacing = 'md',
  children,
  style,
}) => {
  const spacingMap = {
    xs: 'mb-1',
    sm: 'mb-2',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
  };

  const marginClass = spacingMap[sectionSpacing];

  return (
    <View className={marginClass} style={style}>
      {(title || titleAction) && (
        <View className="flex-row items-center justify-between mb-4 px-6">
          {title && (
            <Typography variant="titleMedium" color="primary">
              {title}
            </Typography>
          )}
          {titleAction && (
            <View>
              {titleAction}
            </View>
          )}
        </View>
      )}

      <View className="px-6">
        {children}
      </View>
    </View>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-text-outline',
  title,
  description,
  action,
  style,
}) => {
  return (
    <View
      className="flex-1 justify-center items-center p-8"
      style={style}
    >
      <Ionicons
        name={icon}
        size={64}
        color={colors.neutral[400]}
        style={{ marginBottom: spacing.lg }}
      />

      <Typography
        variant="headlineSmall"
        color="primary"
        style={{ textAlign: 'center', marginBottom: spacing.sm }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="bodyMedium"
          color="secondary"
          style={{ textAlign: 'center', marginBottom: spacing.lg }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <View>
          {action}
        </View>
      )}
    </View>
  );
};
