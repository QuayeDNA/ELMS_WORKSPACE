# Super Admin API Tester - Quick Start

## 🎯 What This Does

This component provides a comprehensive testing interface for all Phase 2 Super Admin endpoints:

- **System Monitoring** - Health checks, metrics, alerts
- **Alert Management** - CRUD operations, notifications
- **Webhook Management** - Event-driven webhooks, delivery tracking
- **Report Scheduler** - Automated report execution, cron management

## 🚀 Quick Setup

### 1. Backend Server

Make sure your backend is running:

```bash
cd backend
npm run dev
```

### 2. Authentication Token

Set your Super Admin JWT token in browser console:

```javascript
localStorage.setItem('authToken', 'your-superadmin-jwt-token-here');
```

### 3. Add to Your App

Import and use the component:

```typescript
import SuperAdminAPITester from './components/SuperAdminAPITester';

// Use in your app
<SuperAdminAPITester />
```

## 📋 Available Endpoints

### System Monitoring

- `GET /api/superadmin/system/health`
- `GET /api/superadmin/system/metrics`
- `GET /api/superadmin/system/alerts`

### Alert Management

- `GET /api/superadmin/alerts`
- `POST /api/superadmin/alerts`
- `GET /api/superadmin/alerts/stats`

### Webhook Management

- `GET /api/superadmin/webhooks`
- `POST /api/superadmin/webhooks`
- `GET /api/superadmin/webhooks/stats`

### Report Scheduler

- `GET /api/superadmin/reports/scheduler`
- `POST /api/superadmin/reports/scheduler`
- `GET /api/superadmin/reports/scheduler/stats`
- `POST /api/superadmin/reports/scheduler/cron/status`

## 🎮 How to Use

1. **Test All Endpoints** - Click the main button to test everything
2. **Test by Section** - Use section buttons for focused testing
3. **Create Test Data** - Generate sample alerts, webhooks, and schedules
4. **Individual Tests** - Click individual "Test" buttons for specific endpoints

## 📊 What You'll See

- ✅ **Success** - Green checkmarks for working endpoints
- ❌ **Errors** - Red X marks with error details
- 🔄 **Loading** - Spinning icons during tests
- 📄 **Response Data** - Formatted JSON responses
- 📈 **Statistics** - Success/failure counts and overview

## 🔧 Troubleshooting

### Common Issues

- **401 Unauthorized** → Check your auth token
- **CORS Error** → Backend CORS configuration
- **404 Not Found** → Backend server not running
- **Network Error** → Wrong API base URL

### Debug Steps

1. Open browser DevTools → Console
2. Check Network tab for request details
3. Verify backend server logs
4. Test endpoints individually

## 🎉 Success Indicators

When everything works, you'll see:
- All endpoints return `success: true`
- System health shows proper status
- Alert/webhook creation succeeds
- Scheduler shows active cron job
- Response data displays correctly

Happy testing! 🎊
