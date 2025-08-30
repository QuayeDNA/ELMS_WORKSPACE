import {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  UpdateUserStatusRequest,
  BulkUpdateUsersRequest,
  InstitutionFormData,
  ValidationError,
  FormValidationResult
} from '../../../types/superadmin/users/user-management-types';

/**
 * Validation utilities for user management forms
 */

/**
 * Validate institution creation data
 */
export function validateInstitutionData(data: CreateInstitutionRequest): FormValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Institution name is required' });
  } else if (data.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Institution name must be at least 3 characters long' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Institution name must be less than 100 characters' });
  }

  // Type validation
  const validTypes = ['university', 'college', 'institute', 'academy', 'technical'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.push({ field: 'type', message: 'Please select a valid institution type' });
  }

  // Category validation
  const validCategories = ['public', 'private'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push({ field: 'category', message: 'Please select a valid institution category' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate institution update data
 */
export function validateInstitutionUpdateData(data: UpdateInstitutionRequest): FormValidationResult {
  const errors: ValidationError[] = [];

  // Name validation (if provided)
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Institution name is required' });
    } else if (data.name.trim().length < 3) {
      errors.push({ field: 'name', message: 'Institution name must be at least 3 characters long' });
    } else if (data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Institution name must be less than 100 characters' });
    }
  }

  // Type validation (if provided)
  if (data.type !== undefined) {
    const validTypes = ['university', 'college', 'institute', 'academy', 'technical'];
    if (!validTypes.includes(data.type)) {
      errors.push({ field: 'type', message: 'Please select a valid institution type' });
    }
  }

  // Category validation (if provided)
  if (data.category !== undefined) {
    const validCategories = ['public', 'private'];
    if (!validCategories.includes(data.category)) {
      errors.push({ field: 'category', message: 'Please select a valid institution category' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user status update data
 */
export function validateUserStatusData(data: UpdateUserStatusRequest): FormValidationResult {
  const errors: ValidationError[] = [];

  // User ID validation
  if (!data.userId || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  // Status validation
  const validStatuses = ['ACTIVE', 'INACTIVE'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Please select a valid status' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate bulk update data
 */
export function validateBulkUpdateData(data: BulkUpdateUsersRequest): FormValidationResult {
  const errors: ValidationError[] = [];

  // User IDs validation
  if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
    errors.push({ field: 'userIds', message: 'At least one user must be selected' });
  } else if (data.userIds.length > 1000) {
    errors.push({ field: 'userIds', message: 'Cannot update more than 1000 users at once' });
  } else {
    // Check for valid UUIDs
    const invalidIds = data.userIds.filter(id => !isValidUUID(id));
    if (invalidIds.length > 0) {
      errors.push({ field: 'userIds', message: 'Some user IDs are invalid' });
    }
  }

  // Action validation
  const validActions = ['ACTIVATE', 'DEACTIVATE'];
  if (!data.action || !validActions.includes(data.action)) {
    errors.push({ field: 'action', message: 'Please select a valid action' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate institution form data
 */
export function validateInstitutionFormData(data: InstitutionFormData): FormValidationResult {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Institution name is required' });
  } else if (data.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Institution name must be at least 3 characters long' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Institution name must be less than 100 characters' });
  }

  // Type validation
  const validTypes = ['university', 'college', 'institute', 'academy', 'technical'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.push({ field: 'type', message: 'Please select a valid institution type' });
  }

  // Category validation
  const validCategories = ['public', 'private'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push({ field: 'category', message: 'Please select a valid institution category' });
  }

  // Timezone validation
  if (!data.timezone || data.timezone.trim().length === 0) {
    errors.push({ field: 'timezone', message: 'Timezone is required' });
  }

  // Currency validation
  if (!data.currency || data.currency.trim().length === 0) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  }

  // Language validation
  if (!data.language || data.language.trim().length === 0) {
    errors.push({ field: 'language', message: 'Language is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number = 1, limit: number = 10): { page: number; limit: number } {
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  return { page: validPage, limit: validLimit };
}

/**
 * Validate search parameters
 */
export function validateSearchParams(search?: string): string | undefined {
  if (!search || typeof search !== 'string') {
    return undefined;
  }

  const trimmed = search.trim();
  if (trimmed.length === 0 || trimmed.length > 100) {
    return undefined;
  }

  return trimmed;
}

/**
 * Helper function to validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => `${error.field}: ${error.message}`).join('\n');
}

/**
 * Check if a field has validation errors
 */
export function hasFieldError(errors: ValidationError[], field: string): boolean {
  return errors.some(error => error.field === field);
}

/**
 * Get field error message
 */
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  const error = errors.find(error => error.field === field);
  return error?.message;
}
