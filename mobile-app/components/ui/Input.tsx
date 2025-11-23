/**
 * ELMS Mobile - Input Component
 * Form input with label and error support
 */

import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerClassName = '',
  inputClassName = '',
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const hasError = !!error;

  return (
    <StyledView className={`space-y-2 ${containerClassName}`}>
      {label && (
        <StyledText className="text-sm font-medium text-neutral-900">
          {label}
        </StyledText>
      )}

      <StyledView
        className={`
          flex-row items-center
          border rounded-lg
          bg-white
          ${hasError ? 'border-error-500' : 'border-neutral-300'}
          ${props.editable === false ? 'bg-neutral-50' : ''}
          ${inputClassName}
        `}
      >
        {leftIcon && (
          <StyledView className="pl-3">{leftIcon}</StyledView>
        )}

        <StyledTextInput
          className={`
            flex-1
            px-3 py-3
            text-base
            text-neutral-900
          `}
          placeholderTextColor="#a3a3a3"
          secureTextEntry={isSecure}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            className="pr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color="#737373"
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <StyledView className="pr-3">{rightIcon}</StyledView>
        )}
      </StyledView>

      {(error || helperText) && (
        <StyledText
          className={`text-xs ${hasError ? 'text-error-500' : 'text-neutral-500'}`}
        >
          {error || helperText}
        </StyledText>
      )}
    </StyledView>
  );
};

export default Input;
