import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import DevCredentialsFab from '@/components/auth/DevCredentialsFab';
import type { LoginFormRef } from '@/components/auth/LoginForm';
import { useRef, useEffect, useState } from 'react';
import type { DevCredential } from '@/components/auth/devCredentials';
import { useAuthStore } from '@/stores/auth.store';
import { useLoginRedirect } from '@/hooks/useLoginRedirect';
import { getRedirectPath } from '@/utils/routeConfig';
import {
  Shield,
  Users,
  BarChart3,
  Lock,
  Clock
} from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { redirectAfterLogin } = useLoginRedirect();
  const loginFormRef = useRef<LoginFormRef | null>(null);

  // Dynamic greetings that vary by visit count for a friendlier UX
  const [greeting, setGreeting] = useState('Welcome Back');
  const [subtext, setSubtext] = useState('Sign in to your account to continue');

  useEffect(() => {
    try {
      const greetings = [
        'Welcome Back',
        'Hello again',
        'Nice to see you',
        'Welcome!',
        'Hi there — let\'s sign you in',
      ];
      const subs = [
        'Sign in to your account to continue',
        'Enter your credentials to get started',
        'Access your exams and analytics',
        'Securely manage exams and incidents',
      ];

      const raw = window.localStorage.getItem('elms_visit_count') || '0';
      const count = Number(raw) || 0;
      const next = count + 1;
      window.localStorage.setItem('elms_visit_count', String(next));

      const idx = next % greetings.length;
      const sidx = next % subs.length;
      setGreeting(greetings[idx]);
      setSubtext(subs[sidx]);
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);

  // Redirect to appropriate dashboard if already authenticated
  if (isAuthenticated && user) {
    const redirectPath = getRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  const handleLoginSuccess = () => {
    // Use role-based redirect (delay is handled in the hook)
    redirectAfterLogin();
  };

  const handleDevCredentialSelect = (credential: DevCredential) => {
    // Fill credentials via ref exposed by LoginForm
    loginFormRef.current?.fillCredentials(credential);
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your examination data'
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Tailored dashboards for admins, instructors, and students'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track exam progress and incidents in real-time'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access your exam data anytime, anywhere'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo and title */}
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-primary font-bold text-2xl">E</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ELMS</h1>
              <p className="text-blue-100 text-sm">Exam Logistics Management</p>
            </div>
          </div>

          {/* Main heading */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Streamline Your
              <br />
              Examination Process
            </h2>
            <p className="text-blue-100 text-lg">
              The complete solution for managing exams, scripts, and incidents with ease.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-blue-100">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Secured with 256-bit encryption</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ELMS</h1>
              <p className="text-gray-600 text-sm">Exam Logistics</p>
            </div>
          </div>

          {/* Welcome message (centered, dynamic) */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{greeting}</h2>
            <p className="text-gray-600">{subtext}</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <LoginForm ref={loginFormRef} onSuccess={handleLoginSuccess} />
          </div>

          {/* Add FAB outside of form so it doesn't clutter the form UI */}
          <DevCredentialsFab onSelect={handleDevCredentialSelect} />

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your institution's administrator
            </p>
          </div>

          {/* Features for mobile */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
            {features.slice(0, 2).map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



