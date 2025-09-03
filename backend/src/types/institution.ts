// ========================================
// INSTITUTION TYPES
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
  createdAt: Date;
  updatedAt: Date;
}

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

export interface InstitutionStats {
  totalInstitutions: number;
  activeInstitutions: number;
  inactiveInstitutions: number;
  pendingInstitutions: number;
  institutionsByType: Record<InstitutionType, number>;
  recentInstitutions: Institution[];
}

// ========================================
// ADMIN REGISTRATION WITH INSTITUTION
// ========================================

export interface CreateInstitutionWithAdminRequest {
  // Institution data
  institution: CreateInstitutionRequest;
  
  // Admin user data
  admin: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  };
}

export interface InstitutionWithAdminResponse {
  institution: Institution;
  admin: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    institutionId: number;
  };
  temporaryPassword?: string; // If password was auto-generated
}
