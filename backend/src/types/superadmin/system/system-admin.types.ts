/**
 * System Administration Types
 * 
 * Type definitions for Super Admin system management operations including
 * configuration management, system health monitoring, and administrative controls
 */

// System Configuration Management
export interface SystemConfiguration {
  category: ConfigurationCategory;
  settings: Record<string, ConfigurationSetting>;
  lastUpdated: Date;
  updatedBy: string;
  version: string;
  isActive: boolean;
}

export enum ConfigurationCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  EMAIL = 'email',
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  STORAGE = 'storage',
  NOTIFICATIONS = 'notifications',
  INTEGRATIONS = 'integrations',
  PERFORMANCE = 'performance',
  MAINTENANCE = 'maintenance'
}

export interface ConfigurationSetting {
  key: string;
  value: any;
  type: ConfigurationType;
  description: string;
  isRequired: boolean;
  isSecure: boolean; // For sensitive values like API keys
  validationRules?: ValidationRule[];
  defaultValue?: any;
  environmentOverride?: string;
}

export enum ConfigurationType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
  SECRET = 'secret',
  EMAIL = 'email',
  URL = 'url',
  FILE_PATH = 'file_path'
}

export interface ValidationRule {
  type: ValidationType;
  value: any;
  message: string;
}

export enum ValidationType {
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  MIN_VALUE = 'min_value',
  MAX_VALUE = 'max_value',
  REGEX = 'regex',
  REQUIRED = 'required',
  EMAIL_FORMAT = 'email_format',
  URL_FORMAT = 'url_format'
}

// System Health Monitoring
export interface SystemHealth {
  status: SystemStatus;
  components: SystemComponent[];
  metrics: SystemMetrics;
  uptime: number; // in seconds
  lastChecked: Date;
  issues: SystemIssue[];
}

export enum SystemStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  MAINTENANCE = 'maintenance',
  DOWN = 'down'
}

export interface SystemComponent {
  name: string;
  type: ComponentType;
  status: ComponentStatus;
  responseTime?: number; // in milliseconds
  lastChecked: Date;
  metrics?: ComponentMetrics;
  dependencies?: string[];
}

export enum ComponentType {
  DATABASE = 'database',
  REDIS = 'redis',
  EMAIL_SERVICE = 'email_service',
  FILE_STORAGE = 'file_storage',
  EXTERNAL_API = 'external_api',
  BACKGROUND_JOBS = 'background_jobs',
  WEBSOCKET = 'websocket'
}

export enum ComponentStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  PARTIAL_OUTAGE = 'partial_outage',
  MAJOR_OUTAGE = 'major_outage',
  MAINTENANCE = 'maintenance'
}

export interface ComponentMetrics {
  availability: number; // percentage
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export interface SystemMetrics {
  server: ServerMetrics;
  database: DatabaseMetrics;
  application: ApplicationMetrics;
}

export interface ServerMetrics {
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  networkLatency: number; // milliseconds
  activeConnections: number;
}

export interface DatabaseMetrics {
  connectionCount: number;
  queryLatency: number;
  cacheHitRatio: number;
  diskSpaceUsed: number;
  slowQueries: number;
}

export interface ApplicationMetrics {
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
  backgroundJobs: {
    pending: number;
    processing: number;
    failed: number;
  };
}

export interface SystemIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  component: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: IssueStatus;
  affectedUsers?: number;
  resolution?: string;
}

export enum IssueType {
  PERFORMANCE = 'performance',
  AVAILABILITY = 'availability',
  SECURITY = 'security',
  DATA_INTEGRITY = 'data_integrity',
  CONFIGURATION = 'configuration',
  CAPACITY = 'capacity'
}

export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IssueStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// Database Administration
export interface DatabaseOperation {
  id: string;
  type: DatabaseOperationType;
  status: OperationStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in seconds
  performedBy: string;
  details: DatabaseOperationDetails;
  result?: DatabaseOperationResult;
}

export enum DatabaseOperationType {
  BACKUP = 'backup',
  RESTORE = 'restore',
  MIGRATION = 'migration',
  MAINTENANCE = 'maintenance',
  OPTIMIZATION = 'optimization',
  CLEANUP = 'cleanup',
  REINDEX = 'reindex',
  VACUUM = 'vacuum'
}

export enum OperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface DatabaseOperationDetails {
  tables?: string[];
  size?: number; // in bytes
  schedule?: ScheduleConfig;
  parameters?: Record<string, any>;
}

export interface DatabaseOperationResult {
  success: boolean;
  message: string;
  affectedRecords?: number;
  duration: number;
  sizeBefore?: number;
  sizeAfter?: number;
  logs?: string[];
}

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
  timezone: string;
  enabled: boolean;
}

export enum ScheduleFrequency {
  MANUAL = 'manual',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

// Cache Management
export interface CacheStatistics {
  redis: RedisStatistics;
  application: ApplicationCacheStatistics;
  database: DatabaseCacheStatistics;
}

export interface RedisStatistics {
  status: ComponentStatus;
  memory: {
    used: number;
    peak: number;
    available: number;
  };
  connections: {
    active: number;
    total: number;
  };
  operations: {
    commandsPerSecond: number;
    hitRate: number;
    missRate: number;
  };
  keyspaces: CacheKeyspace[];
}

export interface CacheKeyspace {
  database: number;
  keys: number;
  expires: number;
  averageTtl: number;
}

export interface ApplicationCacheStatistics {
  userSessions: CacheMetrics;
  apiResponses: CacheMetrics;
  databaseQueries: CacheMetrics;
  staticAssets: CacheMetrics;
}

export interface DatabaseCacheStatistics {
  queryCache: CacheMetrics;
  bufferPool: CacheMetrics;
  indexCache: CacheMetrics;
}

export interface CacheMetrics {
  size: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  averageSize: number;
}

// Security Administration
export interface SecurityConfiguration {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  encryption: EncryptionConfig;
  rateLimit: RateLimitConfig;
  audit: AuditConfig;
  compliance: ComplianceConfig;
}

export interface AuthenticationConfig {
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  passwordPolicy: PasswordPolicy;
  twoFactorAuth: TwoFactorConfig;
  ssoProviders: SSOProvider[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  prohibitCommonPasswords: boolean;
  passwordHistory: number;
  expiryDays?: number;
}

export interface TwoFactorConfig {
  enabled: boolean;
  required: boolean;
  methods: TwoFactorMethod[];
  backupCodes: boolean;
}

export enum TwoFactorMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  HARDWARE_TOKEN = 'hardware_token'
}

export interface SSOProvider {
  id: string;
  name: string;
  type: SSOProviderType;
  enabled: boolean;
  configuration: Record<string, any>;
}

export enum SSOProviderType {
  SAML = 'saml',
  OAUTH2 = 'oauth2',
  OIDC = 'oidc',
  LDAP = 'ldap'
}

export interface AuthorizationConfig {
  rbacEnabled: boolean;
  defaultRole: string;
  roleInheritance: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  IN = 'in',
  NOT_IN = 'not_in',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than'
}

export interface EncryptionConfig {
  algorithm: string;
  keyRotation: KeyRotationConfig;
  dataAtRest: boolean;
  dataInTransit: boolean;
}

export interface KeyRotationConfig {
  enabled: boolean;
  frequency: number; // in days
  retainOldKeys: number; // number of old keys to retain
}

export interface RateLimitConfig {
  enabled: boolean;
  global: RateLimitRule;
  perUser: RateLimitRule;
  perIP: RateLimitRule;
  perEndpoint: Record<string, RateLimitRule>;
}

export interface RateLimitRule {
  requests: number;
  period: number; // in seconds
  blockDuration: number; // in seconds
}

export interface AuditConfig {
  enabled: boolean;
  logLevel: AuditLogLevel;
  retention: number; // in days
  storage: AuditStorageType;
  sensitiveFields: string[];
}

export enum AuditLogLevel {
  BASIC = 'basic',
  DETAILED = 'detailed',
  VERBOSE = 'verbose'
}

export enum AuditStorageType {
  DATABASE = 'database',
  FILE = 'file',
  EXTERNAL = 'external'
}

export interface ComplianceConfig {
  gdprEnabled: boolean;
  dataRetention: DataRetentionPolicy;
  consentManagement: ConsentConfig;
  dataExport: DataExportConfig;
}

export interface DataRetentionPolicy {
  defaultRetention: number; // in days
  userDataRetention: number;
  auditLogRetention: number;
  backupRetention: number;
}

export interface ConsentConfig {
  required: boolean;
  granular: boolean;
  withdrawalEnabled: boolean;
  cookieConsent: boolean;
}

export interface DataExportConfig {
  formats: string[];
  encryption: boolean;
  maxFileSize: number; // in MB
  batchSize: number;
}

// System Maintenance
export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  affectedServices: string[];
  notificationsSent: boolean;
  createdBy: string;
  tasks: MaintenanceTask[];
}

export enum MaintenanceType {
  SCHEDULED = 'scheduled',
  EMERGENCY = 'emergency',
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective'
}

export enum MaintenanceStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed'
}

// API Requests and Responses
export interface SystemConfigurationRequest {
  category: ConfigurationCategory;
  settings: Record<string, any>;
  validate?: boolean;
}

export interface SystemHealthRequest {
  components?: ComponentType[];
  includeMetrics?: boolean;
  detailed?: boolean;
}

export interface DatabaseOperationRequest {
  type: DatabaseOperationType;
  tables?: string[];
  schedule?: ScheduleConfig;
  parameters?: Record<string, any>;
}

export interface MaintenanceWindowRequest {
  title: string;
  description: string;
  type: MaintenanceType;
  scheduledStart: Date;
  scheduledEnd: Date;
  affectedServices: string[];
  tasks: Omit<MaintenanceTask, 'id' | 'status' | 'startedAt' | 'completedAt'>[];
  notifyUsers?: boolean;
}

export interface CacheManagementRequest {
  operation: CacheOperation;
  target?: CacheTarget;
  pattern?: string;
}

export enum CacheOperation {
  CLEAR = 'clear',
  FLUSH = 'flush',
  REBUILD = 'rebuild',
  ANALYZE = 'analyze'
}

export enum CacheTarget {
  ALL = 'all',
  USER_SESSIONS = 'user_sessions',
  API_RESPONSES = 'api_responses',
  DATABASE_QUERIES = 'database_queries',
  STATIC_ASSETS = 'static_assets'
}
