import { apiService } from './api';

export interface EligibleCourse {
	id: string;
	code: string;
	name: string;
	credits: number;
	semesterId: string;
	courseOfferingId: string;
	lecturer?: {
		id: string;
		firstName: string;
		lastName: string;
	};
	isPrerequisiteMet: boolean;
	unmetPrerequisites: string[];
}

export interface RegistrationSummary {
	registrationId: string | null;
	status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | null;
	registeredCourses: {
		id: string;
		courseCode: string;
		courseName: string;
		credits: number;
	}[];
	totalCredits: number;
	minCredits: number;
	maxCredits: number;
	canSubmit: boolean;
}

export interface Registration {
	id: string;
	studentId: string;
	semesterId: string;
	status: string;
	type: string;
	totalCredits: number;
	createdAt: string;
	submittedAt?: string;
	approvedAt?: string;
	approvedBy?: string;
	registeredCourses: {
		id: string;
		courseOffering: {
			id: string;
			course: {
				code: string;
				name: string;
				credits: number;
			};
		};
	}[];
}

class RegistrationService {
	private readonly basePath = '/api/registrations';

	/**
	 * Get eligible courses for a student in a semester
	 */
	async getEligibleCourses(
		studentId: string,
		semesterId: string
	): Promise<EligibleCourse[]> {
		const response = await apiService.get<EligibleCourse[]>(
			`${this.basePath}/eligible-courses/${studentId}/${semesterId}`
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to fetch eligible courses');
		}

		return response.data;
	}

	/**
	 * Get registration summary for a student in a semester
	 */
	async getRegistrationSummary(
		studentId: string,
		semesterId: string
	): Promise<RegistrationSummary> {
		const response = await apiService.get<RegistrationSummary>(
			`${this.basePath}/summary/${studentId}/${semesterId}`
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to fetch registration summary');
		}

		return response.data;
	}

	/**
	 * Create a new registration for a student
	 */
	async createRegistration(
		studentId: string,
		semesterId: string,
		type: 'REGULAR' | 'ADD_DROP' | 'LATE' = 'REGULAR'
	): Promise<Registration> {
		const response = await apiService.post<Registration>(this.basePath, {
			studentId,
			semesterId,
			type,
		});

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to create registration');
		}

		return response.data;
	}

	/**
	 * Add a course to an existing registration
	 */
	async addCourseToRegistration(
		registrationId: string,
		courseOfferingId: string
	): Promise<Registration> {
		const response = await apiService.post<Registration>(
			`${this.basePath}/${registrationId}/courses`,
			{
				courseOfferingId,
			}
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to add course');
		}

		return response.data;
	}

	/**
	 * Remove a course from registration
	 */
	async removeCourseFromRegistration(
		registeredCourseId: string
	): Promise<void> {
		const response = await apiService.delete<void>(
			`${this.basePath}/courses/${registeredCourseId}`
		);

		if (!response.success) {
			throw new Error(response.message || 'Failed to remove course');
		}
	}

	/**
	 * Submit registration for approval
	 */
	async submitRegistration(registrationId: string): Promise<Registration> {
		const response = await apiService.post<Registration>(
			`${this.basePath}/${registrationId}/submit`
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to submit registration');
		}

		return response.data;
	}

	/**
	 * Validate a registration
	 */
	async validateRegistration(registrationId: string): Promise<{
		isValid: boolean;
		errors: string[];
		warnings: string[];
	}> {
		const response = await apiService.get<{
			isValid: boolean;
			errors: string[];
			warnings: string[];
		}>(`${this.basePath}/${registrationId}/validate`);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to validate registration');
		}

		return response.data;
	}
}

export const registrationService = new RegistrationService();
