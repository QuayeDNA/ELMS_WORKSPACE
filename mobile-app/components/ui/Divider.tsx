import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed';
export type DividerThickness = 'thin' | 'medium' | 'thick';
export type DividerLabelPosition = 'left' | 'center' | 'right';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  label?: string;
  labelPosition?: DividerLabelPosition;
  style?: ViewStyle;
}

const getThicknessStyles = (thickness: DividerThickness = 'medium') => {
  const thicknesses = {
    thin: 1,
    medium: 1,
    thick: 2,
  };

  return {
    height: thicknesses[thickness],
    borderWidth: thicknesses[thickness],
  };
};

const getBorderStyle = (variant: DividerVariant = 'solid', orientation: DividerOrientation = 'horizontal') => {
  const color = colors.neutral[200];

  if (variant === 'dashed') {
    return {
      borderStyle: 'dashed' as const,
      borderColor: color,
      borderWidth: 1,
    };
  }

  if (orientation === 'vertical') {
    return {
      borderLeftWidth: 1,
      borderLeftColor: color,
    };
  }

  return {
    borderTopWidth: 1,
    borderTopColor: color,
  };
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'medium',
  label,
  labelPosition = 'center',
  style,
}) => {
  const thicknessStyles = getThicknessStyles(thickness);
  const borderStyle = getBorderStyle(variant, orientation);

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          {
            width: thicknessStyles.borderWidth,
            alignSelf: 'stretch',
            ...borderStyle,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    const labelContainerStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      width: '100%' as const,
    };

    const lineStyle = {
      flex: labelPosition === 'center' ? 1 : 0.5,
      ...borderStyle,
    };

    return (
      <View style={[labelContainerStyle, style]}>
        {labelPosition !== 'left' && <View style={lineStyle} />}

        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.labelSmall.fontSize,
            fontWeight: typography.labelSmall.fontWeight,
            lineHeight: typography.labelSmall.lineHeight,
            paddingHorizontal: spacing.sm,
            backgroundColor: colors.surface.primary,
          }}
        >
          {label}
        </Text>

        {labelPosition !== 'right' && <View style={lineStyle} />}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: '100%',
          ...borderStyle,
        },
        style,
      ]}
    />
  );
};
