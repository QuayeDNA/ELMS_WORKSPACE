import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { loginUser } from '../../src/store/slices/authSlice';
import { RootState, AppDispatch } from '../../src/store';
import { spacing } from '../../src/theme';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      router.replace('/(tabs)');
    } catch {
      setSnackbarVisible(true);
    }
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
              ELMS
            </Text>
            <Text variant="headlineSmall" style={[styles.subtitle, { color: theme.colors.onBackground }]}>
              Exam Logistics Management
            </Text>
            <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to access your account
            </Text>
          </View>

          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    error={!!errors.email}
                    style={styles.input}
                  />
                )}
              />
              {errors.email && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.email.message}
                </Text>
              )}

              <Controller
                name="password"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    error={!!errors.password}
                    style={styles.input}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                )}
              />
              {errors.password && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.password.message}
                </Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Sign In
              </Button>

              <Button
                mode="text"
                onPress={handleForgotPassword}
                style={styles.textButton}
              >
                Forgot Password?
              </Button>

              <View style={styles.footer}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Don&apos;t have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  onPress={handleRegister}
                  compact
                  style={styles.linkButton}
                >
                  Sign Up
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={{ backgroundColor: theme.colors.errorContainer }}
      >
        <Text style={{ color: theme.colors.onErrorContainer }}>
          {error || 'Login failed. Please try again.'}
        </Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  card: {
    elevation: 4,
    borderRadius: 16,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  errorText: {
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  textButton: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButton: {
    marginLeft: -spacing.xs,
  },
});

export default LoginScreen;
