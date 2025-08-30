import { InstitutionType, InstitutionCategory } from '@prisma/client';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  emergencyContact?: string;
}

export interface AcademicCalendar {
  academicYearStart?: string;
  academicYearEnd?: string;
  semesterStart?: string;
  semesterEnd?: string;
  holidays?: string[];
}

export interface InstitutionConfig {
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface CreateInstitutionRequest {
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, any>;
  config?: InstitutionConfig;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateInstitutionRequest {
  name?: string;
  type?: InstitutionType;
  category?: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, any>;
  config?: InstitutionConfig;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface InstitutionResponse {
  id: string;
  name: string;
  type: InstitutionType;
  category: InstitutionCategory;
  code?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  logo?: string;
  motto?: string;
  description?: string;
  establishedYear?: number;
  charter?: string;
  accreditation?: string;
  affiliations?: string[];
  timezone?: string;
  language?: string;
  currencies?: string[];
  academicCalendar?: AcademicCalendar;
  customFields?: Record<string, any>;
  config?: InstitutionConfig;
  settings?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
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

export interface GetUsersRequest {
  institutionId: string;
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  department?: string;
}

export interface GetUsersResponse {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserStatusRequest {
  userId: string;
  status: 'ACTIVE' | 'INACTIVE'; // Simplified to match User.isActive
}

export interface BulkUpdateUsersRequest {
  userIds: string[];
  action: 'ACTIVATE' | 'DEACTIVATE'; // Simplified to match User.isActive
}

export interface UserManagementError {
  message: string;
  code: string;
}
