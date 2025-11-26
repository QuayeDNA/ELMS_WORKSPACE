import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, sessionsApi, studentsApi, batchesApi, movementsApi, handlersApi } from './api';
import { LoginCredentials } from '../types';

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials.username, credentials.password),
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
  });
};

// Sessions hooks
export const useMySessions = () => {
  return useQuery({
    queryKey: ['mySessions'],
    queryFn: () => sessionsApi.getMySessions(),
  });
};

export const useSessionDetails = (sessionId: number) => {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.getSessionDetails(sessionId),
    enabled: !!sessionId,
  });
};

// Students hooks
export const useSessionStudents = (sessionId: number) => {
  return useQuery({
    queryKey: ['sessionStudents', sessionId],
    queryFn: () => studentsApi.getSessionStudents(sessionId),
    enabled: !!sessionId,
  });
};

// Batches hooks
export const useMyBatches = () => {
  return useQuery({
    queryKey: ['myBatches'],
    queryFn: () => batchesApi.getMyBatches(),
  });
};

export const useBatchDetails = (batchId: number) => {
  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => batchesApi.getBatchDetails(batchId),
    enabled: !!batchId,
  });
};

export const useTransferBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: batchesApi.transferBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBatches'] });
    },
  });
};

// Movements hooks
export const useBatchMovements = (batchId: number) => {
  return useQuery({
    queryKey: ['batchMovements', batchId],
    queryFn: () => movementsApi.getBatchMovements(batchId),
    enabled: !!batchId,
  });
};

// Handlers hooks
export const useAllHandlers = () => {
  return useQuery({
    queryKey: ['allHandlers'],
    queryFn: () => handlersApi.getAllHandlers(),
  });
};
