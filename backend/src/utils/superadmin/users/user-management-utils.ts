import { CreateInstitutionRequest, UpdateInstitutionRequest, GetUsersRequest, Address, ContactInfo, AcademicCalendar } from '../../../types/superadmin/users/user-management-types';
import { InstitutionType, InstitutionCategory } from '@prisma/client';

export const validateInstitutionData = (data: CreateInstitutionRequest | UpdateInstitutionRequest): boolean => {
  // Required fields validation
  if (!data.name || data.name.trim().length === 0) return false;
  if (!data.type || !Object.values(InstitutionType).includes(data.type)) return false;
  if (!data.category || !Object.values(InstitutionCategory).includes(data.category)) return false;

  // Optional field validations
  if (data.code && (typeof data.code !== 'string' || data.code.trim().length === 0)) return false;
  if (data.logo && (typeof data.logo !== 'string' || data.logo.trim().length === 0)) return false;
  if (data.motto && (typeof data.motto !== 'string' || data.motto.trim().length === 0)) return false;
  if (data.description && (typeof data.description !== 'string' || data.description.trim().length === 0)) return false;
  if (data.establishedYear && (typeof data.establishedYear !== 'number' || data.establishedYear < 1800 || data.establishedYear > new Date().getFullYear())) return false;
  if (data.charter && (typeof data.charter !== 'string' || data.charter.trim().length === 0)) return false;
  if (data.accreditation && (typeof data.accreditation !== 'string' || data.accreditation.trim().length === 0)) return false;
  if (data.affiliations && (!Array.isArray(data.affiliations) || !data.affiliations.every(aff => typeof aff === 'string'))) return false;
  if (data.timezone && (typeof data.timezone !== 'string' || data.timezone.trim().length === 0)) return false;
  if (data.language && (typeof data.language !== 'string' || data.language.trim().length === 0)) return false;
  if (data.currencies && (!Array.isArray(data.currencies) || !data.currencies.every(curr => typeof curr === 'string'))) return false;
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') return false;

  // Nested object validations
  if (data.address && !validateAddress(data.address)) return false;
  if (data.contactInfo && !validateContactInfo(data.contactInfo)) return false;
  if (data.academicCalendar && !validateAcademicCalendar(data.academicCalendar)) return false;

  return true;
};

export const validateAddress = (address: Address): boolean => {
  if (address.street && typeof address.street !== 'string') return false;
  if (address.city && typeof address.city !== 'string') return false;
  if (address.state && typeof address.state !== 'string') return false;
  if (address.country && typeof address.country !== 'string') return false;
  if (address.postalCode && typeof address.postalCode !== 'string') return false;
  return true;
};

export const validateContactInfo = (contactInfo: ContactInfo): boolean => {
  if (contactInfo.phone && typeof contactInfo.phone !== 'string') return false;
  if (contactInfo.email && (typeof contactInfo.email !== 'string' || !isValidEmail(contactInfo.email))) return false;
  if (contactInfo.website && (typeof contactInfo.website !== 'string' || !isValidUrl(contactInfo.website))) return false;
  if (contactInfo.emergencyContact && typeof contactInfo.emergencyContact !== 'string') return false;
  return true;
};

export const validateAcademicCalendar = (calendar: AcademicCalendar): boolean => {
  if (calendar.academicYearStart && typeof calendar.academicYearStart !== 'string') return false;
  if (calendar.academicYearEnd && typeof calendar.academicYearEnd !== 'string') return false;
  if (calendar.semesterStart && typeof calendar.semesterStart !== 'string') return false;
  if (calendar.semesterEnd && typeof calendar.semesterEnd !== 'string') return false;
  if (calendar.holidays && (!Array.isArray(calendar.holidays) || !calendar.holidays.every(h => typeof h === 'string'))) return false;
  return true;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePagination = (page: number, limit: number): { page: number; limit: number } => {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  return { page: validPage, limit: validLimit };
};

export const buildUserFilter = (query: GetUsersRequest) => {
  const filter: any = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.isActive = query.status === 'ACTIVE';
  if (query.department) filter.profile = { department: query.department };
  return filter;
};

export const calculateOffset = (page: number, limit: number): number => (page - 1) * limit;