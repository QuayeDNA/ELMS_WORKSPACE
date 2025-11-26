import React from 'react';
import { View, Image, Text, ImageStyle, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarVariant = 'circle' | 'square';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  style?: ImageStyle;
}

export interface AvatarGroupProps {
  avatars: Array<{ name?: string; src?: string | null }>;
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}

const getSizeStyles = (size: AvatarSize = 'md') => {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    '2xl': 64,
  };

  const dimension = sizes[size];
  return {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };
};

const getInitials = (name?: string) => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getTextSize = (size: AvatarSize = 'md') => {
  const sizes = {
    xs: typography.labelSmall.fontSize,
    sm: typography.labelSmall.fontSize,
    md: typography.labelMedium.fontSize,
    lg: typography.labelLarge.fontSize,
    xl: typography.titleSmall.fontSize,
    '2xl': typography.titleMedium.fontSize,
  };

  return sizes[size];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  variant = 'circle',
  style,
}) => {
  const sizeStyles = getSizeStyles(size);
  const textSize = getTextSize(size);

  const borderRadius = variant === 'square' ? spacing.borderRadius.md : sizeStyles.borderRadius;

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={[
          {
            ...sizeStyles,
            borderRadius,
            backgroundColor: colors.neutral[200],
          },
          style,
        ]}
        accessibilityLabel={`Avatar of ${name || 'user'}`}
      />
    );
  }

  return (
    <View
      style={[
        {
          ...sizeStyles,
          borderRadius,
          backgroundColor: colors.primary[100],
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      accessibilityLabel={`Avatar with initials ${getInitials(name)}`}
    >
      <Text
        style={{
          color: colors.primary[700],
          fontSize: textSize,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 3,
  size = 'md',
  style,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {visibleAvatars.map((avatar, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? -8 : 0, // Overlap effect
            zIndex: max - index, // Stack order
          }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
          />
        </View>
      ))}

      {remainingCount > 0 && (
        <View
          style={{
            marginLeft: -8,
            zIndex: 0,
            width: getSizeStyles(size).width,
            height: getSizeStyles(size).height,
            borderRadius: getSizeStyles(size).borderRadius,
            backgroundColor: colors.neutral[300],
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.surface.primary,
          }}
        >
          <Text
            style={{
              color: colors.neutral[700],
              fontSize: getTextSize(size),
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};
