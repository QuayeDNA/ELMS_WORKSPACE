import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '../types/auth';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/user';
import {
  PaginatedResponse,
  ApiResponse,
  createPaginatedResponse,
  createSuccessResponse
} from '../types/shared/api';
import { normalizeQuery, UserQuery } from '../types/shared/query';

const prisma = new PrismaClient();

export class UserService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    institutionId?: number;
    facultyId?: number;
    departmentId?: number;
    phone?: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error(`User with email '${data.email}' already exists`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: UserStatus.PENDING_VERIFICATION,
          institutionId: data.institutionId,
          facultyId: data.facultyId,
          departmentId: data.departmentId,
          phone: data.phone
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          institutionId: true,
          facultyId: true,
          departmentId: true,
          phone: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsers(query: UserQuery = {}): Promise<PaginatedResponse<User>> {
    try {
      const {
        institutionId,
        facultyId,
        departmentId,
        role,
        status,
        page,
        limit,
        search,
        sortBy = 'createdAt',
        sortOrder
      } = normalizeQuery(query);

      const skip = (page - 1) * limit;

      const where: any = {};
      if (institutionId) where.institutionId = institutionId;
      if (facultyId) where.facultyId = facultyId;
      if (departmentId) where.departmentId = departmentId;
      if (role) where.role = role;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
            title: true,
            role: true,
            status: true,
            lastLogin: true,
            emailVerified: true,
            institutionId: true,
            facultyId: true,
            departmentId: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            nationality: true,
            address: true,
            createdAt: true,
            updatedAt: true,
            institution: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            faculty: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: {
            [sortBy]: sortOrder
          },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      return createPaginatedResponse(
        users as User[],
        page,
        limit,
        total,
        'Users retrieved successfully'
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          title: true,
          role: true,
          status: true,
          lastLogin: true,
          emailVerified: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          nationality: true,
          address: true,
          institutionId: true,
          facultyId: true,
          departmentId: true,
          createdAt: true,
          updatedAt: true,
          institution: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              status: true
            }
          },
          faculty: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    title?: string;
    role?: UserRole;
    status?: UserStatus;
    phone?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationality?: string;
    address?: string;
    institutionId?: number;
    facultyId?: number;
    departmentId?: number;
  }) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          title: true,
          role: true,
          status: true,
          phone: true,
          institutionId: true,
          facultyId: true,
          departmentId: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              adminProfiles: true,
              facultyProfiles: true,
              lecturerProfiles: true,
              studentProfiles: true
            }
          }
        }
      });

      if (!user) {
        return false;
      }

      // Soft delete by setting status to inactive
      await prisma.user.update({
        where: { id },
        data: { status: UserStatus.INACTIVE }
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUsersByInstitution(institutionId: number) {
    try {
      const users = await prisma.user.findMany({
        where: { institutionId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLogin: true,
          facultyId: true,
          departmentId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return users;
    } catch (error) {
      console.error('Error fetching users by institution:', error);
      throw error;
    }
  }

  async getUsersByFaculty(facultyId: number) {
    try {
      const users = await prisma.user.findMany({
        where: { facultyId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLogin: true,
          departmentId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return users;
    } catch (error) {
      console.error('Error fetching users by faculty:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
