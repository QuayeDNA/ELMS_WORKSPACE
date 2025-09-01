/**
 * Institution Management Types for Super Admin
 * 
 * Defines all TypeScript interfaces and types for institution management,
 * configuration, billing, and subscription management
 */

export enum InstitutionType {
  UNIVERSITY = 'university',
  COLLEGE = 'college',
  HIGH_SCHOOL = 'high_school',
  TRAINING_CENTER = 'training_center',
  POLYTECHNIC = 'polytechnic',
  TECHNICAL_INSTITUTE = 'technical_institute'
}

export enum InstitutionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  TRIAL = 'trial'
}

export enum InstitutionCategory {
  PUBLIC = 'public',
  PRIVATE = 'private',
  GOVERNMENT = 'government',
  NON_PROFIT = 'non_profit'
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIAL = 'trial',
  SUSPENDED = 'suspended'
}

export interface ContactInfo {
  primaryEmail: string;
  secondaryEmail?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface Address {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface InstitutionBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  customTheme?: Record<string, any>;
  customCss?: string;
}

export interface FeatureConfig {
  examManagement: boolean;
  scriptTracking: boolean;
  analytics: boolean;
  mobileApp: boolean;
  desktopApp: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  customReports: boolean;
  bulkOperations: boolean;
  advancedSecurity: boolean;
}

export interface UsageLimits {
  maxUsers: number;
  maxExams: number;
  maxConcurrentExams: number;
  storageQuota: number; // in GB
  apiRequestLimit: number; // per hour
  webhookLimit: number;
  customReportLimit: number;
}

export interface SSOConfig {
  enabled: boolean;
  provider?: 'SAML' | 'OAUTH2' | 'LDAP' | 'GOOGLE' | 'MICROSOFT';
  configuration?: Record<string, any>;
  userMapping?: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LMSConfig {
  enabled: boolean;
  provider?: 'MOODLE' | 'BLACKBOARD' | 'CANVAS' | 'BRIGHTSPACE' | 'CUSTOM';
  apiUrl?: string;
  credentials?: Record<string, any>;
  syncSettings?: {
    users: boolean;
    courses: boolean;
    grades: boolean;
  };
}

export interface SISConfig {
  enabled: boolean;
  provider?: 'BANNER' | 'PEOPLESOFT' | 'COLLEAGUE' | 'CUSTOM';
  apiUrl?: string;
  credentials?: Record<string, any>;
  syncSettings?: {
    students: boolean;
    courses: boolean;
    schedules: boolean;
  };
}

export interface IntegrationConfig {
  sso: SSOConfig;
  lms: LMSConfig;
  studentInfoSystem: SISConfig;
  customIntegrations?: Record<string, any>;
}

export interface InstitutionConfiguration {
  branding: InstitutionBranding;
  features: FeatureConfig;
  limits: UsageLimits;
  integrations: IntegrationConfig;
  customSettings?: Record<string, any>;
}

export interface BillingInfo {
  billingEmail: string;
  billingAddress: Address;
  taxId?: string;
  paymentMethod?: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'INVOICE';
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  currency: string;
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
  billing: BillingInfo;
  customPricing?: number;
  discounts?: Array<{
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    description: string;
    validUntil?: Date;
  }>;
}

export interface UsageStatistics {
  totalUsers: number;
  activeUsers: number;
  totalExams: number;
  completedExams: number;
  storageUsed: number; // in GB
  apiRequestsThisMonth: number;
  lastActivity: Date;
}

export interface Institution {
  id: string;
  name: string;
  shortName?: string;
  code: string;
  type: InstitutionType;
  category: InstitutionCategory;
  status: InstitutionStatus;
  address: Address;
  contactInfo: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  accreditation?: Record<string, any>;
  configuration: InstitutionConfiguration;
  subscription: SubscriptionInfo;
  usageStats?: UsageStatistics;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

// Request/Response interfaces
export interface CreateInstitutionRequest {
  name: string;
  shortName?: string;
  code: string;
  type: InstitutionType;
  category: InstitutionCategory;
  address: Address;
  contactInfo: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  subscriptionPlan: SubscriptionPlan;
  billingInfo: BillingInfo;
}

export interface UpdateInstitutionRequest {
  name?: string;
  shortName?: string;
  type?: InstitutionType;
  category?: InstitutionCategory;
  status?: InstitutionStatus;
  address?: Partial<Address>;
  contactInfo?: Partial<ContactInfo>;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
}

export interface UpdateConfigurationRequest {
  branding?: Partial<InstitutionBranding>;
  features?: Partial<FeatureConfig>;
  limits?: Partial<UsageLimits>;
  integrations?: Partial<IntegrationConfig>;
  customSettings?: Record<string, any>;
}

export interface InstitutionFilters {
  search?: string;
  type?: InstitutionType[];
  category?: InstitutionCategory[];
  status?: InstitutionStatus[];
  subscriptionPlan?: SubscriptionPlan[];
  region?: string[];
  createdDateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'code' | 'createdAt' | 'lastActivity' | 'userCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInstitutions {
  institutions: Institution[];
  total: number;
  hasMore: boolean;
  filters: InstitutionFilters;
  aggregations: {
    byType: Record<InstitutionType, number>;
    byCategory: Record<InstitutionCategory, number>;
    byStatus: Record<InstitutionStatus, number>;
    bySubscriptionPlan: Record<SubscriptionPlan, number>;
    byRegion: Record<string, number>;
  };
}

// Response interfaces
export interface GetInstitutionsResponse {
  data: PaginatedInstitutions;
  success: boolean;
  timestamp: string;
}

export interface GetInstitutionResponse {
  data: Institution;
  success: boolean;
  timestamp: string;
}

export interface CreateInstitutionResponse {
  data: Institution;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface UpdateInstitutionResponse {
  data: Institution;
  success: boolean;
  message: string;
  timestamp: string;
}

export interface DeleteInstitutionResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Feature toggle interfaces
export interface FeatureToggleRequest {
  feature: keyof FeatureConfig;
  enabled: boolean;
  reason?: string;
}

export interface BulkOperationRequest {
  institutionIds: string[];
  operation: 'activate' | 'suspend' | 'delete' | 'update_subscription';
  data?: any;
  reason: string;
}

export interface BulkOperationResponse {
  success: boolean;
  results: Array<{
    institutionId: string;
    success: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  timestamp: string;
}

// Cache keys
export const INSTITUTION_CACHE_KEYS = {
  LIST: 'superadmin:institutions:list',
  DETAIL: 'superadmin:institutions:detail',
  CONFIG: 'superadmin:institutions:config',
  STATS: 'superadmin:institutions:stats'
} as const;

export const INSTITUTION_CACHE_TTL = {
  LIST: 300,      // 5 minutes
  DETAIL: 600,    // 10 minutes
  CONFIG: 1800,   // 30 minutes
  STATS: 180      // 3 minutes
} as const;

// Additional response interfaces for service implementation
export interface InstitutionOverview {
  id: string;
  name: string;
  shortName: string;
  code: string;
  type: InstitutionType;
  category: InstitutionCategory;
  totalUsers: number;
  totalFaculties: number;
  totalCampuses: number;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: Date;
}

export interface InstitutionDetails {
  id: string;
  name: string;
  shortName: string;
  code: string;
  type: InstitutionType;
  category: InstitutionCategory;
  address: Address;
  contactInfo: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  timezone: string;
  language: string;
  currencies: string[];
  academicCalendar?: any;
  customFields?: any;
  configuration: InstitutionConfiguration;
  subscriptionPlan: string;
  billingEmail?: string;
  subscriptionData?: any;
  settings?: any;
  isActive: boolean;
  totalUsers: number;
  totalFaculties: number;
  totalCampuses: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: any;
  lastModifiedBy?: any;
}

export interface GetInstitutionsResponse {
  institutions: InstitutionOverview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  aggregations: {
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    bySubscriptionPlan: Record<string, number>;
    byRegion: Record<string, number>;
  };
}

export interface InstitutionStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byRegion: Record<string, number>;
}

// Validation schemas
export interface InstitutionValidationRules {
  name: { minLength: number; maxLength: number };
  code: { minLength: number; maxLength: number; pattern: RegExp };
  shortName: { maxLength: number };
  description: { maxLength: number };
  phone: { pattern: RegExp };
  email: { pattern: RegExp };
  website: { pattern: RegExp };
}
