import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthPageProps {}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC<AuthPageProps> = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const handleSwitchToLogin = () => setMode('login');
  const handleSwitchToRegister = () => setMode('register');
  const handleSwitchToForgotPassword = () => setMode('forgot-password');
  const handleRegisterSuccess = () => setMode('login');

  return (
    <div className="min-h-screen bg-gray-50">
      {mode === 'login' && (
        <LoginForm
          onSwitchToRegister={handleSwitchToRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
      )}
      {mode === 'register' && (
        <RegisterForm
          onRegister={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {mode === 'forgot-password' && (
        <ForgotPasswordForm
          onBackToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};
