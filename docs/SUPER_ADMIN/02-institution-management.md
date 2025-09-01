# 🏛️ Institution Management

## Overview

Institution Management provides comprehensive CRUD operations and advanced configuration capabilities for educational institutions within the ELMS ecosystem. This feature includes full analytics, billing management, integration capabilities, and bulk operations.

## ✅ Implementation Status

**FULLY IMPLEMENTED** - All features are complete and production-ready with comprehensive API endpoints, validation, caching, and audit trails.

## Core Features

### 1. Institution CRUD Operations

```typescript
interface Institution {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  type: InstitutionType;
  category: InstitutionCategory;
  status: InstitutionStatus;
  address: Address;
  contactInfo: ContactInfo;
  configuration: InstitutionConfiguration;
  subscription: SubscriptionInfo;
  establishedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

enum InstitutionType {
  UNIVERSITY = 'university',
  COLLEGE = 'college',
  HIGH_SCHOOL = 'high_school',
  TRAINING_CENTER = 'training_center',
  TECHNICAL_INSTITUTE = 'technical_institute',
  POLYTECHNIC = 'polytechnic'
}

enum InstitutionCategory {
  PUBLIC = 'public',
  PRIVATE = 'private',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit'
}

enum InstitutionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}
```

### 2. Configuration Management

```typescript
interface InstitutionConfiguration {
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customTheme?: object;
    favicon?: string;
    loginPageCustomization?: object;
  };
  features: {
    examManagement: boolean;
    scriptTracking: boolean;
    analytics: boolean;
    mobileApp: boolean;
    reporting: boolean;
    integration: boolean;
    customBranding: boolean;
    advancedSecurity: boolean;
  };
  limits: {
    maxUsers: number;
    maxExams: number;
    storageQuota: number; // in GB
    apiRequestLimit: number; // per hour
    maxDepartments: number;
    maxCourses: number;
  };
  integrations: {
    sso?: SSOConfig;
    lms?: LMSConfig;
    studentInfoSystem?: SISConfig;
  };
}
```

### 3. Analytics & Reporting

- **Institution Analytics**: User metrics, structure metrics, subscription info
- **Usage Statistics**: Current usage vs limits with utilization percentages
- **Growth Trends**: User, faculty, and campus growth over time
- **Activity Monitoring**: Login patterns, engagement metrics

### 4. Billing & Subscription Management

- **Billing Information**: Current subscription, billing contact, payment data
- **Usage-Based Billing**: Calculate overages for users, storage, API calls
- **Billing Reports**: Custom date range reports with detailed breakdowns
- **Subscription Plans**: Basic, Professional, Enterprise, Custom

### 5. Integration Management

- **SSO Integration**: SAML, OAuth2, LDAP, Google Workspace, Microsoft Azure AD
- **LMS Integration**: Moodle, Blackboard, Canvas, Brightspace, custom systems
- **SIS Integration**: Banner, PeopleSoft, Colleague, custom student systems

### 6. Bulk Operations

- **Bulk Status Changes**: Activate, suspend, or delete multiple institutions
- **Bulk Subscription Updates**: Change plans for multiple institutions
- **Audit Trails**: Complete logging of all bulk operations with reasons

## API Endpoints

### Institution CRUD Operations
- `GET /api/v1/superadmin/institutions/stats` - Get institution statistics
- `GET /api/v1/superadmin/institutions` - List institutions (paginated, filtered)
- `GET /api/v1/superadmin/institutions/:id` - Get institution details
- `POST /api/v1/superadmin/institutions` - Create new institution
- `PUT /api/v1/superadmin/institutions/:id` - Update institution
- `DELETE /api/v1/superadmin/institutions/:id` - Delete institution

### Configuration Management
- `GET /api/v1/superadmin/institutions/:id/configuration` - Get configuration
- `PUT /api/v1/superadmin/institutions/:id/configuration` - Update configuration

### Analytics & Reporting
- `GET /api/v1/superadmin/institutions/:id/analytics` - Get analytics
- `GET /api/v1/superadmin/institutions/:id/usage-stats` - Get usage statistics

### Status & Feature Management
- `PATCH /api/v1/superadmin/institutions/:id/status` - Change status
- `PATCH /api/v1/superadmin/institutions/:id/features/toggle` - Toggle features

### Integration Management
- `PUT /api/v1/superadmin/institutions/:id/integrations` - Update integrations

### Billing & Subscription
- `GET /api/v1/superadmin/institutions/:id/billing` - Get billing info
- `GET /api/v1/superadmin/institutions/:id/billing/report` - Generate billing report

### Bulk Operations
- `POST /api/v1/superadmin/institutions/bulk` - Perform bulk operations

## Technical Implementation

### Service Layer Features
- **18 Service Methods**: Complete business logic for all operations
- **Redis Caching**: Intelligent caching with TTL management
- **Error Handling**: Comprehensive error handling with proper error types
- **Audit Logging**: Complete audit trail for all operations
- **Validation**: Input validation and business rule enforcement

### Controller Layer Features
- **14 Controller Methods**: HTTP request/response handling
- **Validation Rules**: express-validator rules for all endpoints
- **Standardized Responses**: Consistent success/error response format
- **Status Code Management**: Proper HTTP status codes for all scenarios

### Route Configuration
- **17 API Endpoints**: Complete route mapping with validation
- **Function-Based Routing**: Clean route organization with dependency injection
- **Middleware Integration**: Validation middleware for all endpoints

## Filters & Search

- **Search**: Name, code, short name, contact email
- **Type Filter**: University, College, High School, etc.
- **Category Filter**: Public, Private, Government, Non-profit
- **Status Filter**: Active, Inactive, Suspended, Pending
- **Pagination**: Configurable page size and navigation

## Performance Features

- **Redis Caching**: Different TTL for various data types
- **Query Optimization**: Efficient database queries with aggregations
- **Batch Processing**: Optimized bulk operations
- **Cache Invalidation**: Automatic cache clearing on updates

## Security & Audit

- **Audit Trails**: Complete logging of all operations with user tracking
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Secure error messages without sensitive data exposure
- **Status Management**: Controlled status transitions with reason tracking
