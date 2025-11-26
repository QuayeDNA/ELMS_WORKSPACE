import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, studentsApi, batchesApi, movementsApi, handlersApi, dashboardApi } from './api';

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

// Dashboard hooks
export const useInvigilatorDashboard = () => {
  return useQuery({
    queryKey: ['invigilatorDashboard'],
    queryFn: () => dashboardApi.getInvigilatorDashboard(),
  });
};
