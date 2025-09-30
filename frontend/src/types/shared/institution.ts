// ========================================
// CENTRALIZED INSTITUTION TYPES
// ========================================

export enum InstitutionType {
  UNIVERSITY = "UNIVERSITY",
  TECHNICAL_UNIVERSITY = "TECHNICAL_UNIVERSITY",
  POLYTECHNIC = "POLYTECHNIC",
  COLLEGE = "COLLEGE",
  INSTITUTE = "INSTITUTE",
  OTHER = "OTHER",
}

export enum InstitutionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

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
}

// ========================================
// INSTITUTION QUERY AND RESPONSE TYPES
// ========================================

export interface InstitutionQuery {
  type?: InstitutionType;
  status?: InstitutionStatus;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "code" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface InstitutionListResponse {
  data: Institution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
