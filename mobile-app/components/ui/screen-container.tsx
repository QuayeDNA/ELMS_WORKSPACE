import React from 'react';
import { SafeAreaView, ScrollView, RefreshControl, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { Typography } from './Typography';
import { Button } from './Button';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
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
}) => {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
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
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: colors.surface.primary,
        },
        style,
      ]}
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
  const paddingVertical = variant === 'compact' ? spacing.sm : spacing.md;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral[100],
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        {leftAction}
      </View>

      <View style={{ flex: 2, alignItems: 'center' }}>
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

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
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
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
  };

  const marginBottom = spacingMap[sectionSpacing];

  return (
    <View style={[{ marginBottom }, style]}>
      {(title || titleAction) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
            paddingHorizontal: spacing.lg,
          }}
        >
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

      <View style={{ paddingHorizontal: spacing.lg }}>
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
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
        },
        style,
      ]}
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
