/**
 * ELMS Mobile - Modal Component
 * Full-screen dialog wrapper with header, content, and footer
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ModalProps as RNModalProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);

export interface ModalProps extends Omit<RNModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  scrollable?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'max-h-1/3',
  md: 'max-h-1/2',
  lg: 'max-h-3/4',
  full: 'h-full',
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  size = 'md',
  showCloseButton = true,
  scrollable = true,
  footer,
  children,
  className = '',
  ...props
}) => {
  const ContentWrapper = scrollable ? StyledScrollView : StyledView;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      <SafeAreaView className="flex-1 bg-black/50">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <StyledView className="flex-1 justify-end">
            <StyledView
              className={`bg-white rounded-t-3xl ${sizeStyles[size]} ${className}`}
            >
              {/* Header */}
              <StyledView className="px-6 pt-6 pb-4 border-b border-neutral-100">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-4">
                    {title && (
                      <StyledText className="text-xl font-semibold text-neutral-900 mb-1">
                        {title}
                      </StyledText>
                    )}
                    {subtitle && (
                      <StyledText className="text-sm text-neutral-600">
                        {subtitle}
                      </StyledText>
                    )}
                  </View>

                  {showCloseButton && (
                    <StyledTouchable
                      onPress={onClose}
                      className="w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
                      accessibilityLabel="Close modal"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close" size={24} color="#64748b" />
                    </StyledTouchable>
                  )}
                </View>
              </StyledView>

              {/* Content */}
              <ContentWrapper
                className={scrollable ? 'flex-1' : ''}
                contentContainerClassName="px-6 py-4"
                showsVerticalScrollIndicator={scrollable}
              >
                {children}
              </ContentWrapper>

              {/* Footer */}
              {footer && (
                <StyledView className="px-6 py-4 border-t border-neutral-100">
                  {footer}
                </StyledView>
              )}
            </StyledView>
          </StyledView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </RNModal>
  );
};

// Bottom Sheet variant - optimized for action sheets
export interface BottomSheetProps extends Omit<ModalProps, 'size'> {
  snapPoint?: '25%' | '50%' | '75%' | '90%';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  snapPoint = '50%',
  showCloseButton = false,
  scrollable = false,
  footer,
  children,
  className = '',
  ...props
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      <SafeAreaView className="flex-1">
        {/* Backdrop */}
        <StyledTouchable
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <StyledView
          className={`bg-white rounded-t-3xl ${className}`}
          style={{ height: snapPoint }}
        >
          {/* Handle */}
          <StyledView className="items-center pt-3 pb-2">
            <StyledView className="w-10 h-1 bg-neutral-300 rounded-full" />
          </StyledView>

          {/* Header */}
          {title && (
            <StyledView className="px-6 pb-4 border-b border-neutral-100">
              <View className="flex-row items-center justify-between">
                <StyledText className="text-lg font-semibold text-neutral-900">
                  {title}
                </StyledText>
                {showCloseButton && (
                  <StyledTouchable
                    onPress={onClose}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-neutral-100"
                    accessibilityLabel="Close"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={20} color="#64748b" />
                  </StyledTouchable>
                )}
              </View>
            </StyledView>
          )}

          {/* Content */}
          {scrollable ? (
            <StyledScrollView
              className="flex-1"
              contentContainerClassName="px-6 py-4"
              showsVerticalScrollIndicator
            >
              {children}
            </StyledScrollView>
          ) : (
            <StyledView className="px-6 py-4">{children}</StyledView>
          )}

          {/* Footer */}
          {footer && (
            <StyledView className="px-6 py-4 border-t border-neutral-100">
              {footer}
            </StyledView>
          )}
        </StyledView>
      </SafeAreaView>
    </RNModal>
  );
};

export default Modal;
