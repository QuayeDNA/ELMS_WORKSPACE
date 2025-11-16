import { apiService } from './api';

// Import types from types file
import {
	CourseOfferingWithDetails,
	StudentRegistration,
	RegisterForCoursesResponse,
	DropCoursesResponse,
} from '@/types/registration';

interface BulkRegisterResponse {
	success: boolean;
	message: string;
	succeeded: Array<{ studentId: number; studentName: string; registeredCourses: number }>;
	failed: Array<{ studentId: number; studentName: string; reason: string }>;
	totalProcessed: number;
}

interface StudentsByRegistrationStatus {
	registered: Array<{
		id: string;
		studentId: string;
		user: { firstName: string; lastName: string; email: string };
		program?: { id: string; name: string; code: string; department: { id: string; name: string } };
		level: number;
		semester: number;
	}>;
	notRegistered: Array<{
		id: string;
		studentId: string;
		user: { firstName: string; lastName: string; email: string };
		program?: { id: string; name: string; code: string; department: { id: string; name: string } };
		level: number;
		semester: number;
	}>;
}

class RegistrationService {
	private readonly basePath = '/api/registrations';

	/**
	 * Register student for multiple courses in one action
	 */
	async registerForCourses(
		studentId: number,
		semesterId: number,
		courseOfferingIds: number[]
	): Promise<RegisterForCoursesResponse> {
		const response = await apiService.post<RegisterForCoursesResponse>(
			`${this.basePath}/register`,
			{
				studentId,
				semesterId,
				courseOfferingIds,
			}
		);

		if (!response.success) {
			throw new Error(response.message || 'Failed to register for courses');
		}

		return response.data!;
	}

	/**
	 * Get available courses for a student in a semester
	 */
	async getAvailableCourses(
		studentId: number,
		semesterId: number
	): Promise<CourseOfferingWithDetails[]> {
		const response = await apiService.get<CourseOfferingWithDetails[]>(
			`${this.basePath}/available-courses/${studentId}/${semesterId}`
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to fetch available courses');
		}

		return response.data;
	}

	/**
	 * Get student's current registration for a semester
	 */
	async getStudentRegistration(
		studentId: number,
		semesterId: number
	): Promise<StudentRegistration | null> {
		const response = await apiService.get<StudentRegistration>(
			`${this.basePath}/student/${studentId}/${semesterId}`
		);

		if (!response.success) {
			// Return null if no registration found (404 is okay)
			if (response.message?.includes('not found')) {
				return null;
			}
			throw new Error(response.message || 'Failed to fetch registration');
		}

		return response.data || null;
	}

	/**
	 * Drop courses from registration
	 */
	async dropCourses(
		studentId: number,
		semesterId: number,
		courseOfferingIds: number[]
	): Promise<DropCoursesResponse> {
		const response = await apiService.post<DropCoursesResponse>(
			`${this.basePath}/drop`,
			{
				studentId,
				semesterId,
				courseOfferingIds,
			}
		);

		if (!response.success) {
			throw new Error(response.message || 'Failed to drop courses');
		}

		return response.data!;
	}

	/**
	 * Cancel entire registration
	 */
	async cancelRegistration(
		studentId: number,
		semesterId: number
	): Promise<{ success: boolean; message: string }> {
		const response = await apiService.post<{ success: boolean; message: string }>(
			`${this.basePath}/cancel`,
			{
				studentId,
				semesterId,
			}
		);

		if (!response.success) {
			throw new Error(response.message || 'Failed to cancel registration');
		}

		return response.data!;
	}

	/**
	 * Bulk register students for courses (Institution Admin only)
	 */
	async bulkRegisterStudents(
		studentIds: number[],
		semesterId: number,
		courseOfferingIds: number[]
	): Promise<BulkRegisterResponse> {
		const response = await apiService.post<BulkRegisterResponse>(
			`${this.basePath}/bulk`,
			{
				studentIds,
				semesterId,
				courseOfferingIds,
			}
		);

		if (!response.success) {
			throw new Error(response.message || 'Failed to bulk register students');
		}

		return response.data!;
	}

	/**
	 * Get students by registration status (Institution Admin only)
	 */
	async getStudentsByRegistrationStatus(
		semesterId: number,
		filters?: { programId?: string; departmentId?: string }
	): Promise<StudentsByRegistrationStatus> {
		const queryParams = new URLSearchParams();
		if (filters?.programId) queryParams.append('programId', filters.programId);
		if (filters?.departmentId) queryParams.append('departmentId', filters.departmentId);

		const queryString = queryParams.toString();
		const url = `${this.basePath}/students-by-status/${semesterId}${queryString ? `?${queryString}` : ''}`;

		const response = await apiService.get<StudentsByRegistrationStatus>(url);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to fetch students by registration status');
		}

		return response.data;
	}
}

export const registrationService = new RegistrationService();
