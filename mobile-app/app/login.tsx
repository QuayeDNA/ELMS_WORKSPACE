import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

import { ScreenContainer, ScreenHeader, Input, Button, Typography, Alert as AlertComponent } from '../components/ui';
import { DevCredentialsFAB } from '../components/ui/DevCredentialsFab';
import { useAuth } from '../hooks/useAuth';
import { loginUser, clearError } from '../stores/slices/authSlice';
import { AppDispatch } from '../stores/store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isHandler, isLoading, error } = useAuth();
  const router = useRouter();

  // Track if we've already navigated to prevent double navigation
  const hasNavigated = useRef(false);

  // Handle navigation when authentication succeeds
  useEffect(() => {
    // Only navigate if authenticated, is a handler, and haven't navigated yet
    if (isAuthenticated && isHandler && !hasNavigated.current) {
      hasNavigated.current = true;
      // Small delay to ensure state is fully settled
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [isAuthenticated, isHandler, router]);

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const handleSelectCredential = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    if (error) {
      dispatch(clearError());
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) {
      dispatch(clearError());
    }
  };

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      // Could dispatch a custom error here or use local state
      return;
    }

    // Dispatch login action - errors will be stored in Redux state
    dispatch(loginUser({ email: email.trim(), password: password.trim() }));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScreenContainer scrollable={false} className="flex-1">
        <View className="flex-1">
          <ScrollView className="flex-none">
            <ScreenHeader
              title="ELMS Mobile"
              subtitle="Exam Logistics Management System"
            />
          </ScrollView>

          <View className="flex-1 justify-center px-6">
            <View className="max-w-sm self-center w-full">
              <Typography variant="headlineMedium" className="text-center mb-2">
                Welcome Back
              </Typography>

              <Typography variant="bodyLarge" color="secondary" className="text-center mb-8">
                Sign in to access your exam sessions
              </Typography>

              {error && (
                <AlertComponent
                  variant="error"
                  title="Login Failed"
                  className="mb-6"
                >
                  {error}
                </AlertComponent>
              )}

              <View className="gap-4 mb-8">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="mail"
                  editable={!isLoading}
                  keyboardType="email-address"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  leftIcon="lock-closed"
                  editable={!isLoading}
                />

                <Button
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="mt-2"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </View>
            </View>
          </View>

          <View className="items-center gap-1 px-6 pb-4">
            <Typography variant="bodySmall" color="secondary" className="text-center">
              This application is for exam handlers only.
            </Typography>
            <Typography variant="bodySmall" color="secondary" className="text-center">
              Students should use the web interface.
            </Typography>
          </View>
        </View>
      </ScreenContainer>

      <DevCredentialsFAB onSelectCredential={handleSelectCredential} />
    </KeyboardAvoidingView>
  );
}
