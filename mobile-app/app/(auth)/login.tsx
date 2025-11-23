/**
 * ELMS Mobile - Login Screen
 * Handler authentication (blocks students)
 */

import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { showMessage } from 'react-native-flash-message';
import {
  ScreenContainer,
  Typography,
  Input,
  Button,
  Alert,
  Card,
  CardContent,
} from '@/components/ui';
import { useLogin } from '@/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    login(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          showMessage({
            message: 'Login Successful',
            description: 'Welcome back!',
            type: 'success',
            duration: 2000,
          });
          router.replace('/(tabs)');
        },
        onError: (error: Error) => {
          showMessage({
            message: 'Login Failed',
            description: error.message,
            type: 'danger',
            duration: 4000,
          });
        },
      }
    );
  };

  return (
    <ScreenContainer scrollable={false} className="bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-12 items-center">
          {/* Logo placeholder */}
          <View className="w-20 h-20 bg-primary-600 rounded-2xl mb-4 items-center justify-center">
            <Typography variant="displaySmall" className="text-white">
              E
            </Typography>
          </View>

          <Typography variant="headlineLarge" className="text-neutral-900">
            ELMS Mobile
          </Typography>
          <Typography variant="bodyMedium" color="secondary" className="mt-2">
            Exam Logistics Management System
          </Typography>
        </View>

        <Card variant="elevated" className="mb-6">
          <CardContent>
            <Alert variant="info" className="mb-4">
              For exam handlers only. Students use the web portal.
            </Alert>

            <Input
              label="Email"
              placeholder="handler@university.edu"
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isPending}
            />

            <View className="mt-4">
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  setErrors({ ...errors, password: undefined });
                }}
                error={errors.password}
                secureTextEntry
                leftIcon="lock-closed"
                autoComplete="password"
                editable={!isPending}
              />
            </View>

            <Button
              onPress={handleLogin}
              loading={isPending}
              disabled={isPending}
              className="mt-6"
              size="lg"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>

        <Typography variant="bodySmall" color="secondary" className="text-center">
          Version 1.0.0 • Powered by ELMS
        </Typography>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
