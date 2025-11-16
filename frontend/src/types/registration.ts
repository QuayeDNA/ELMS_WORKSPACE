/**
 * Public Student Registration Types
 * Used for the public-facing student registration page
 */

export interface PublicRegistrationRequest {
  institutionId: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  programId: number;
  academicYearId: number;
  entryLevel?: number;
}

export interface PublicRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    studentId: string;
    email: string;
    password: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    studentProfile: {
      studentId: string;
      indexNumber: string;
      programId: number;
    };
    loginInstructions: {
      message: string;
      loginUrl: string;
    };
  };
}

export interface AvailableProgram {
  id: number;
  name: string;
  code: string;
  type: string;
  level: string;
  durationYears: number;
  creditHours?: number;
  description?: string;
  isActive: boolean;
  department: {
    id: number;
    name: string;
    code: string;
    faculty: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface AvailableAcademicYear {
  id: number;
  yearCode: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  institutionId: number;
}

export interface ProgramsResponse {
  success: boolean;
  data: AvailableProgram[];
}

export interface AcademicYearsResponse {
  success: boolean;
  data: AvailableAcademicYear[];
}

export interface InstitutionDetails {
  id: number;
  name: string;
  code: string;
  type: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
}

export interface InstitutionDetailsResponse {
  success: boolean;
  data: InstitutionDetails;
}

/**
 * Course Registration Types
 * Used for student course registration functionality
 */

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
	registeredCourses: CourseRegistrationItem[];
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
