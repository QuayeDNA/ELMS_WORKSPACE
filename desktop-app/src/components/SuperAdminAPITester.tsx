import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
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

  const API_BASE = 'http://localhost:3000/api/superadmin';

  // Get auth token from localStorage (assuming it's stored there)
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || 'your-superadmin-token-here';
  };

  const makeRequest = async (
    endpoint: string,
    method: string = 'GET',
    body?: Record<string, unknown>
  ): Promise<ApiResponse> => {
    const url = `${API_BASE}${endpoint}`;
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
    if (endpoint.includes('/health') || endpoint.includes('/stats') || endpoint.includes('/status')) return 'GET';
    if (endpoint.includes('/execute') || endpoint.includes('/trigger') || endpoint.includes('/start') || endpoint.includes('/stop')) return 'POST';
    if (endpoint.includes('/schedule') || endpoint.includes('/alerts') || endpoint.includes('/webhooks')) {
      return endpoint.split('/').pop()?.includes('schedule') || endpoint.split('/').pop()?.includes('alert') || endpoint.split('/').pop()?.includes('webhook') ? 'POST' : 'GET';
    }
    return 'GET';
  };

  const testEndpoint = async (endpoint: string, method?: string, body?: Record<string, unknown>) => {
    const key = endpoint;
    updateResult(key, 'loading');

    try {
      const response = await makeRequest(endpoint, method, body);
      updateResult(key, response.success ? 'success' : 'error', response);
    } catch (error) {
      updateResult(key, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testAllEndpoints = async () => {
    setIsRunningAll(true);

    const testCases = [
      // System Monitoring
      { endpoint: '/system/health', method: 'GET' },
      { endpoint: '/system/metrics', method: 'GET' },
      { endpoint: '/system/alerts', method: 'GET' },

      // Alert Management
      { endpoint: '/alerts', method: 'GET' },
      { endpoint: '/alerts/stats', method: 'GET' },

      // Webhook Management
      { endpoint: '/webhooks', method: 'GET' },
      { endpoint: '/webhooks/stats', method: 'GET' },

      // Report Scheduler
      { endpoint: '/reports/scheduler', method: 'GET' },
      { endpoint: '/reports/scheduler/stats', method: 'GET' },
      { endpoint: '/reports/scheduler/cron/status', method: 'GET' },
    ];

    for (const testCase of testCases) {
      await testEndpoint(testCase.endpoint, testCase.method);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningAll(false);
  };

  const testSystemMonitoring = async () => {
    await Promise.all([
      testEndpoint('/system/health'),
      testEndpoint('/system/metrics'),
      testEndpoint('/system/alerts'),
    ]);
  };

  const testAlertManagement = async () => {
    await Promise.all([
      testEndpoint('/alerts'),
      testEndpoint('/alerts/stats'),
    ]);
  };

  const testWebhookManagement = async () => {
    await Promise.all([
      testEndpoint('/webhooks'),
      testEndpoint('/webhooks/stats'),
    ]);
  };

  const testReportScheduler = async () => {
    await Promise.all([
      testEndpoint('/reports/scheduler'),
      testEndpoint('/reports/scheduler/stats'),
      testEndpoint('/reports/scheduler/cron/status'),
    ]);
  };

  const createTestData = async () => {
    // Create a test alert
    await testEndpoint('/alerts', 'POST', {
      title: 'Test Alert',
      message: 'This is a test alert from the API tester',
      severity: 'info',
      type: 'system',
      isActive: true
    });

    // Create a test webhook
    await testEndpoint('/webhooks', 'POST', {
      name: 'Test Webhook',
      url: 'https://webhook.site/test-endpoint',
      events: ['user.created', 'exam.completed'],
      isActive: true,
      secret: 'test-secret-key'
    });

    // Create a test scheduled report
    await testEndpoint('/reports/scheduler', 'POST', {
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
    { id: 'monitoring', name: 'System Monitoring' },
    { id: 'alerts', name: 'Alert Management' },
    { id: 'webhooks', name: 'Webhook Management' },
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
      monitoring: ['/system/health', '/system/metrics', '/system/alerts'],
      alerts: ['/alerts', '/alerts/stats'],
      webhooks: ['/webhooks', '/webhooks/stats'],
      scheduler: ['/reports/scheduler', '/reports/scheduler/stats', '/reports/scheduler/cron/status']
    };

    const sectionEndpoints = endpoints[sectionId as keyof typeof endpoints] || [];

    return (
      <div className="space-y-4">
        <Button
          onClick={() => {
            if (sectionId === 'monitoring') testSystemMonitoring();
            else if (sectionId === 'alerts') testAlertManagement();
            else if (sectionId === 'webhooks') testWebhookManagement();
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
                        GET
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
            Test all Phase 2 Super Admin endpoints for System Monitoring, Alert Management, Webhook Management, and Report Scheduler
          </p>
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
