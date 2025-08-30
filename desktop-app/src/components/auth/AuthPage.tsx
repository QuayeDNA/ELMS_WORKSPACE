import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthLayout } from './AuthLayout';

interface AuthPageProps {}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC<AuthPageProps> = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const handleSwitchToLogin = () => setMode('login');
  const handleSwitchToRegister = () => setMode('register');
  const handleSwitchToForgotPassword = () => setMode('forgot-password');

  const getFormTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'forgot-password':
        return 'Reset Password';
      default:
        return 'ELMS';
    }
  };

  const getFormSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to your ELMS account';
      case 'register':
        return 'Join ELMS and start your learning journey';
      case 'forgot-password':
        return 'Enter your email to reset your password';
      default:
        return 'Education Learning Management System';
    }
  };

  return (
    <AuthLayout title={getFormTitle()} subtitle={getFormSubtitle()}>
      {mode === 'login' && (
        <LoginForm
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
      )}
      {mode === 'register' && (
        <RegisterForm
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {mode === 'forgot-password' && (
        <ForgotPasswordForm
          onBackToLogin={handleSwitchToLogin}
        />
      )}
    </AuthLayout>
  );
};
