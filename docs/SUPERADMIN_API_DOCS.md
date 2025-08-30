# ELMS Super Admin API Documentation

## Overview

This document provides comprehensive documentation for the Super Admin API endpoints
implemented in the ELMS (Electronic Learning Management System) backend. All endpoints
require authentication and Super Admin role permissions.

## Base URL

```bash
/api/superadmin
```

## Authentication

All endpoints require a valid JWT token with Super Admin role in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}
```

## Common Types

```typescript
// User Roles
type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'LECTURER' | 'STUDENT';

// Entity Types for Audit Logs
type EntityType = 'USER' | 'STUDENT' | 'LECTURER' | 'COURSE' | 'EXAM_SESSION' |
  'SCRIPT' | 'INCIDENT' | 'BATCH' | 'VENUE' | 'ROOM';

// Audit Actions
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' |
  'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'PERMISSION_GRANT' | 'PERMISSION_REVOKE' |
  'DATA_EXPORT' | 'DATA_IMPORT' | 'SYSTEM_ACCESS';

// Pagination
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Error Response
interface ErrorResponse {
  error: string;
  details?: any;
}

// Success Response
interface SuccessResponse<T = any> {
  message: string;
  data?: T;
}
```

---

## 1. SYSTEM MANAGEMENT

### 1.1 Create System Backup

**Endpoint:** `POST /system/backup`

**Description:** Initiates a system backup process.

**Request Body:**

```typescript
interface CreateBackupRequest {
  type?: 'full' | 'incremental' | 'database';
  includeFiles?: boolean;
}
```

**Response:**

```typescript
interface BackupInfo {
  id: string;
  type: string;
  includeFiles: boolean;
  status: 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  estimatedCompletion: string;
}

interface CreateBackupResponse {
  message: string;
  backup: BackupInfo;
}
```

**Example Request:**

```typescript
POST /api/superadmin/system/backup
Content-Type: application/json

{
  "type": "full",
  "includeFiles": true
}
```

**Example Response:**

```json
{
  "message": "Backup initiated successfully",
  "backup": {
    "id": "backup_1727894400000",
    "type": "full",
    "includeFiles": true,
    "status": "in_progress",
    "createdAt": "2024-08-29T12:00:00.000Z",
    "estimatedCompletion": "2024-08-29T12:05:00.000Z"
  }
}
```

### 1.2 Get Backup Status/List

**Endpoint:** `GET /system/backups`

**Description:** Retrieves the list of system backups.

**Response:**

```typescript
interface BackupRecord {
  id: string;
  type: 'full' | 'incremental' | 'database';
  status: 'completed' | 'failed' | 'in_progress';
  size?: string;
  createdAt: string;
  completedAt?: string;
}

interface GetBackupsResponse {
  backups: BackupRecord[];
}
```

**Example Response:**

```json
{
  "backups": [
    {
      "id": "backup_001",
      "type": "full",
      "status": "completed",
      "size": "2.5GB",
      "createdAt": "2024-08-28T12:00:00.000Z",
      "completedAt": "2024-08-28T12:05:00.000Z"
    }
  ]
}
```

### 1.3 Update System Maintenance Mode

**Endpoint:** `PUT /system/maintenance`

**Description:** Enables or disables system maintenance mode.

**Request Body:**

```typescript
interface MaintenanceRequest {
  enabled: boolean;
  message?: string;
  estimatedDuration?: number; // in minutes
}
```

**Response:**

```typescript
interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  estimatedDuration: number | null;
  updatedAt: string;
  updatedBy: string;
}

interface MaintenanceResponse {
  message: string;
  maintenance: MaintenanceConfig;
}
```

**Example Request:**

```typescript
PUT /api/superadmin/system/maintenance
Content-Type: application/json

{
  "enabled": true,
  "message": "Scheduled maintenance for system updates",
  "estimatedDuration": 60
}
```

### 1.4 Get System Maintenance Status

**Endpoint:** `GET /system/maintenance`

**Description:** Retrieves current maintenance mode status.

**Response:**

```typescript
interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedDuration: number | null;
  lastUpdated: string;
}
```

---

## 2. SECURITY MANAGEMENT

### 2.1 Get Security Policies

**Endpoint:** `GET /security/policies`

**Description:** Retrieves all security policy configurations.

**Response:**

```typescript
interface SecurityPolicies {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    maxAge: number;
  };
  sessionPolicy: {
    timeout: number;
    maxConcurrentSessions: number;
    requireMFA: boolean;
    allowRememberMe: boolean;
  };
  accessPolicy: {
    maxLoginAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
    ipBlacklist: string[];
    allowedCountries: string[];
  };
  auditPolicy: {
    retentionPeriod: number;
    enableRealTimeAlerts: boolean;
    alertOnSuspiciousActivity: boolean;
  };
}
```

### 2.2 Update Security Policies

**Endpoint:** `PUT /security/policies`

**Description:** Updates security policy configurations.

**Request Body:**

```typescript
interface UpdateSecurityPoliciesRequest {
  section: 'passwordPolicy' | 'sessionPolicy' | 'accessPolicy' | 'auditPolicy';
  policies: Record<string, any>;
}
```

**Response:**

```typescript
interface UpdateSecurityPoliciesResponse {
  message: string;
  section: string;
  policies: Record<string, any>;
}
```

### 2.3 Get Security Incidents

**Endpoint:** `GET /security/incidents`

**Query Parameters:**

- `status` (optional): Filter by incident status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**

```typescript
interface SecurityIncident {
  id: string;
  type: AuditAction;
  severity: 'low' | 'medium' | 'high';
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: string;
}

interface GetSecurityIncidentsResponse {
  incidents: SecurityIncident[];
  pagination: PaginationInfo;
}
```

---

## 3. ANALYTICS

### 3.1 Get Basic Analytics

**Endpoint:** `GET /analytics`

**Query Parameters:**

- `startDate` (optional): Start date for analytics period
- `endDate` (optional): End date for analytics period

**Response:**

```typescript
interface BasicAnalytics {
  userGrowth: Array<{
    month: string;
    count: number;
  }>;
  examStats: {
    total: number;
    averageDuration: number;
  };
  institutionStats: {
    total: number;
  };
  regionalStats: Array<{
    region: string;
    institution_count: number;
  }>;
  recentActivity: Array<{
    id: string;
    user: {
      firstName: string;
      lastName: string;
    } | null;
    action: AuditAction;
    entityType: EntityType;
    createdAt: string;
  }>;
}
```

### 3.2 Get Analytics Overview

**Endpoint:** `GET /analytics/overview`

**Query Parameters:**

- `period` (optional): Time period ('7d', '30d', '90d') - default: '30d'

**Response:**

```typescript
interface AnalyticsOverview {
  overview: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    recentActivity: number;
  };
  roleDistribution: Array<{
    role: UserRole;
    count: number;
  }>;
  systemHealth: {
    database: { status: string; responseTime: string; };
    redis: { status: string; responseTime: string; };
    api: { status: string; uptime: string; };
  };
  period: string;
}
```

### 3.3 Get User Activity Analytics

**Endpoint:** `GET /analytics/user-activity`

**Query Parameters:**

- `startDate` (optional): Start date
- `endDate` (optional): End date
- `groupBy` (optional): Grouping ('day', 'hour', 'week') - default: 'day'

**Response:**

```typescript
interface UserActivityAnalytics {
  activity: Array<{
    date: string;
    logins: number;
    uniqueUsers: number;
  }>;
  summary: {
    totalLogins: number;
    uniqueUsers: number;
    period: {
      start: string;
      end: string;
    };
  };
}
```

### 3.4 Get Performance Metrics

**Endpoint:** `GET /analytics/performance`

**Description:** Retrieves system performance metrics.

**Response:**

```typescript
interface PerformanceMetrics {
  apiResponseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  databaseQueryTime: {
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: {
    percentage: number;
    errorsPerHour: number;
  };
}
```

### 3.5 Get Security Analytics

**Endpoint:** `GET /analytics/security`

**Query Parameters:**

- `period` (optional): Time period ('7d', '30d') - default: '7d'

**Response:**

```typescript
interface SecurityAnalytics {
  events: {
    total: number;
    failedLogins: number;
    successfulLogins: number;
  };
  sessions: {
    active: number;
    averagePerUser: number;
  };
  threats: {
    suspiciousActivities: number;
    blockedIPs: number;
    rateLimited: number;
  };
  compliance: {
    mfaEnabled: number;
    passwordStrength: string;
    lastSecurityAudit: string;
  };
}
```

### 3.6 Export Analytics Data

**Endpoint:** `GET /analytics/export`

**Query Parameters:**

- `type` (optional): Export type ('overview', 'users', 'security') - default: 'overview'
- `format` (optional): Export format ('json', 'csv', 'pdf') - default: 'json'
- `startDate` (optional): Start date for export period
- `endDate` (optional): End date for export period

**Response:**

```typescript
interface ExportAnalyticsResponse {
  type: string;
  format: string;
  period: {
    start: string;
    end: string;
  };
  status: 'generating' | 'completed' | 'failed';
  estimatedCompletion: string;
  downloadUrl: string | null;
}
```

---

## 4. INSTITUTION MANAGEMENT

### 4.1 Get All Institutions

**Endpoint:** `GET /institutions`

**Query Parameters:**

- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 50
- `type` (optional): Filter by institution type
- `status` (optional): Filter by status
- `search` (optional): Search term

**Response:**

```typescript
interface Institution {
  id: string;
  name: string;
  type: string;
  status: string;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  adminUser: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  stats: {
    totalStudents: number;
    totalLecturers: number;
    totalCourses: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface GetInstitutionsResponse {
  institutions: Institution[];
  pagination: PaginationInfo;
}
```

### 4.2 Get Institution Details

**Endpoint:** `GET /institutions/:id`

**Path Parameters:**

- `id`: Institution ID

**Response:**

```typescript
interface InstitutionDetails extends Institution {
  description: string;
  establishedDate: string;
  accreditation: string[];
  facilities: string[];
  departments: Array<{
    id: string;
    name: string;
    head: {
      id: string;
      name: string;
    };
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}
```

### 4.3 Create Institution

**Endpoint:** `POST /institutions`

**Request Body:**

```typescript
interface CreateInstitutionRequest {
  name: string;
  type: string;
  description?: string;
  address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  adminUserId: string;
  establishedDate?: string;
  accreditation?: string[];
  facilities?: string[];
}
```

**Response:**

```typescript
interface CreateInstitutionResponse {
  message: string;
  institution: Institution;
}
```

### 4.4 Update Institution

**Endpoint:** `PUT /institutions/:id`

**Path Parameters:**

- `id`: Institution ID

**Request Body:**

```typescript
interface UpdateInstitutionRequest {
  name?: string;
  type?: string;
  description?: string;
  address?: Partial<{
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
  }>;
  contactInfo?: Partial<{
    phone: string;
    email: string;
    website: string;
  }>;
  adminUserId?: string;
  establishedDate?: string;
  accreditation?: string[];
  facilities?: string[];
}
```

**Response:**

```typescript
interface UpdateInstitutionResponse {
  message: string;
  institution: Institution;
}
```

### 4.5 Delete Institution

**Endpoint:** `DELETE /institutions/:id`

**Path Parameters:**

- `id`: Institution ID

**Response:**

```typescript
interface DeleteInstitutionResponse {
  message: string;
  institutionId: string;
}
```

---

## 5. USER MANAGEMENT

### 5.1 Create Institution

**Endpoint:** `POST /users/institutions`

**Request Body:**

```typescript
interface CreateInstitutionRequest {
  name: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'POLYTECHNIC' | 'INSTITUTE';
  category: 'PUBLIC' | 'PRIVATE' | 'MISSION';
  settings?: {
    timezone?: string;
    currency?: string;
    academicYearStart?: string;
  };
}
```

**Response:**

```typescript
interface InstitutionResponse {
  id: string;
  name: string;
  type: string;
  category: string;
  settings: object;
  createdAt: string;
  updatedAt: string;
}
```

### 5.2 Get All Institutions

**Endpoint:** `GET /users/institutions`

**Response:**

```typescript
interface GetInstitutionsResponse {
  institutions: InstitutionResponse[];
}
```

### 5.3 Update Institution

**Endpoint:** `PUT /users/institutions/:id`

**Path Parameters:**

- `id`: Institution ID

**Request Body:** Same as CreateInstitutionRequest (all fields optional)

**Response:** Same as InstitutionResponse

### 5.4 Delete Institution

**Endpoint:** `DELETE /users/institutions/:id`

**Path Parameters:**

- `id`: Institution ID

**Response:**

```typescript
interface DeleteInstitutionResponse {
  message: string;
}
```

### 5.5 Get Users by Institution

**Endpoint:** `GET /users/institutions/:institutionId/users`

**Path Parameters:**

- `institutionId`: Institution ID

**Query Parameters:**

- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 10
- `role` (optional): Filter by user role
- `status` (optional): Filter by user status
- `department` (optional): Filter by department

**Response:**

```typescript
interface UserSummary {
  id: string;
  email: string;
  role: string;
  status: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    department?: string;
  };
  lastActivityAt?: string;
}

interface GetUsersResponse {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
}
```

### 5.6 Update User Status

**Endpoint:** `PUT /users/status`

**Request Body:**

```typescript
interface UpdateUserStatusRequest {
  userId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}
```

**Response:**

```typescript
interface UpdateUserStatusResponse {
  message: string;
}
```

### 5.7 Bulk Update Users

**Endpoint:** `PUT /users/bulk`

**Request Body:**

```typescript
interface BulkUpdateUsersRequest {
  userIds: string[];
  action: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND';
}
```

**Response:**

```typescript
interface BulkUpdateUsersResponse {
  message: string;
}
```

---

## 6. AUDIT LOGS

### 5.1 Get Audit Logs

**Endpoint:** `GET /audit-logs`

**Query Parameters:**

- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 50
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `entityType` (optional): Filter by entity type
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `search` (optional): Search term

**Response:**

```typescript
interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

interface GetAuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: PaginationInfo;
}
```

### 5.2 Get Audit Log Statistics

**Endpoint:** `GET /audit-logs/stats`

**Query Parameters:**

- `period` (optional): Time period ('7d', '30d', '90d') - default: '30d'

**Response:**

```typescript
interface AuditStats {
  totalLogs: number;
  actionsByType: Record<AuditAction, number>;
  entitiesByType: Record<EntityType, number>;
  logsByDay: Array<{
    date: string;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    user: {
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      } | null;
    };
    actionCount: number;
  }>;
  recentActivity: AuditLogEntry[];
}
```

---

## 6. USER MANAGEMENT

### 6.1 Get Users (Advanced Filtering)

**Endpoint:** `GET /users`

**Query Parameters:**

- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 20
- `role` (optional): Filter by user role
- `status` (optional): Filter by user status ('active', 'inactive', 'suspended')
- `search` (optional): Search by name, email, or username
- `sortBy` (optional): Sort field ('createdAt', 'lastLogin', 'email') - default: 'createdAt'
- `sortOrder` (optional): Sort order ('asc', 'desc') - default: 'desc'
- `institutionId` (optional): Filter by institution
- `department` (optional): Filter by department
- `lastLoginBefore` (optional): Filter users who haven't logged in since date
- `lastLoginAfter` (optional): Filter users who logged in after date

**Response:**

```typescript
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: {
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
  } | null;
  bio: string | null;
  avatar: string | null;
  emergencyContact: {
    name: string | null;
    phone: string | null;
    relationship: string | null;
  } | null;
}

interface UserDevice {
  id: string;
  platform: 'WEB' | 'MOBILE_IOS' | 'MOBILE_ANDROID' | 'DESKTOP';
  lastUsed: string | null;
  isActive: boolean;
}

interface UserSummary {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  mfaEnabled: boolean;
  lastLogin: string | null;
  profile: UserProfile | null;
  devices: UserDevice[];
  institution: {
    id: string;
    name: string;
  } | null;
  stats: {
    totalLogins: number;
    lastActivity: string;
    accountAge: number; // in days
  };
  createdAt: string;
  updatedAt: string;
}

interface GetUsersResponse {
  users: UserSummary[];
  pagination: PaginationInfo;
  filters: {
    applied: Record<string, any>;
    available: {
      roles: UserRole[];
      institutions: Array<{ id: string; name: string; }>;
      departments: string[];
    };
  };
}
```

### 6.2 Bulk Create Users

**Endpoint:** `POST /users/bulk`

**Description:** Creates multiple users in a single request.

**Request Body:**

```typescript
interface CreateUserData {
  email: string;
  username?: string;
  password: string;
  role: UserRole;
  profile?: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  };
  institutionId?: string;
  department?: string;
  sendWelcomeEmail?: boolean;
}

interface BulkCreateUsersRequest {
  users: CreateUserData[];
  options?: {
    skipDuplicates?: boolean;
    sendWelcomeEmails?: boolean;
    defaultPassword?: string;
  };
}
```

**Response:**

```typescript
interface BulkCreateUsersResponse {
  success: number;
  failed: number;
  results: Array<{
    index: number;
    user?: UserSummary;
    error?: string;
  }>;
  errors: Array<{
    index: number;
    error: string;
    data: CreateUserData;
  }>;
}
```

### 6.3 Get User Details

**Endpoint:** `GET /users/:id`

**Path Parameters:**

- `id`: User ID

**Response:**

```typescript
interface UserDetails extends UserSummary {
  sessions: Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    isActive: boolean;
  }>;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    grantedAt: string;
    grantedBy: {
      id: string;
      email: string;
    };
  }>;
  activity: {
    totalLogins: number;
    lastLogin: string | null;
    lastLoginIP: string | null;
    lastLoginDevice: string | null;
    accountAge: number;
    loginStreak: number;
    averageSessionDuration: number;
  };
  security: {
    passwordChangedAt: string;
    passwordStrength: 'weak' | 'medium' | 'strong';
    mfaEnabled: boolean;
    backupCodesCount: number;
    loginAttempts: number;
    lockedUntil: string | null;
  };
}
```

### 6.4 Update User

**Endpoint:** `PUT /users/:id`

**Path Parameters:**

- `id`: User ID

**Request Body:**

```typescript
interface UpdateUserRequest {
  email?: string;
  username?: string;
  role?: UserRole;
  isActive?: boolean;
  profile?: Partial<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    address: {
      street: string;
      city: string;
      region: string;
      country: string;
      postalCode: string;
    };
    bio: string;
    avatar: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  }>;
  institutionId?: string;
  department?: string;
  forcePasswordChange?: boolean;
  mfaEnabled?: boolean;
}
```

**Response:**

```typescript
interface UpdateUserResponse {
  message: string;
  user: UserSummary;
  changes: Record<string, { from: any; to: any; }>;
}
```

### 6.5 Delete User

**Endpoint:** `DELETE /users/:id`

**Path Parameters:**

- `id`: User ID

**Query Parameters:**

- `hardDelete` (optional): If true, permanently deletes user data - default: false

**Response:**

```typescript
interface DeleteUserResponse {
  message: string;
  userId: string;
  action: 'soft_deleted' | 'hard_deleted';
}
```

---

## Frontend Integration Examples

### TypeScript API Client

```typescript
// types/superadmin.ts
export interface SuperAdminAPI {
  // System Management
  createBackup(data: CreateBackupRequest): Promise<CreateBackupResponse>;
  getBackups(): Promise<GetBackupsResponse>;
  updateMaintenance(data: MaintenanceRequest): Promise<MaintenanceResponse>;
  getMaintenance(): Promise<MaintenanceStatus>;

  // Security Management
  getSecurityPolicies(): Promise<SecurityPolicies>;
  updateSecurityPolicies(data: UpdateSecurityPoliciesRequest): Promise<UpdateSecurityPoliciesResponse>;
  getSecurityIncidents(params?: { status?: string; page?: number; limit?: number }): Promise<GetSecurityIncidentsResponse>;

  // Analytics
  getAnalytics(params?: { startDate?: string; endDate?: string }): Promise<BasicAnalytics>;
  getAnalyticsOverview(params?: { period?: string }): Promise<AnalyticsOverview>;
  getUserActivity(params?: { startDate?: string; endDate?: string; groupBy?: string }): Promise<UserActivityAnalytics>;
  getPerformanceMetrics(): Promise<PerformanceMetrics>;
  getSecurityAnalytics(params?: { period?: string }): Promise<SecurityAnalytics>;
  exportAnalytics(params?: { type?: string; format?: string; startDate?: string; endDate?: string }): Promise<ExportAnalyticsResponse>;

  // Institution Management
  getInstitutions(params?: { page?: number; limit?: number; type?: string; status?: string; search?: string }): Promise<GetInstitutionsResponse>;
  getInstitution(id: string): Promise<InstitutionDetails>;
  createInstitution(data: CreateInstitutionRequest): Promise<CreateInstitutionResponse>;
  updateInstitution(id: string, data: UpdateInstitutionRequest): Promise<UpdateInstitutionResponse>;
  deleteInstitution(id: string): Promise<DeleteInstitutionResponse>;

  // Audit Logs
  getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: AuditAction;
    entityType?: EntityType;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<GetAuditLogsResponse>;
  getAuditStats(params?: { period?: string }): Promise<AuditStats>;

  // User Management
  getUsers(params?: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    institutionId?: string;
    department?: string;
    lastLoginBefore?: string;
    lastLoginAfter?: string;
  }): Promise<GetUsersResponse>;
  bulkCreateUsers(data: BulkCreateUsersRequest): Promise<BulkCreateUsersResponse>;
  getUser(id: string): Promise<UserDetails>;
  updateUser(id: string, data: UpdateUserRequest): Promise<UpdateUserResponse>;
  deleteUser(id: string, params?: { hardDelete?: boolean }): Promise<DeleteUserResponse>;
}
```

### React Hook Example

```typescript
// hooks/useSuperAdmin.ts
import { useState, useEffect } from 'react';
import { SuperAdminAPI } from '../types/superadmin';

export function useSuperAdminUsers(params?: Parameters<SuperAdminAPI['getUsers']>[0]) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await superAdminAPI.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(params)]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers
  };
}
```

### Error Handling

```typescript
// utils/errorHandler.ts
export function handleSuperAdminError(error: any): string {
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error.response?.status === 422) {
    return 'Invalid data provided. Please check your input.';
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  return 'An unexpected error occurred. Please try again.';
}
```

---

## Phase 2: Advanced Features (Planned)

### 7. ADVANCED REPORTING

#### 7.1 Custom Report Builder

**Endpoint:** `POST /reports/custom`

- Create custom reports with filters and aggregations

#### 7.2 Scheduled Reports

**Endpoint:** `POST /reports/scheduled`

- Set up automated report generation and delivery

#### 7.3 Report Templates

**Endpoint:** `GET /reports/templates`

- Pre-built report templates for common use cases

### 8. REAL-TIME MONITORING

#### 8.1 System Health Dashboard

**Endpoint:** `GET /monitoring/health`

- Real-time system health metrics

#### 8.2 Live Activity Feed

**Endpoint:** `GET /monitoring/activity`

- WebSocket-based live activity monitoring

#### 8.3 Alert Management

**Endpoint:** `GET /monitoring/alerts`

- Configure and manage system alerts

### 9. DATA MANAGEMENT

#### 9.1 Data Import/Export

**Endpoint:** `POST /data/import`

- Bulk data import with validation

#### 9.2 Data Backup & Recovery

**Endpoint:** `POST /data/recovery`

- Point-in-time data recovery

#### 9.3 Data Archiving

**Endpoint:** `POST /data/archive`

- Long-term data archiving

### 10. INTEGRATION MANAGEMENT

#### 10.1 External API Integrations

**Endpoint:** `GET /integrations`

- Manage third-party API integrations

#### 10.2 Webhook Management

**Endpoint:** `POST /webhooks`

- Configure webhook endpoints for events

#### 10.3 SSO Configuration

**Endpoint:** `PUT /auth/sso`

- Configure Single Sign-On providers

---

## Best Practices

### 1. Error Handling

- Always check response status codes
- Handle network errors gracefully
- Provide user-friendly error messages

### 2. Pagination

- Use pagination for large datasets
- Implement proper loading states
- Cache results when appropriate

### 3. Authentication

- Include JWT token in all requests
- Handle token expiration
- Implement token refresh logic

### 4. Performance

- Use appropriate query parameters to limit data
- Implement caching for frequently accessed data
- Use WebSocket for real-time features when available

### 5. Security

- Validate all input data
- Use HTTPS for all API calls
- Implement proper CORS policies

---

## Changelog

### Version 1.0.0 (Current)

- ✅ Complete system management endpoints
- ✅ Comprehensive security management
- ✅ Advanced analytics and reporting
- ✅ Full institution management
- ✅ Detailed audit logging
- ✅ Advanced user management with bulk operations

### Version 2.0.0 (Planned)

- 🔄 Advanced reporting and custom dashboards
- 🔄 Real-time monitoring and alerting
- 🔄 Enhanced data management capabilities
- 🔄 Third-party integrations
- 🔄 Advanced security features

---

> **Note:** This documentation is automatically generated and maintained. Last updated: August 29, 2025
