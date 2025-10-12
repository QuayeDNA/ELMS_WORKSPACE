// ========================================
// INSTITUTION TYPES FOR FRONTEND
// ========================================

export enum InstitutionType {
  UNIVERSITY = 'UNIVERSITY',
  TECHNICAL_UNIVERSITY = 'TECHNICAL_UNIVERSITY',
  POLYTECHNIC = 'POLYTECHNIC',
  COLLEGE = 'COLLEGE',
  INSTITUTE = 'INSTITUTE',
  OTHER = 'OTHER'
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

// ========================================
// INSTITUTION INTERFACES
// ========================================

export interface Institution {
  id: number;
  name: string;
  code: string;
  type: InstitutionType;
  status: InstitutionStatus;
  establishedYear?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  users?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string | null;
  }>;
  faculties?: Array<{
    id: number;
    name: string;
    code: string;
  }>;
}

// ========================================
// REQUEST/RESPONSE INTERFACES
// ========================================

export interface CreateInstitutionRequest {
  name: string;
  code: string;
  type: InstitutionType;
  establishedYear?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
}

export interface UpdateInstitutionRequest {
  name?: string;
  code?: string;
  type?: InstitutionType;
  status?: InstitutionStatus;
  establishedYear?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
}

export interface InstitutionQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: InstitutionType;
  status?: InstitutionStatus;
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InstitutionListResponse {
  institutions: Institution[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========================================
// ADMIN CREATION INTERFACES
// ========================================

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateInstitutionWithAdminRequest {
  institution: CreateInstitutionRequest;
  admin: CreateAdminRequest;
}

export interface AdminResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  institutionId: number;
}

export interface InstitutionWithAdminResponse {
  institution: Institution;
  admin: AdminResponse;
}

// ========================================
// ANALYTICS INTERFACES
// ========================================

export interface InstitutionStats {
  totalInstitutions: number;
  activeInstitutions: number;
  inactiveInstitutions: number;
  pendingInstitutions: number;
  institutionsByType: Record<InstitutionType, number>;
  recentInstitutions: Institution[];
}

export interface InstitutionSpecificAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalAdmins: number;
  totalFaculties: number;
  usersByRole: Record<string, number>;
  facultyDetails: Array<{
    id: number;
    name: string;
    code: string;
    userCount: number;
  }>;
  recentActivity: Array<{
    type: string;
    count: number;
    time: string;
  }>;
  performanceMetrics: {
    studentSatisfaction: number;
    courseCompletion: number;
    facultyRating: number;
  };
}

// ========================================
// FORM DATA INTERFACES
// ========================================

export interface InstitutionFormData {
  name: string;
  code: string;
  type: InstitutionType;
  establishedYear: string; // Form input as string
  address: string;
  city: string;
  state: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  description: string;
}

export interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

// ========================================
// UI STATE INTERFACES
// ========================================

export interface InstitutionFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: InstitutionType | 'ALL';
  status?: InstitutionStatus | 'ALL';
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  code?: string;
}

export interface InstitutionTableColumn {
  key: keyof Institution | 'actions';
  label: string;
  sortable?: boolean;
  width?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type InstitutionTypeOption = {
  value: InstitutionType;
  label: string;
  description?: string;
};

export type InstitutionStatusOption = {
  value: InstitutionStatus;
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
};

// ========================================
// CONSTANTS
// ========================================

export const INSTITUTION_TYPE_OPTIONS: InstitutionTypeOption[] = [
  {
    value: InstitutionType.UNIVERSITY,
    label: 'University',
    description: 'Traditional university offering multiple degree programs'
  },
  {
    value: InstitutionType.TECHNICAL_UNIVERSITY,
    label: 'Technical University',
    description: 'University focused on engineering and technology'
  },
  {
    value: InstitutionType.POLYTECHNIC,
    label: 'Polytechnic',
    description: 'Technical education institution'
  },
  {
    value: InstitutionType.COLLEGE,
    label: 'College',
    description: 'Undergraduate and certificate programs'
  },
  {
    value: InstitutionType.INSTITUTE,
    label: 'Institute',
    description: 'Specialized training and education'
  },
  {
    value: InstitutionType.OTHER,
    label: 'Other',
    description: 'Other types of educational institutions'
  }
];

export const INSTITUTION_STATUS_OPTIONS: InstitutionStatusOption[] = [
  {
    value: InstitutionStatus.ACTIVE,
    label: 'Active',
    color: 'green'
  },
  {
    value: InstitutionStatus.INACTIVE,
    label: 'Inactive',
    color: 'gray'
  },
  {
    value: InstitutionStatus.PENDING,
    label: 'Pending',
    color: 'yellow'
  },
  {
    value: InstitutionStatus.SUSPENDED,
    label: 'Suspended',
    color: 'red'
  }
];

// Status configuration for UI components
export const INSTITUTION_STATUS_CONFIG: Record<InstitutionStatus, {
  label: string;
  variant: string;
  className: string;
}> = {
  ACTIVE: {
    label: 'Active',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  INACTIVE: {
    label: 'Inactive',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  PENDING: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  SUSPENDED: {
    label: 'Suspended',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

export const DEFAULT_INSTITUTION_FILTERS: Required<InstitutionFilters> = {
  page: 1,
  limit: 10,
  search: '',
  type: 'ALL',
  status: 'ALL',
  sortBy: 'name',
  sortOrder: 'asc',
  code: '',
};

export const INSTITUTION_TABLE_COLUMNS: InstitutionTableColumn[] = [
  { key: 'name', label: 'Institution Name', sortable: true, width: '25%' },
  { key: 'code', label: 'Code', sortable: true, width: '10%' },
  { key: 'type', label: 'Type', sortable: true, width: '15%' },
  { key: 'status', label: 'Status', sortable: true, width: '10%' },
  { key: 'city', label: 'City', sortable: false, width: '15%' },
  { key: 'createdAt', label: 'Created', sortable: true, width: '15%' },
  { key: 'actions', label: 'Actions', sortable: false, width: '10%' }
];
