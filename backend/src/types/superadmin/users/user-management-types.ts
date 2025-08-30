export interface CreateInstitutionRequest {
  name: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'POLYTECHNIC' | 'INSTITUTE';
  category: 'PUBLIC' | 'PRIVATE' | 'MISSION';
  settings?: {
    timezone?: string;
    currency?: string;
    academicYearStart?: string;
  };
}

export interface UpdateInstitutionRequest {
  name?: string;
  type?: 'UNIVERSITY' | 'COLLEGE' | 'POLYTECHNIC' | 'INSTITUTE';
  category?: 'PUBLIC' | 'PRIVATE' | 'MISSION';
  settings?: {
    timezone?: string;
    currency?: string;
    academicYearStart?: string;
  };
}

export interface InstitutionResponse {
  id: string;
  name: string;
  type: string;
  category: string;
  settings: object;
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
