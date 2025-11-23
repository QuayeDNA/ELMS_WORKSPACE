/**
 * ELMS Mobile - UI Component Library
 * Central export for all UI components
 */

// Design Tokens
export * from './colors';
export * from './typography';
export * from './spacing';

// Base Components
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Card, CardHeader, CardContent, CardFooter } from './Card';
export type { CardProps } from './Card';

export { Typography, Heading, Title, Body, Label } from './Typography';
export type { TypographyProps } from './Typography';

export { Input } from './Input';
export type { InputProps } from './Input';

// Data Display
export { Badge, RoleBadge } from './Badge';
export type { BadgeProps, RoleBadgeProps } from './Badge';

export { Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarGroupProps } from './Avatar';

export { Divider } from './Divider';
export type { DividerProps } from './Divider';

// Feedback
export { Alert } from './Alert';
export type { AlertProps } from './Alert';

export {
  Spinner,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  LoadingOverlay,
} from './Loading';
export type {
  SpinnerProps,
  SkeletonProps,
  SkeletonCardProps,
  SkeletonListProps,
  LoadingOverlayProps,
} from './Loading';

// Navigation
export { ListItem } from './ListItem';
export type { ListItemProps } from './ListItem';

export { FAB } from './FAB';
export type { FABProps } from './FAB';

// Input
export { Chip, ChipGroup } from './Chip';
export type { ChipProps, ChipGroupProps } from './Chip';

// Surfaces
export { Modal, BottomSheet } from './Modal';
export type { ModalProps, BottomSheetProps } from './Modal';

// Layout
export {
  ScreenContainer,
  ScreenHeader,
  Section,
  EmptyState,
} from './ScreenContainer';
export type {
  ScreenContainerProps,
  ScreenHeaderProps,
  SectionProps,
  EmptyStateProps,
} from './ScreenContainer';
