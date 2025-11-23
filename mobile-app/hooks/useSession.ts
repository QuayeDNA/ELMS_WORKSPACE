/**
 * ELMS Mobile - React Query Hooks for Sessions
 */

import { useQuery } from '@tanstack/react-query';
import * as sessionService from '../services/session.service';

/**
 * Get handler's assigned sessions
 */
export const useMyAssignments = (filters?: {
  date?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['sessions', 'my-assignments', filters],
    queryFn: () => sessionService.getMyAssignments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get session details
 */
export const useSessionDetails = (sessionId: number) => {
  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => sessionService.getSessionDetails(sessionId),
    enabled: !!sessionId,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Get session students
 */
export const useSessionStudents = (sessionId: number) => {
  return useQuery({
    queryKey: ['sessions', sessionId, 'students'],
    queryFn: () => sessionService.getSessionStudents(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: sessionService.getDashboardStats,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};
