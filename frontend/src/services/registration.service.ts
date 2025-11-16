import { apiService } from './api';

export interface EligibleCourse {
	courseOffering: {
		id: number;
		courseId: number;
		semesterId: number;
		primaryLecturerId: number;
		maxEnrollment: number;
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
			description: string;
			creditHours: number;
			contactHours: number;
			level: number;
			courseType: string;
			prerequisites: string | null;
			corequisites: string | null;
			learningOutcomes: string;
			syllabus: string;
			assessmentMethods: string;
			recommendedBooks: string;
			departmentId: number;
			isActive: boolean;
			createdAt: string;
			updatedAt: string;
			department: {
				id: number;
				name: string;
				code: string;
			};
		};
		primaryLecturer: {
			id: number;
			firstName: string;
			lastName: string;
			email: string;
		} | null;
		semester: {
			id: number;
			name: string;
			semesterNumber: number;
		};
	};
	eligibility: {
		isEligible: boolean;
		reasons: string[];
		prerequisitesMet: boolean;
		hasScheduleConflict: boolean;
	};
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
	): Promise<{ data: EligibleCourse[]; count: number }> {
		const response = await apiService.get<EligibleCourse[]>(
			`${this.basePath}/eligible-courses/${studentId}/${semesterId}`
		) as any; // Backend returns { success, data: [...], count }

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to fetch eligible courses');
		}

		// Backend returns { success, data: [...], count }
		// apiService returns the full response if it has 'success' property
		return {
			data: response.data,
			count: response.count || response.data.length
		};
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

	/**
	 * Get students by registration status for a semester
	 */
	async getStudentsByRegistrationStatus(
		semesterId: string,
		filters?: {
			programId?: string;
			departmentId?: string;
		}
	): Promise<{
		registered: any[];
		notRegistered: any[];
	}> {
		const params = new URLSearchParams();
		if (filters?.programId) params.append('programId', filters.programId);
		if (filters?.departmentId) params.append('departmentId', filters.departmentId);

		const queryString = params.toString();
		const url = `${this.basePath}/students-by-status/${semesterId}${queryString ? `?${queryString}` : ''}`;

		const response = await apiService.get<{
			registered: any[];
			notRegistered: any[];
		}>(url);

		if (!response.success || !response.data) {
			throw new Error(response.message || 'Failed to fetch students by registration status');
		}

		return response.data;
	}

	/**
	 * Register student for all eligible courses
	 */
	async registerAllEligibleCourses(
		studentProfileId: number,
		semesterId: number
	): Promise<{
		success: boolean;
		message: string;
		registeredCount: number;
		courses: any[];
	}> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			registeredCount: number;
			courses: any[];
		}>(`${this.basePath}/register-all`, {
			studentProfileId,
			semesterId
		});

		if (!response.success) {
			throw new Error(response.message || 'Failed to register for courses');
		}

		return response;
	}
}

export const registrationService = new RegistrationService();
