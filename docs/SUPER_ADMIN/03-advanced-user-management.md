# 👥 Advanced User Management

## Overview

Advanced User Management provides comprehensive cross-institutional user operations, analytics, impersonation capabilities, and bulk operations for Super Admins within the ELMS ecosystem.

## ✅ Implementation Status

**FULLY IMPLEMENTED** - All core features are complete and production-ready with comprehensive API endpoints, validation, analytics, and audit trails.

## Core Features

### 1. Cross-Institutional User Search & Filtering

```typescript
interface UserSearchFilters {
  query?: string; // Search in name, email
  institutionIds?: string[];
  roles?: UserRole[];
  status?: UserStatus[];
  lastLoginRange?: DateRange;
  createdRange?: DateRange;
  emailVerified?: boolean;
  hasProfileImage?: boolean;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
}

interface UserSearchResult {
  users: UserWithInstitution[];
  total: number;
  page: number;
  limit: number;
  aggregations: UserAggregations;
}
```

**Features:**
- **Advanced Search**: Search across name, email with full-text capabilities
- **Multiple Filters**: Role, status, institution, activity, verification status
- **Date Range Filtering**: Last login, creation date, custom ranges
- **Pagination & Sorting**: Configurable page size and multiple sort options
- **Aggregation Statistics**: Users by institution, role, status, verification

### 2. User Analytics & Insights

```typescript
interface UserAnalytics {
  userId: string;
  activityPatterns: ActivityPattern[];
  performanceMetrics: PerformanceMetrics;
  engagementScores: EngagementScore[];
  retentionMetrics: RetentionMetrics;
  institutionComparison: InstitutionComparison;
}
```

**Analytics Features:**
- **Activity Patterns**: Login frequency, session duration, feature usage
- **Performance Metrics**: Exam scores, completion rates, response times
- **Engagement Scoring**: Multi-factor engagement calculation (0-100)
- **Retention Analysis**: Churn risk, lifecycle stage, retention rates
- **Benchmarking**: Institution comparison and ranking metrics
- **Device Analytics**: Browser, OS, screen resolution tracking

### 3. User Impersonation for Support

```typescript
interface ImpersonationSession {
  id: string;
  superAdminId: string;
  targetUserId: string;
  reason: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: ImpersonationStatus;
  actions: ImpersonationAction[];
  auditLog: AuditEntry[];
}
```

**Security Features:**
- **Time-Limited Sessions**: Configurable duration (5-480 minutes)
- **Complete Audit Trail**: All actions logged with timestamps
- **Reason Requirement**: Mandatory justification for all sessions
- **Action Tracking**: Every endpoint call during impersonation logged
- **Auto-Expiry**: Sessions automatically terminated at duration limit
- **Prevention Rules**: Cannot impersonate other super admins

### 4. Bulk User Operations

```typescript
enum BulkOperationType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  SUSPEND = 'suspend',
  UNLOCK = 'unlock',
  CHANGE_ROLE = 'change_role',
  TRANSFER_INSTITUTION = 'transfer_institution',
  RESET_PASSWORD = 'reset_password',
  SEND_NOTIFICATION = 'send_notification',
  DELETE = 'delete',
  EXPORT_DATA = 'export_data'
}
```

**Bulk Operation Features:**
- **Multi-User Operations**: Process hundreds of users simultaneously
- **Dry Run Support**: Preview operations before execution
- **Progress Tracking**: Real-time status updates and completion metrics
- **Error Handling**: Detailed failure reporting with user-specific errors
- **Audit Compliance**: Complete logging of all bulk operations
- **Rollback Capability**: Operation reversal for certain actions

### 5. User Account Management

- **Password Reset**: Force password resets with notification
- **Account Unlock**: Remove account locks and failed login attempts
- **Profile Verification**: Manual verification of user profiles
- **Data Export**: GDPR-compliant data export functionality
- **Account Merge**: Duplicate account resolution and merging

## API Endpoints

### User Statistics & Overview

- `GET /api/v1/superadmin/users/stats` - Get comprehensive user statistics

### Cross-Institutional User Search

- `GET /api/v1/superadmin/users/search` - Advanced user search with filters

### User Analytics & Insights

- `GET /api/v1/superadmin/users/:userId/analytics` - Get user analytics
- `GET /api/v1/superadmin/users/:userId/activity` - Get user activity history

### Impersonation Management

- `POST /api/v1/superadmin/users/impersonate` - Start impersonation session
- `POST /api/v1/superadmin/users/impersonate/:sessionId/end` - End session
- `GET /api/v1/superadmin/users/impersonation/history` - Get impersonation history

### Bulk Operations

- `POST /api/v1/superadmin/users/bulk-operations` - Perform bulk operations
- `GET /api/v1/superadmin/users/bulk-operations/:operationId` - Get operation status

## Technical Implementation

### Service Layer Features

- **Cross-Institution Queries**: Efficient queries across all institutions
- **Redis Caching**: Smart caching with 5-minute search cache, 1-hour analytics cache
- **Aggregation Pipelines**: Optimized database aggregations for statistics
- **JWT Token Management**: Secure impersonation token generation and validation
- **Bulk Processing**: Efficient batch operations with transaction management

### Database Schema

**New Models Added:**
- `UserActivity` - Activity tracking and audit trails
- `ImpersonationSession` - Impersonation session management
- `ImpersonationAction` - Action logging during impersonation
- `BulkOperation` - Bulk operation tracking and results
- `UserAnalyticsData` - Daily user analytics aggregation

### Controller Layer Features

- **Comprehensive Validation**: express-validator rules for all endpoints
- **Error Handling**: Detailed error responses with proper HTTP status codes
- **Request Context**: IP address and user agent tracking for security
- **Response Standardization**: Consistent response format across all endpoints

### Security & Compliance

- **Audit Trails**: Complete logging of all user management operations
- **GDPR Compliance**: Data export and anonymization capabilities
- **Session Security**: Secure token generation with expiration
- **Access Control**: Role-based access with super admin requirements
- **Rate Limiting**: Protection against bulk operation abuse

## Search & Filter Capabilities

### Advanced Search Options

- **Text Search**: Full-text search across names and email addresses
- **Institution Filter**: Single or multiple institution selection
- **Role Filter**: Filter by user roles (student, faculty, admin, etc.)
- **Status Filter**: Active, inactive, suspended, pending verification
- **Date Ranges**: Creation date, last login date with custom ranges
- **Verification Status**: Email verified/unverified users
- **Profile Completeness**: Users with/without profile images

### Sorting & Pagination

- **Sort Fields**: Created date, updated date, last login, email, name, institution
- **Sort Order**: Ascending or descending for all fields
- **Pagination**: Configurable page size (1-100 users per page)
- **Total Count**: Accurate total counts for all filtered results

## Analytics Dashboard Data

### User Statistics

- **User Counts**: Total, active, inactive, suspended users
- **Growth Metrics**: New users today, this week, this month
- **Distribution**: Users by role, institution, verification status
- **Activity Metrics**: Login sessions, average session duration
- **Risk Analysis**: Users at risk of churning, inactive accounts

### Performance Metrics

- **Engagement Scoring**: Multi-factor engagement calculation
- **Retention Analysis**: User lifecycle stages and retention rates
- **Activity patterns**: Peak usage hours and feature adoption
- **Device Analytics**: Browser, OS, and device type distribution

## Compliance & Governance

### Data Privacy

- **GDPR Compliance**: Right to access, portability, erasure
- **Data Minimization**: Only necessary data collected and stored
- **Consent Management**: Clear consent tracking and management
- **Data Retention**: Automated data cleanup based on retention policies

### Audit & Monitoring

- **Complete Audit Trails**: All actions logged with user, timestamp, reason
- **Impersonation Monitoring**: Special tracking for support impersonation
- **Bulk Operation Tracking**: Detailed logging of mass user operations
- **Compliance Reporting**: Automated compliance report generation

## Performance & Scalability

### Caching Strategy

- **Search Results**: 5-minute cache for search queries
- **User Analytics**: 1-hour cache for analytics data
- **Statistics**: 10-minute cache for dashboard statistics
- **Cache Invalidation**: Smart invalidation on user data changes

### Database Optimization

- **Indexed Queries**: Optimized indexes for search and filtering
- **Aggregation Pipelines**: Efficient data aggregation for analytics
- **Batch Processing**: Optimized bulk operations with transaction management
- **Query Optimization**: Selective field loading and efficient joins
