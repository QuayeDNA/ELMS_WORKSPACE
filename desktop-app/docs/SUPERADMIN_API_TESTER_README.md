# Super Admin API Tester

A comprehensive testing interface for all Phase 2 Super Admin endpoints in the ELMS system.

## Overview

This component provides a complete testing suite for all Phase 2 advanced Super Admin features:

- **System Monitoring** - Health checks, metrics collection, and system alerts
- **Alert Management** - Configurable alerts with multi-channel notifications
- **Webhook Management** - Event-driven webhook system with signature verification
- **Report Scheduler** - Automated report execution and delivery

## Features

### 🔍 Comprehensive Testing
- Test individual endpoints or all endpoints at once
- Real-time status indicators with loading, success, and error states
- Detailed response inspection with formatted JSON output
- Error handling with descriptive messages

### 📊 Visual Dashboard
- Overview of all test results with statistics
- Sectioned testing by feature area
- Status icons and color-coded results
- Response time and success rate tracking

### 🛠️ Test Data Creation
- One-click creation of test alerts, webhooks, and scheduled reports
- Pre-configured test scenarios for quick validation
- Automatic cleanup and reset functionality

## Available Endpoints

### System Monitoring

```bash
GET /api/superadmin/system/health      - System health check
GET /api/superadmin/system/metrics     - System metrics
GET /api/superadmin/system/alerts      - System alerts
```

### Alert Management

```bash
GET  /api/superadmin/alerts            - List alerts
POST /api/superadmin/alerts            - Create alert
GET  /api/superadmin/alerts/stats      - Alert statistics
```

### Webhook Management

```bash
GET  /api/superadmin/webhooks           - List webhooks
POST /api/superadmin/webhooks           - Create webhook
GET  /api/superadmin/webhooks/stats     - Webhook statistics
```

### Report Scheduler

```bash
GET    /api/superadmin/reports/scheduler           - List schedules
POST   /api/superadmin/reports/scheduler           - Create schedule
PUT    /api/superadmin/reports/scheduler/:id       - Update schedule
DELETE /api/superadmin/reports/scheduler/:id       - Delete schedule
POST   /api/superadmin/reports/scheduler/execute   - Execute due reports
GET    /api/superadmin/reports/scheduler/stats     - Scheduler statistics
POST   /api/superadmin/reports/scheduler/cron/start   - Start cron job
POST   /api/superadmin/reports/scheduler/cron/stop    - Stop cron job
GET    /api/superadmin/reports/scheduler/cron/status  - Cron status
POST   /api/superadmin/reports/scheduler/cron/trigger - Manual trigger
```

## Setup Instructions

### 1. Backend Setup
Ensure your backend server is running on `http://localhost:3000` with:

```bash
cd backend
npm run dev
```

### 2. Authentication
The tester expects an authentication token stored in localStorage:

```javascript
// Set your Super Admin token
localStorage.setItem('authToken', 'your-superadmin-jwt-token');
```

### 3. Frontend Integration
Add the test page to your routing system:

```typescript
import SuperAdminAPITestPage from './pages/SuperAdminAPITestPage';

// Add to your routes
<Route path="/superadmin/api-test" element={<SuperAdminAPITestPage />} />
```

### 4. UI Dependencies
Ensure you have the required UI components:

```bash
npm install lucide-react
```

Required UI components (should be in your `src/components/ui/` directory):
- `button.tsx`
- `card.tsx`
- `alert.tsx`

## Usage Guide

### Quick Start
1. Navigate to the API tester page
2. Click "Test All Endpoints" to run comprehensive tests
3. Review results in the Overview section
4. Use individual section tabs for detailed testing

### Testing Workflow

#### 1. System Monitoring
- Click "Test System Monitoring" to check system health
- Verify health endpoint returns proper status
- Check metrics collection is working
- Review system alerts functionality

#### 2. Alert Management
- Test alert listing and statistics
- Create test alerts using "Create Test Data"
- Verify alert creation and retrieval

#### 3. Webhook Management
- Test webhook listing and statistics
- Create test webhooks with sample endpoints
- Verify webhook configuration and status

#### 4. Report Scheduler
- Test scheduler listing and statistics
- Create test scheduled reports
- Verify cron job status and manual triggering

### Test Data Examples

#### Sample Alert Creation
```json
{
  "title": "Test Alert",
  "message": "This is a test alert from the API tester",
  "severity": "info",
  "type": "system",
  "isActive": true
}
```

#### Sample Webhook Creation
```json
{
  "name": "Test Webhook",
  "url": "https://webhook.site/test-endpoint",
  "events": ["user.created", "exam.completed"],
  "isActive": true,
  "secret": "test-secret-key"
}
```

#### Sample Report Schedule
```json
{
  "reportId": 1,
  "frequency": "daily",
  "time": "09:00",
  "recipients": ["admin@example.com"],
  "format": "json",
  "isActive": true
}
```

## Troubleshooting

### Common Issues

#### Authentication Errors
- Ensure you have a valid Super Admin JWT token
- Check token expiration and refresh if needed
- Verify token is stored in localStorage with key 'authToken'

#### CORS Issues
- Backend must allow requests from your frontend origin
- Check CORS configuration in backend server.ts

#### Network Errors
- Verify backend server is running on port 3000
- Check firewall settings and port availability
- Ensure API_BASE URL matches your backend URL

#### Missing Dependencies
- Install required npm packages
- Check for missing UI components
- Verify TypeScript types are properly imported

### Error Messages

#### "Failed to fetch"
- Backend server not running
- CORS policy blocking request
- Network connectivity issues

#### "401 Unauthorized"
- Invalid or missing authentication token
- Token expired
- Insufficient permissions (not Super Admin)

#### "404 Not Found"
- Incorrect API endpoint URL
- Route not properly registered in backend
- Missing route parameters

#### "500 Internal Server Error"
- Backend service error
- Database connection issues
- Missing environment variables

## API Response Format

All endpoints return responses in this format:

```typescript
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
```

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "error": "Detailed error message"
}
```

## Development Notes

### Adding New Tests
1. Add endpoint to the appropriate section array
2. Implement test function if needed
3. Update the renderSection function to include new endpoints
4. Add proper error handling and response validation

### Customizing Test Data
- Modify the `createTestData` function for different test scenarios
- Update endpoint arrays for new API routes
- Adjust request bodies and parameters as needed

### Performance Considerations
- Tests include 500ms delays between requests to prevent rate limiting
- Large response data is truncated for display
- Consider pagination for endpoints returning large datasets

## Contributing

When adding new Super Admin endpoints:

1. Update the endpoint arrays in the component
2. Add appropriate test functions
3. Include in the "Test All Endpoints" functionality
4. Update this documentation
5. Test thoroughly with various scenarios

## Support

For issues with the API tester:
1. Check browser console for JavaScript errors
2. Verify backend logs for server-side issues
3. Test endpoints individually to isolate problems
4. Check network tab for request/response details

For API endpoint issues:
1. Refer to backend service documentation
2. Check database connectivity
3. Verify environment configuration
4. Review authentication and authorization setup
