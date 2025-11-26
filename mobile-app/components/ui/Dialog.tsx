import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { Typography } from './Typography';
import { Button } from './Button';

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
}

export interface DialogProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  actions?: DialogAction[];
  dismissible?: boolean;
  variant?: 'default' | 'confirmation';
  style?: ViewStyle;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  onClose,
  title,
  message,
  children,
  actions = [],
  dismissible = true,
  variant = 'default',
  style,
}) => {
  const handleBackdropPress = () => {
    if (dismissible && onClose) {
      onClose();
    }
  };

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
      }}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            onPress={action.onPress}
            disabled={action.disabled}
            style={{ flex: 1 }}
          >
            {action.label}
          </Button>
        ))}
      </View>
    );
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.surface.primary,
              borderRadius: spacing.borderRadius.lg,
              padding: spacing.lg,
              maxWidth: 400,
              width: '100%',
              ...spacing.elevation.xl,
            },
            style,
          ]}
          activeOpacity={1}
          onPress={() => {}} // Prevent backdrop press when tapping dialog
        >
          {/* Close button */}
          {dismissible && onClose && (
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: 'absolute',
                top: spacing.sm,
                right: spacing.sm,
                padding: spacing.xs,
                zIndex: 1,
              }}
              accessibilityLabel="Close dialog"
            >
              <Ionicons name="close" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
          )}

          {/* Title */}
          {title && (
            <View style={{ marginBottom: spacing.md, paddingRight: dismissible ? spacing.xl : 0 }}>
              <Typography variant="headlineSmall" color="primary">
                {title}
              </Typography>
            </View>
          )}

          {/* Content */}
          <View style={{ marginBottom: spacing.md }}>
            {message && (
              <Typography variant="bodyMedium" color="secondary">
                {message}
              </Typography>
            )}
            {children}
          </View>

          {/* Actions */}
          {renderActions()}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

// Convenience component for confirmation dialogs
export interface ConfirmDialogProps extends Omit<DialogProps, 'actions'> {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'default',
  ...props
}) => {
  const actions: DialogAction[] = [
    {
      label: cancelLabel,
      onPress: onCancel || (() => {}),
      variant: 'outline',
    },
    {
      label: confirmLabel,
      onPress: onConfirm,
      variant: confirmVariant,
    },
  ];

  return (
    <Dialog
      {...props}
      actions={actions}
      variant="confirmation"
    />
  );
};
