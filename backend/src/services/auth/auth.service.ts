import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import logger from '@/utils/logger';
import { JwtPayload } from '@/types/auth/auth.types';

class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
  }

  public async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  public verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  public async authenticateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user || !user.isActive) {
        return null;
      }

      const isPasswordValid = await this.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      };
    } catch (error) {
      logger.error('User authentication failed:', error);
      throw error;
    }
  }
}

export default AuthService;
