# 🏛️ Institution Management

## Overview

Institution Management provides comprehensive CRUD operations and advanced configuration capabilities for educational institutions within the ELMS ecosystem.

## Core Features

### 1. Institution CRUD Operations

```typescript
interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  status: InstitutionStatus;
  contactInfo: ContactInfo;
  configuration: InstitutionConfig;
  subscription: SubscriptionInfo;
  createdAt: Date;
  updatedAt: Date;
}

enum InstitutionType {
  UNIVERSITY = 'university',
  COLLEGE = 'college',
  HIGH_SCHOOL = 'high_school',
  TRAINING_CENTER = 'training_center'
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
interface InstitutionConfig {
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    customTheme: object;
  };
  features: {
    examManagement: boolean;
    scriptTracking: boolean;
    analytics: boolean;
    mobileApp: boolean;
  };
  limits: {
    maxUsers: number;
    maxExams: number;
    storageQuota: number;
    apiRequestLimit: number;
  };
  integrations: {
    sso: SSOConfig;
    lms: LMSConfig;
    studentInfoSystem: SISConfig;
  };
}
```

## API Endpoints

### Institution CRUD

- `GET /api/v1/superadmin/institutions` - List all institutions
- `GET /api/v1/superadmin/institutions/:id` - Get institution details
- `POST /api/v1/superadmin/institutions` - Create institution
- `PUT /api/v1/superadmin/institutions/:id` - Update institution
- `DELETE /api/v1/superadmin/institutions/:id` - Delete/deactivate institution

### Configuration Management

- `GET /api/v1/superadmin/institutions/:id/config` - Get configuration
- `PUT /api/v1/superadmin/institutions/:id/config` - Update configuration
- `POST /api/v1/superadmin/institutions/:id/features/toggle` - Toggle features

## Implementation Status

- ⏳ Planned for implementation after Dashboard & Overview
