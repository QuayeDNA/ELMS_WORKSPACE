/**
 * ELMS Mobile - Avatar Component
 * User profile image with fallback initials
 */

import React from 'react';
import { View, Text, Image, ImageProps, ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

export interface AvatarProps extends ViewProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square';
  bgColor?: string;
  textColor?: string;
  className?: string;
}

const sizeStyles: Record<
  string,
  { container: string; text: string; dimension: number }
> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', dimension: 24 },
  sm: { container: 'w-8 h-8', text: 'text-sm', dimension: 32 },
  md: { container: 'w-10 h-10', text: 'text-base', dimension: 40 },
  lg: { container: 'w-12 h-12', text: 'text-lg', dimension: 48 },
  xl: { container: 'w-16 h-16', text: 'text-xl', dimension: 64 },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl', dimension: 80 },
};

const variantStyles: Record<string, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
};

// Get initials from name
const getInitials = (name?: string): string => {
  if (!name) return '?';

  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
  );
};

// Generate consistent color from string
const stringToColor = (str: string): string => {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#22c55e', // green
    '#10b981', // emerald
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0284c7', // sky
    '#2563eb', // blue
    '#7c3aed', // violet
    '#a855f7', // purple
    '#ec4899', // pink
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  variant = 'circle',
  bgColor,
  textColor = '#ffffff',
  className = '',
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);
  const initials = getInitials(name);
  const backgroundColor = bgColor || stringToColor(name);

  const containerClass = `
    items-center justify-center overflow-hidden
    ${sizeStyles[size].container}
    ${variantStyles[variant]}
    ${className}
  `;

  // Show initials if no image or image failed to load
  const showInitials = !src || imageError;

  return (
    <StyledView
      className={containerClass}
      style={showInitials ? { backgroundColor } : undefined}
      {...props}
    >
      {showInitials ? (
        <StyledText
          className={`font-semibold ${sizeStyles[size].text}`}
          style={{ color: textColor }}
        >
          {initials}
        </StyledText>
      ) : (
        <StyledImage
          source={{ uri: src }}
          className="w-full h-full"
          onError={() => setImageError(true)}
        />
      )}
    </StyledView>
  );
};

// Avatar Group - display multiple avatars with overlap
export interface AvatarGroupProps extends ViewProps {
  avatars: Array<{ src?: string; name: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  variant = 'circle',
  className = '',
  ...props
}) => {
  const displayedAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  // Overlap offset based on size
  const overlapOffset: Record<string, number> = {
    xs: -8,
    sm: -10,
    md: -12,
    lg: -16,
    xl: -20,
    '2xl': -24,
  };

  return (
    <StyledView className={`flex-row ${className}`} {...props}>
      {displayedAvatars.map((avatar, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? overlapOffset[size] : 0,
            zIndex: displayedAvatars.length - index,
          }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            size={size}
            variant={variant}
            className="border-2 border-white"
          />
        </View>
      ))}

      {remaining > 0 && (
        <StyledView
          className={`
            items-center justify-center bg-neutral-200 border-2 border-white
            ${sizeStyles[size].container}
            ${variantStyles[variant]}
          `}
          style={{
            marginLeft: overlapOffset[size],
            zIndex: 0,
          }}
        >
          <StyledText className={`font-semibold text-neutral-700 ${sizeStyles[size].text}`}>
            +{remaining}
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );
};

export default Avatar;
