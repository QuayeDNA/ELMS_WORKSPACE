/**
 * ELMS Mobile - Divider Component
 * Horizontal/vertical separators with optional text
 */

import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: string;
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
}

const thicknessStyles: Record<string, { horizontal: string; vertical: string }> = {
  thin: { horizontal: 'h-px', vertical: 'w-px' },
  medium: { horizontal: 'h-0.5', vertical: 'w-0.5' },
  thick: { horizontal: 'h-1', vertical: 'w-1' },
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  color = '#e5e7eb', // neutral-200
  label,
  labelPosition = 'center',
  className = '',
  style,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  // If there's a label, render with text
  if (label && isHorizontal) {
    const justifyContent =
      labelPosition === 'left'
        ? 'justify-start'
        : labelPosition === 'right'
        ? 'justify-end'
        : 'justify-center';

    return (
      <StyledView
        className={`flex-row items-center my-4 ${justifyContent} ${className}`}
        {...props}
      >
        {labelPosition !== 'left' && (
          <StyledView
            className={`flex-1 ${thicknessStyles[thickness].horizontal}`}
            style={[
              { backgroundColor: color },
              variant === 'dashed' && {
                borderStyle: 'dashed',
                borderTopWidth: 1,
                borderColor: color,
                height: 0,
              },
              style,
            ]}
          />
        )}

        <StyledText className="px-3 text-sm text-neutral-500">{label}</StyledText>

        {labelPosition !== 'right' && (
          <StyledView
            className={`flex-1 ${thicknessStyles[thickness].horizontal}`}
            style={[
              { backgroundColor: color },
              variant === 'dashed' && {
                borderStyle: 'dashed',
                borderTopWidth: 1,
                borderColor: color,
                height: 0,
              },
              style,
            ]}
          />
        )}
      </StyledView>
    );
  }

  // Simple divider without label
  const dimensionClass = isHorizontal
    ? `${thicknessStyles[thickness].horizontal} w-full`
    : `${thicknessStyles[thickness].vertical} h-full`;

  return (
    <StyledView
      className={`${dimensionClass} ${className}`}
      style={[
        { backgroundColor: color },
        variant === 'dashed' &&
          (isHorizontal
            ? {
                borderStyle: 'dashed',
                borderTopWidth: 1,
                borderColor: color,
                height: 0,
              }
            : {
                borderStyle: 'dashed',
                borderLeftWidth: 1,
                borderColor: color,
                width: 0,
              }),
        style,
      ]}
      {...props}
    />
  );
};

export default Divider;
