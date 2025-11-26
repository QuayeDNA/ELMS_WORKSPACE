import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ScreenContainer, ScreenHeader, Input, Button, Typography, Alert as AlertComponent } from '../components/ui';
import { DevCredentialsFAB } from '../components/ui/DevCredentialsFab';
import { useLogin } from '../hooks/useAuth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useLogin();

  const handleSelectCredential = (username: string, password: string) => {
    setUsername(username);
    setPassword(password);
    setError(null); // Clear any previous errors
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setError(null);
      await login(username.trim(), password.trim());
    } catch (error: any) {
      setError(error);
    }
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
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="person"
                  editable={!isLoading}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  leftIcon="lock-closed"
                  editable={!isLoading}
                />

                <Button
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
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


