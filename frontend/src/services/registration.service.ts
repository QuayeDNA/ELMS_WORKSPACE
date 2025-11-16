import { apiService } from './api';

// Simplified registration types matching backend
export interface CourseOfferingWithDetails {
	id: number;
	courseId: number;
	semesterId: number;
	primaryLecturerId: number | null;
	maxEnrollment: number | null;
	maxCapacity: number;
	currentEnrollment: number;
	classroom: string | null;
	schedule: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
	course: {
		id: number;
		name: string;
		code: string;
		creditHours: number;
	};
	instructor?: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
	} | null;
	primaryLecturer?: {
		id: number;
		firstName: string;
		lastName: string;
		email: string;
	} | null;
	available?: boolean;
	enrolledCount?: number;
	isEligible?: boolean;
}

export interface CourseRegistrationItem {
	id: number;
	courseOfferingId: number;
	status: 'REGISTERED' | 'DROPPED' | 'COMPLETED';
	courseOffering: {
		id: number;
		course: {
			id: number;
			name: string;
			code: string;
			creditHours: number;
		};
		instructor?: {
			id: number;
			firstName: string;
			lastName: string;
		} | null;
	};
}

export interface StudentRegistration {
	id: number;
	status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
	totalCredits: number;
	createdAt: string;
	updatedAt: string;
	items: CourseRegistrationItem[];
	courses: CourseRegistrationItem[];
}

export interface RegisterForCoursesRequest {
	studentId: number;
	semesterId: number;
	courseOfferingIds: number[];
}

export interface RegisterForCoursesResponse {
	success: boolean;
	message: string;
	registeredCourses: any[];
	totalCredits: number;
}

export interface DropCoursesRequest {
	studentId: number;
	semesterId: number;
	courseOfferingIds: number[];
}

export interface DropCoursesResponse {
	success: boolean;
	message: string;
	droppedCount: number;
	remainingCredits: number;
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

		return response;
	}

	/**
	 * Get available courses for a student in a semester
	 */
	async getAvailableCourses(
		semesterId: number
	): Promise<CourseOfferingWithDetails[]> {
		const response = await apiService.get<CourseOfferingWithDetails[]>(
			`${this.basePath}/available-courses/${semesterId}`
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
			`${this.basePath}/student/${studentId}/semester/${semesterId}`
		);

		if (!response.success) {
			// Return null if no registration found (404 is okay)
			if (response.message?.includes('not found')) {
				return null;
			}
			throw new Error(response.message || 'Failed to fetch registration');
		}

		return response.data;
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

		return response;
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

		return response;
	}
}

export const registrationService = new RegistrationService();
