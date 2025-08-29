import { PrismaClient, Institution, Faculty, Department, Program, Course, AcademicYear, Semester } from '@prisma/client';
import logger from '@/utils/logger';

interface CreateInstitutionData {
  name: string;
  shortName?: string;
  code: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'INSTITUTE' | 'SCHOOL' | 'ACADEMY';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  establishedYear?: number;
  motto?: string;
  description?: string;
  timezone?: string;
}

interface CreateFacultyData {
  name: string;
  shortName?: string;
  code: string;
  description?: string;
  institutionId: string;
  campusId?: string;
  deanId?: string;
  establishedYear?: number;
  contactInfo?: {
    email?: string;
    phone?: string;
    officeLocation?: string;
  };
}

interface CreateDepartmentData {
  name: string;
  shortName?: string;
  code: string;
  description?: string;
  facultyId: string;
  headId?: string;
  establishedYear?: number;
  contactInfo?: {
    email?: string;
    phone?: string;
    officeLocation?: string;
  };
  researchAreas?: string[];
}

interface CreateProgramData {
  name: string;
  code: string;
  departmentId: string;
  level: 'CERTIFICATE' | 'DIPLOMA' | 'UNDERGRADUATE' | 'POSTGRADUATE' | 'DOCTORAL';
  duration: number; // in years
  requirements?: any;
  description?: string;
}

interface CreateCourseData {
  name: string;
  code: string;
  departmentId: string;
  lecturerId: string;
  creditHours: number;
  contactHours?: number;
  description?: string;
  objectives?: string[];
  level: 'FOUNDATION' | 'INTRODUCTORY' | 'INTERMEDIATE' | 'ADVANCED' | 'SENIOR' | 'GRADUATE';
  type: 'CORE' | 'ELECTIVE' | 'PRACTICAL' | 'SEMINAR' | 'THESIS' | 'PROJECT' | 'INTERNSHIP';
  prerequisites?: string[];
  corequisites?: string[];
  maxStudents?: number;
  minStudents?: number;
  isElective?: boolean;
  semester?: number;
  syllabus?: string;
  textbooks?: any;
  assessmentStructure?: any;
}

interface AcademicStructureStats {
  institutions: number;
  faculties: number;
  departments: number;
  programs: number;
  courses: number;
  activePrograms: number;
  activeCourses: number;
}

export class UniversityService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Institution Management
   */
  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    try {
      // Check if institution code already exists
      const existingInstitution = await this.prisma.institution.findUnique({
        where: { code: data.code },
      });

      if (existingInstitution) {
        throw new Error('Institution with this code already exists');
      }

      const institution = await this.prisma.institution.create({
        data: {
          name: data.name,
          shortName: data.shortName,
          code: data.code,
          type: data.type,
          address: data.address,
          contactInfo: data.contactInfo,
          establishedYear: data.establishedYear,
          motto: data.motto,
          description: data.description,
          timezone: data.timezone || 'UTC',
          academicCalendar: {
            semesterSystem: 'SEMESTER', // Default to semester system
            academicYearStart: 'SEPTEMBER',
            defaultSemesterCount: 2,
          },
          config: {
            allowMultipleCampuses: false,
            enableGradePoints: true,
            gradeScale: 4.0,
            passingGrade: 'D',
          },
          settings: {
            create: {
              allowSelfRegistration: false,
              requireEmailVerification: true,
              gradingSystem: 'Ghanaian Standard',
              passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSymbols: false,
              },
              sessionTimeout: 1800,
              maxConcurrentSessions: 3,
              enableMFA: false,
              allowedEmailDomains: [],
              maintenanceMode: false,
            },
          },
        },
        include: {
          settings: true,
        },
      });

      logger.info(`Institution created: ${institution.name} (${institution.code})`);
      return institution;
    } catch (error) {
      logger.error('Error creating institution:', error);
      throw error;
    }
  }

  async getInstitution(id: string) {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id },
        include: {
          settings: true,
          faculties: {
            include: {
              departments: {
                include: {
                  programs: true,
                  courses: true,
                },
              },
            },
          },
          academicYears: {
            where: { isActive: true },
            include: {
              semesters: true,
            },
          },
          campuses: true,
        },
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      return institution;
    } catch (error) {
      logger.error('Error getting institution:', error);
      throw error;
    }
  }

  /**
   * Faculty Management
   */
  async createFaculty(data: CreateFacultyData): Promise<Faculty> {
    try {
      // Check if faculty code exists within the institution
      const existingFaculty = await this.prisma.faculty.findFirst({
        where: {
          institutionId: data.institutionId,
          code: data.code,
        },
      });

      if (existingFaculty) {
        throw new Error('Faculty with this code already exists in the institution');
      }

      const faculty = await this.prisma.faculty.create({
        data: {
          name: data.name,
          shortName: data.shortName,
          code: data.code,
          description: data.description,
          institutionId: data.institutionId,
          campusId: data.campusId,
          deanId: data.deanId,
          establishedYear: data.establishedYear,
          contactInfo: data.contactInfo,
        },
        include: {
          institution: true,
          campus: true,
        },
      });

      logger.info(`Faculty created: ${faculty.name} (${faculty.code})`);
      return faculty;
    } catch (error) {
      logger.error('Error creating faculty:', error);
      throw error;
    }
  }

  async getFacultiesByInstitution(institutionId: string) {
    try {
      const faculties = await this.prisma.faculty.findMany({
        where: { 
          institutionId,
          isActive: true,
        },
        include: {
          departments: {
            where: { isActive: true },
            include: {
              programs: {
                where: { isActive: true },
              },
              courses: {
                where: { isActive: true },
              },
              _count: {
                select: {
                  programs: true,
                  courses: true,
                  lecturers: true,
                },
              },
            },
          },
          _count: {
            select: {
              departments: true,
              venues: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return faculties;
    } catch (error) {
      logger.error('Error getting faculties:', error);
      throw error;
    }
  }

  /**
   * Department Management
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    try {
      // Check if department code exists within the faculty
      const existingDepartment = await this.prisma.department.findFirst({
        where: {
          facultyId: data.facultyId,
          code: data.code,
        },
      });

      if (existingDepartment) {
        throw new Error('Department with this code already exists in the faculty');
      }

      const department = await this.prisma.department.create({
        data: {
          name: data.name,
          shortName: data.shortName,
          code: data.code,
          description: data.description,
          facultyId: data.facultyId,
          headId: data.headId,
          establishedYear: data.establishedYear,
          contactInfo: data.contactInfo,
          researchAreas: data.researchAreas || [],
        },
        include: {
          faculty: {
            include: {
              institution: true,
            },
          },
        },
      });

      logger.info(`Department created: ${department.name} (${department.code})`);
      return department;
    } catch (error) {
      logger.error('Error creating department:', error);
      throw error;
    }
  }

  async getDepartmentsByFaculty(facultyId: string) {
    try {
      const departments = await this.prisma.department.findMany({
        where: { 
          facultyId,
          isActive: true,
        },
        include: {
          programs: {
            where: { isActive: true },
            include: {
              _count: {
                select: {
                  students: true,
                },
              },
            },
          },
          courses: {
            where: { isActive: true },
            include: {
              lecturer: {
                include: {
                  profile: true,
                },
              },
            },
          },
          lecturers: {
            include: {
              profile: true,
            },
          },
          _count: {
            select: {
              programs: true,
              courses: true,
              lecturers: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return departments;
    } catch (error) {
      logger.error('Error getting departments:', error);
      throw error;
    }
  }

  /**
   * Program Management
   */
  async createProgram(data: CreateProgramData): Promise<Program> {
    try {
      // Check if program code exists within the department
      const existingProgram = await this.prisma.program.findFirst({
        where: {
          departmentId: data.departmentId,
          code: data.code,
        },
      });

      if (existingProgram) {
        throw new Error('Program with this code already exists in the department');
      }

      const program = await this.prisma.program.create({
        data: {
          name: data.name,
          code: data.code,
          departmentId: data.departmentId,
          level: data.level,
          duration: data.duration,
          requirements: data.requirements || {},
          entryRequirements: data.requirements || { minimumGrade: 'C6', subjects: [] },
        },
        include: {
          department: {
            include: {
              faculty: {
                include: {
                  institution: true,
                },
              },
            },
          },
        },
      });

      logger.info(`Program created: ${program.name} (${program.code})`);
      return program;
    } catch (error) {
      logger.error('Error creating program:', error);
      throw error;
    }
  }

  async getProgramsByDepartment(departmentId: string) {
    try {
      const programs = await this.prisma.program.findMany({
        where: { 
          departmentId,
          isActive: true,
        },
        include: {
          department: true,
          students: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          courses: {
            include: {
              course: {
                include: {
                  lecturer: {
                    include: {
                      profile: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
              courses: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return programs;
    } catch (error) {
      logger.error('Error getting programs:', error);
      throw error;
    }
  }

  /**
   * Course Management
   */
  async createCourse(data: CreateCourseData): Promise<Course> {
    try {
      // Check if course code exists within the department
      const existingCourse = await this.prisma.course.findFirst({
        where: {
          departmentId: data.departmentId,
          code: data.code,
        },
      });

      if (existingCourse) {
        throw new Error('Course with this code already exists in the department');
      }

      const course = await this.prisma.course.create({
        data: {
          name: data.name,
          code: data.code,
          departmentId: data.departmentId,
          lecturerId: data.lecturerId,
          creditHours: data.creditHours,
          contactHours: data.contactHours,
          description: data.description,
          objectives: data.objectives || [],
          level: data.level,
          type: data.type,
          prerequisiteCodes: data.prerequisites || [],
          corequisites: data.corequisites || [],
          maxStudents: data.maxStudents,
          minStudents: data.minStudents,
          isElective: data.isElective || false,
          semester: data.semester,
          syllabus: data.syllabus,
          textbooks: data.textbooks,
          assessmentStructure: data.assessmentStructure,
        },
        include: {
          department: {
            include: {
              faculty: {
                include: {
                  institution: true,
                },
              },
            },
          },
          lecturer: {
            include: {
              profile: true,
            },
          },
        },
      });

      logger.info(`Course created: ${course.name} (${course.code})`);
      return course;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  async getCoursesByDepartment(departmentId: string) {
    try {
      const courses = await this.prisma.course.findMany({
        where: { 
          departmentId,
          isActive: true,
        },
        include: {
          department: true,
          lecturer: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  title: true,
                },
              },
            },
          },
          students: {
            where: {
              status: 'ENROLLED',
            },
            include: {
              student: {
                include: {
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          examSessions: {
            where: {
              status: 'SCHEDULED',
            },
            orderBy: {
              date: 'desc',
            },
            take: 5,
          },
          _count: {
            select: {
              students: true,
              examSessions: true,
            },
          },
        },
        orderBy: { code: 'asc' },
      });

      return courses;
    } catch (error) {
      logger.error('Error getting courses:', error);
      throw error;
    }
  }

  /**
   * Academic Year and Semester Management
   */
  async createAcademicYear(data: {
    name: string;
    code: string;
    institutionId: string;
    startDate: Date;
    endDate: Date;
    isCurrent?: boolean;
  }): Promise<AcademicYear> {
    try {
      const academicYear = await this.prisma.$transaction(async (prisma) => {
        // If this is set as current, make sure no other academic year is current
        if (data.isCurrent) {
          await prisma.academicYear.updateMany({
            where: { 
              institutionId: data.institutionId,
              isCurrent: true,
            },
            data: { isCurrent: false },
          });
        }

        return await prisma.academicYear.create({
          data,
          include: {
            institution: true,
          },
        });
      });

      logger.info(`Academic year created: ${academicYear.name} (${academicYear.code})`);
      return academicYear;
    } catch (error) {
      logger.error('Error creating academic year:', error);
      throw error;
    }
  }

  async createSemester(data: {
    name: string;
    code: string;
    academicYearId: string;
    semesterNumber: number;
    startDate: Date;
    endDate: Date;
    registrationStart: Date;
    registrationEnd: Date;
    isCurrent?: boolean;
  }): Promise<Semester> {
    try {
      const semester = await this.prisma.$transaction(async (prisma) => {
        // If this is set as current, make sure no other semester is current
        if (data.isCurrent) {
          await prisma.semester.updateMany({
            where: { 
              academicYearId: data.academicYearId,
              isCurrent: true,
            },
            data: { isCurrent: false },
          });
        }

        return await prisma.semester.create({
          data,
          include: {
            academicYear: {
              include: {
                institution: true,
              },
            },
          },
        });
      });

      logger.info(`Semester created: ${semester.name} (${semester.code})`);
      return semester;
    } catch (error) {
      logger.error('Error creating semester:', error);
      throw error;
    }
  }

  /**
   * Statistics and Analytics
   */
  async getAcademicStructureStats(institutionId?: string): Promise<AcademicStructureStats> {
    try {
      const whereClause = institutionId ? { institutionId } : {};
      
      const [
        institutions,
        faculties,
        departments,
        programs,
        courses,
        activePrograms,
        activeCourses,
      ] = await Promise.all([
        institutionId 
          ? 1 
          : this.prisma.institution.count({ where: { isActive: true } }),
        this.prisma.faculty.count({ 
          where: { 
            ...whereClause,
            isActive: true,
          },
        }),
        this.prisma.department.count({ 
          where: { 
            faculty: whereClause,
            isActive: true,
          },
        }),
        this.prisma.program.count({ 
          where: { 
            department: {
              faculty: whereClause,
            },
            isActive: true,
          },
        }),
        this.prisma.course.count({ 
          where: { 
            department: {
              faculty: whereClause,
            },
            isActive: true,
          },
        }),
        this.prisma.program.count({ 
          where: { 
            department: {
              faculty: whereClause,
            },
            isActive: true,
          },
        }),
        this.prisma.course.count({ 
          where: { 
            department: {
              faculty: whereClause,
            },
            isActive: true,
          },
        }),
      ]);

      return {
        institutions,
        faculties,
        departments,
        programs,
        courses,
        activePrograms,
        activeCourses,
      };
    } catch (error) {
      logger.error('Error getting academic structure stats:', error);
      throw error;
    }
  }

  /**
   * Search and filtering
   */
  async searchAcademicEntities(query: string, institutionId?: string) {
    try {
      const whereClause = institutionId 
        ? { 
            institution: { id: institutionId },
          }
        : {};

      const [faculties, departments, programs, courses] = await Promise.all([
        this.prisma.faculty.findMany({
          where: {
            ...whereClause,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { code: { contains: query, mode: 'insensitive' } },
            ],
            isActive: true,
          },
          include: {
            institution: {
              select: { name: true },
            },
            _count: {
              select: { departments: true },
            },
          },
          take: 10,
        }),
        this.prisma.department.findMany({
          where: {
            faculty: whereClause,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { code: { contains: query, mode: 'insensitive' } },
            ],
            isActive: true,
          },
          include: {
            faculty: {
              select: { name: true },
            },
            _count: {
              select: { programs: true, courses: true },
            },
          },
          take: 10,
        }),
        this.prisma.program.findMany({
          where: {
            department: {
              faculty: whereClause,
            },
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { code: { contains: query, mode: 'insensitive' } },
            ],
            isActive: true,
          },
          include: {
            department: {
              select: { name: true },
            },
            _count: {
              select: { students: true },
            },
          },
          take: 10,
        }),
        this.prisma.course.findMany({
          where: {
            department: {
              faculty: whereClause,
            },
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { code: { contains: query, mode: 'insensitive' } },
            ],
            isActive: true,
          },
          include: {
            department: {
              select: { name: true },
            },
            lecturer: {
              include: {
                profile: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
          take: 10,
        }),
      ]);

      return {
        faculties,
        departments,
        programs,
        courses,
      };
    } catch (error) {
      logger.error('Error searching academic entities:', error);
      throw error;
    }
  }
}
