import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';
import { Typography } from './Typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  inputStyle,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const showPasswordToggle = secureTextEntry;
  const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

  const borderColor = hasError ? colors.error[500] : colors.neutral[300];
  const backgroundColor = colors.surface.primary;

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Typography
          variant="labelMedium"
          color={hasError ? 'error' : 'primary'}
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Typography>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor,
          borderRadius: spacing.borderRadius.md,
          backgroundColor,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          minHeight: 48,
        }}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={hasError ? colors.error[500] : colors.neutral[500]}
            style={{ marginRight: spacing.sm }}
          />
        )}

        <TextInput
          {...textInputProps}
          secureTextEntry={actualSecureTextEntry}
          style={[
            {
              flex: 1,
              fontSize: typography.bodyMedium.fontSize,
              lineHeight: typography.bodyMedium.lineHeight,
              color: colors.text.primary,
              paddingVertical: 0, // Remove default padding
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.text.tertiary}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{ marginLeft: spacing.sm }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.neutral[500]}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={hasError ? colors.error[500] : colors.neutral[500]}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>

      {(error || helperText) && (
        <Typography
          variant="bodySmall"
          color={hasError ? 'error' : 'secondary'}
          style={{ marginTop: spacing.xs }}
        >
          {error || helperText}
        </Typography>
      )}
    </View>
  );
};
