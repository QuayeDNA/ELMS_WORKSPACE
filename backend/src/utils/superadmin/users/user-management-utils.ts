import { CreateInstitutionRequest, UpdateInstitutionRequest, GetUsersRequest } from '../../../types/superadmin/users/user-management-types';

export const validateInstitutionData = (data: CreateInstitutionRequest | UpdateInstitutionRequest): boolean => {
  if (!data.name || data.name.trim().length === 0) return false;
  if (data.type && !['UNIVERSITY', 'COLLEGE', 'POLYTECHNIC', 'INSTITUTE'].includes(data.type)) return false;
  if (data.category && !['PUBLIC', 'PRIVATE'].includes(data.category)) return false;
  return true;
};

export const validatePagination = (page: number, limit: number): { page: number; limit: number } => {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  return { page: validPage, limit: validLimit };
};

export const buildUserFilter = (query: GetUsersRequest) => {
  const filter: any = {};
  if (query.role) filter.role = query.role;
  return filter;
};

export const calculateOffset = (page: number, limit: number): number => (page - 1) * limit;