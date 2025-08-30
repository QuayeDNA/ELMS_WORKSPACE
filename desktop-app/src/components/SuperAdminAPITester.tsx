import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    profile?: unknown;
  };
}

interface TestResult {
  endpoint: string;
  method: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  response?: ApiResponse;
  error?: string;
}

const SuperAdminAPITester: React.FC = () => {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [authToken, setAuthToken] = useState<string>('');
  const [loginCredentials, setLoginCredentials] = useState({ email: 'admin@elms.edu', password: 'admin123' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing token on component mount
  useEffect(() => {
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      setAuthToken(existingToken);
      setIsLoggedIn(true);
    }
  }, []);

  const API_BASE = 'http://localhost:3000/api/superadmin';

  // Get auth token from state or localStorage
  const getAuthToken = () => {
    // First check state, then localStorage, then fallback
    if (authToken) return authToken;
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setAuthToken(storedToken);
      return storedToken;
    }
    // Return a fallback token for testing (this should be removed in production)
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWVxdWwwMnYwMDAwa2xpMTRhYXhhZzJpIiwiZW1haWwiOiJhZG1pbkBlbG1zLmVkdSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTc1NjQ4MDY4OCwiZXhwIjoxNzU2NTY3MDg4fQ.ZyIK5i-cq07u0UJwRGYUXIQjmr-ff269ovJsC8nhkK4';
  };

  const makeRequest = async (
    endpoint: string,
    method: string = 'GET',
    body?: Record<string, unknown>,
    baseUrl?: string
  ): Promise<ApiResponse> => {
    const url = `${baseUrl || API_BASE}${endpoint}`;
    const token = getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    return await response.json();
  };

  const updateResult = (key: string, status: TestResult['status'], response?: ApiResponse, error?: string) => {
    setResults(prev => ({
      ...prev,
      [key]: {
        endpoint: key,
        method: getMethodForEndpoint(key),
        status,
        response,
        error
      }
    }));
  };

  const getMethodForEndpoint = (endpoint: string): string => {
    // Auth endpoints
    if (endpoint === '/auth/health') return 'GET';
    if (endpoint === '/auth/login') return 'POST';

    // System endpoints
    if (endpoint.includes('/system/health') || endpoint.includes('/system/metrics') ||
        endpoint.includes('/system/alerts') || endpoint.includes('/system/backups') ||
        endpoint.includes('/system/maintenance')) return 'GET';
    if (endpoint === '/system/backup') return 'POST';
    if (endpoint === '/system/maintenance') return 'PUT';

    // Security endpoints
    if (endpoint.includes('/security/policies') || endpoint.includes('/security/incidents')) return 'GET';
    if (endpoint === '/security/policies') return 'PUT';

    // Analytics endpoints
    if (endpoint.includes('/analytics')) return 'GET';

    // Institution endpoints
    if (endpoint === '/institutions') return 'GET';
    if (endpoint.includes('/institutions/') && endpoint !== '/institutions') {
      // Check if it's an ID-based endpoint (GET/PUT/DELETE)
      const parts = endpoint.split('/');
      if (parts.length === 3 && /^\d+$/.test(parts[2])) {
        return 'GET'; // GET /institutions/:id
      }
      return 'PUT'; // PUT /institutions/:id
    }

    // Report scheduler endpoints
    if (endpoint === '/reports/scheduler') return 'GET';
    if (endpoint === '/reports/scheduler/stats' || endpoint === '/reports/scheduler/cron/status') return 'GET';
    if (endpoint === '/reports/scheduler' || endpoint === '/reports/scheduler/execute' ||
        endpoint.includes('/reports/scheduler/cron/')) return 'POST';
    if (endpoint.includes('/reports/scheduler/') && endpoint !== '/reports/scheduler' &&
        !endpoint.includes('/execute') && !endpoint.includes('/cron/')) return 'PUT';

    return 'GET'; // Default fallback
  };

  const testEndpoint = async (endpoint: string, method?: string, body?: Record<string, unknown>) => {
    const key = endpoint;
    updateResult(key, 'loading');

    try {
      // Determine the correct base URL based on the endpoint
      const baseUrl = endpoint.startsWith('/auth/') ? 'http://localhost:3000/api' : API_BASE;
      const response = await makeRequest(endpoint, method, body, baseUrl);
      updateResult(key, response.success ? 'success' : 'error', response);
    } catch (error) {
      updateResult(key, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testAllEndpoints = async () => {
    setIsRunningAll(true);

    const testCases = [
      // Authentication
      { endpoint: '/auth/health', method: getMethodForEndpoint('/auth/health') },

      // System Management
      { endpoint: '/system/health', method: getMethodForEndpoint('/system/health') },
      { endpoint: '/system/metrics', method: getMethodForEndpoint('/system/metrics') },
      { endpoint: '/system/alerts', method: getMethodForEndpoint('/system/alerts') },
      { endpoint: '/system/backups', method: getMethodForEndpoint('/system/backups') },
      { endpoint: '/system/maintenance', method: getMethodForEndpoint('/system/maintenance') },

      // Security
      { endpoint: '/security/policies', method: getMethodForEndpoint('/security/policies') },
      { endpoint: '/security/incidents', method: getMethodForEndpoint('/security/incidents') },

      // Analytics
      { endpoint: '/analytics', method: getMethodForEndpoint('/analytics') },
      { endpoint: '/analytics/overview', method: getMethodForEndpoint('/analytics/overview') },
      { endpoint: '/analytics/user-activity', method: getMethodForEndpoint('/analytics/user-activity') },
      { endpoint: '/analytics/performance', method: getMethodForEndpoint('/analytics/performance') },
      { endpoint: '/analytics/security', method: getMethodForEndpoint('/analytics/security') },

      // Institutions
      { endpoint: '/institutions', method: getMethodForEndpoint('/institutions') },

      // Report Scheduler
      { endpoint: '/reports/scheduler', method: getMethodForEndpoint('/reports/scheduler') },
      { endpoint: '/reports/scheduler/stats', method: getMethodForEndpoint('/reports/scheduler/stats') },
      { endpoint: '/reports/scheduler/cron/status', method: getMethodForEndpoint('/reports/scheduler/cron/status') },
    ];

    for (const testCase of testCases) {
      await testEndpoint(testCase.endpoint, testCase.method);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningAll(false);
  };

  const testUserManagement = async () => {
    // Note: User management endpoints are not available in superadmin routes
    // Testing institution management instead as it's the closest equivalent
    await Promise.all([
      testEndpoint('/institutions', getMethodForEndpoint('/institutions')),
      testEndpoint('/analytics/user-activity', getMethodForEndpoint('/analytics/user-activity')),
    ]);
  };

  const testSystemMonitoring = async () => {
    await Promise.all([
      testEndpoint('/system/health', getMethodForEndpoint('/system/health')),
      testEndpoint('/system/metrics', getMethodForEndpoint('/system/metrics')),
      testEndpoint('/system/alerts', getMethodForEndpoint('/system/alerts')),
      testEndpoint('/system/backups', getMethodForEndpoint('/system/backups')),
      testEndpoint('/system/maintenance', getMethodForEndpoint('/system/maintenance')),
    ]);
  };

  const testReportScheduler = async () => {
    await Promise.all([
      testEndpoint('/reports/scheduler', getMethodForEndpoint('/reports/scheduler')),
      testEndpoint('/reports/scheduler/stats', getMethodForEndpoint('/reports/scheduler/stats')),
      testEndpoint('/reports/scheduler/cron/status', getMethodForEndpoint('/reports/scheduler/cron/status')),
    ]);
  };

  const login = async (email: string, password: string) => {
    const key = '/auth/login';
    updateResult(key, 'loading');

    try {
      // Use the auth endpoint directly, not the superadmin base
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem('authToken', data.token);
        setIsLoggedIn(true);
        updateResult(key, 'success', data);
      } else {
        updateResult(key, 'error', data);
      }
    } catch (error) {
      updateResult(key, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testAuthentication = async () => {
    // Test the auth health endpoint
    await testEndpoint('/auth/health', getMethodForEndpoint('/auth/health'));
  };

  const logout = () => {
    setAuthToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    setLoginCredentials({ email: '', password: '' });
  };

  const createTestData = async () => {
    // Create a test scheduled report
    await testEndpoint('/reports/scheduler', getMethodForEndpoint('/reports/scheduler'), {
      reportId: 1,
      frequency: 'daily',
      time: '09:00',
      recipients: ['admin@example.com'],
      format: 'json',
      isActive: true
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'LOADING';
      case 'success':
        return 'SUCCESS';
      case 'error':
        return 'ERROR';
      default:
        return 'IDLE';
    }
  };

  const sections = [
    { id: 'overview', name: 'Overview' },
    { id: 'auth', name: 'Authentication' },
    { id: 'users', name: 'Institution Management' },
    { id: 'monitoring', name: 'System Monitoring' },
    { id: 'scheduler', name: 'Report Scheduler' },
  ];

  const renderOverview = () => (
    <Card>
      <CardHeader>
        <CardTitle>API Test Results Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(results).filter(r => r.status === 'success').length}
            </div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(results).filter(r => r.status === 'error').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(results).filter(r => r.status === 'loading').length}
            </div>
            <div className="text-sm text-gray-600">Loading</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Object.keys(results).length}
            </div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>
        </div>

        <div className="space-y-2">
          {Object.entries(results).map(([endpoint, result]) => (
            <div key={endpoint} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="font-mono text-sm">{endpoint}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{result.method}</span>
              </div>
              <span className={`text-xs font-bold ${
                result.status === 'success' ? 'text-green-600' :
                result.status === 'error' ? 'text-red-600' :
                result.status === 'loading' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {getStatusText(result.status)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSection = (sectionId: string) => {
    const endpoints = {
      auth: ['/auth/health'],
      users: ['/institutions', '/analytics/user-activity'], // Using institutions as user management equivalent
      monitoring: ['/system/health', '/system/metrics', '/system/alerts', '/system/backups', '/system/maintenance'],
      scheduler: ['/reports/scheduler', '/reports/scheduler/stats', '/reports/scheduler/cron/status']
    };

    const sectionEndpoints = endpoints[sectionId as keyof typeof endpoints] || [];

    if (sectionId === 'auth') {
      return (
        <div className="space-y-6">
          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={loginCredentials.email}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={loginCredentials.password}
                    onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-2 border rounded"
                    placeholder="Enter password"
                  />
                </div>
                <Button
                  onClick={() => login(loginCredentials.email, loginCredentials.password)}
                  disabled={!loginCredentials.email || !loginCredentials.password}
                >
                  Login
                </Button>
                {isLoggedIn && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="text-green-600 font-medium">
                      ✅ Logged in successfully! Token saved for API testing.
                    </div>
                    <Button variant="outline" size="sm" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Auth Endpoints */}
          <div className="space-y-4">
            <Button onClick={testAuthentication}>
              Test Authentication Endpoints
            </Button>

            <div className="grid gap-4">
              {sectionEndpoints.map(endpoint => {
                const result = results[endpoint];
                return (
                  <Card key={endpoint}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result && getStatusIcon(result.status)}
                          <span className="font-mono">{endpoint}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {getMethodForEndpoint(endpoint)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => testEndpoint(endpoint)}
                          disabled={result?.status === 'loading'}
                        >
                          {result?.status === 'loading' ? 'Testing...' : 'Test'}
                        </Button>
                      </div>

                      {result?.response && (
                        <div className="mt-4">
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </div>
                      )}

                      {result?.error && (
                        <Alert className="mt-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{result.error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Button
          onClick={() => {
            if (sectionId === 'users') testUserManagement();
            else if (sectionId === 'monitoring') testSystemMonitoring();
            else if (sectionId === 'scheduler') testReportScheduler();
          }}
        >
          Test {sections.find(s => s.id === sectionId)?.name}
        </Button>

        <div className="grid gap-4">
          {sectionEndpoints.map(endpoint => {
            const result = results[endpoint];
            return (
              <Card key={endpoint}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result && getStatusIcon(result.status)}
                      <span className="font-mono">{endpoint}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getMethodForEndpoint(endpoint)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => testEndpoint(endpoint)}
                      disabled={result?.status === 'loading'}
                    >
                      {result?.status === 'loading' ? 'Testing...' : 'Test'}
                    </Button>
                  </div>

                  {result?.response && (
                    <div className="mt-4">
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result?.error && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin API Tester</h1>
          <p className="text-gray-600 mt-2">
            Test all available Super Admin endpoints for System Monitoring and Report Scheduler
          </p>
          {isLoggedIn && (
            <div className="mt-2 text-green-600 font-medium">
              ✅ Authenticated - Using valid token for API requests
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={testAllEndpoints} disabled={isRunningAll}>
            {isRunningAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing All...
              </>
            ) : (
              'Test All Endpoints'
            )}
          </Button>
          <Button variant="outline" onClick={createTestData}>
            Create Test Data
          </Button>
          {isLoggedIn && (
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {sections.map(section => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            onClick={() => setActiveSection(section.id)}
          >
            {section.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{sections.find(s => s.id === activeSection)?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeSection === 'overview' ? renderOverview() : renderSection(activeSection)}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminAPITester;
