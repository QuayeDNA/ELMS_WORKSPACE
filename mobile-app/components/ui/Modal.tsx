import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, ScrollView, ViewStyle, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { Typography } from './Typography';
import { Button } from './Button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';
export type BottomSheetSnapPoint = '25%' | '50%' | '75%' | '90%';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  scrollable?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  snapPoint?: BottomSheetSnapPoint;
  scrollable?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

const { height: screenHeight } = Dimensions.get('window');

const getModalSizeStyles = (size: ModalSize = 'md') => {
  const maxWidth = 600; // Max width for larger screens

  switch (size) {
    case 'sm':
      return {
        maxWidth: 400,
        padding: spacing.lg,
      };
    case 'lg':
      return {
        maxWidth,
        padding: spacing.xl,
      };
    case 'full':
      return {
        maxWidth,
        padding: spacing.xl,
      };
    default:
      return {
        maxWidth: 500,
        padding: spacing.lg,
      };
  }
};

const getSnapPointHeight = (snapPoint: BottomSheetSnapPoint = '50%') => {
  const percentage = parseInt(snapPoint.replace('%', '')) / 100;
  return screenHeight * percentage;
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  size = 'md',
  scrollable = false,
  footer,
  children,
  style,
}) => {
  const sizeStyles = getModalSizeStyles(size);

  const content = (
    <View
      style={{
        backgroundColor: colors.surface.primary,
        borderRadius: spacing.borderRadius.lg,
        margin: spacing.md,
        maxHeight: '90%',
        ...sizeStyles,
        ...spacing.elevation.xl,
      }}
    >
      {/* Header */}
      {/* Header */}
      {(title || subtitle) && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <View style={{ flex: 1 }}>
              {title && (
                <Typography variant="headlineSmall" color="primary">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="bodyMedium" color="secondary" style={{ marginTop: 2 }}>
                  {subtitle}
                </Typography>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{ padding: spacing.xs }}
              accessibilityLabel="Close modal"
            >
              <Ionicons name="close" size={24} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: footer ? spacing.lg : 0 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingBottom: footer ? spacing.lg : 0 }}>
          {children}
        </View>
      )}

      {/* Footer */}
      {footer && (
        <View style={{ marginTop: spacing.lg }}>
          {footer}
        </View>
      )}
    </View>
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {content}
      </View>
    </RNModal>
  );
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  snapPoint = '50%',
  scrollable = true,
  footer,
  children,
  style,
}) => {
  const snapHeight = getSnapPointHeight(snapPoint);

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: snapHeight,
        backgroundColor: colors.surface.primary,
        borderTopLeftRadius: spacing.borderRadius.lg,
        borderTopRightRadius: spacing.borderRadius.lg,
        ...spacing.elevation.xl,
      }}
    >
      {/* Handle */}
      <View style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: colors.neutral[300],
            borderRadius: 2,
          }}
        />
      </View>

      {/* Header */}
      {(title || subtitle) && (
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              {title && (
                <Typography variant="headlineSmall" color="primary">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="bodyMedium" color="secondary" style={{ marginTop: 2 }}>
                  {subtitle}
                </Typography>
              )}
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{ padding: spacing.xs }}
              accessibilityLabel="Close bottom sheet"
            >
              <Ionicons name="close" size={24} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={{ paddingBottom: footer ? spacing.lg : spacing.lg }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingBottom: footer ? spacing.lg : spacing.lg }}>
            {children}
          </View>
        )}
      </View>

      {/* Footer */}
      {footer && (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
          {footer}
        </View>
      )}
    </View>
  );
};
