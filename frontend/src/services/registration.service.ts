import { apiService } from './api';

// Import types from types file
import {
	CourseOfferingWithDetails,
	StudentRegistration,
	RegisterForCoursesResponse,
	DropCoursesResponse,
} from '@/types/registration';

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
}

export const registrationService = new RegistrationService();
