import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/store';
import { sessionsApi, studentsApi, batchesApi, movementsApi, handlersApi, dashboardApi } from './api';

// Sessions hooks
export const useMySessions = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['mySessions'],
    queryFn: () => sessionsApi.getMySessions(),
    enabled: isAuthenticated && !!token,
  });
};

export const useSessionDetails = (sessionId: number) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.getSessionDetails(sessionId),
    enabled: !!sessionId && isAuthenticated && !!token,
  });
};

// Students hooks
export const useSessionStudents = (sessionId: number) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['sessionStudents', sessionId],
    queryFn: () => studentsApi.getSessionStudents(sessionId),
    enabled: !!sessionId && isAuthenticated && !!token,
  });
};

// Batches hooks
export const useMyBatches = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['myBatches'],
    queryFn: () => batchesApi.getMyBatches(),
    enabled: isAuthenticated && !!token,
  });
};

export const useBatchDetails = (batchId: number) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => batchesApi.getBatchDetails(batchId),
    enabled: !!batchId && isAuthenticated && !!token,
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
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['batchMovements', batchId],
    queryFn: () => movementsApi.getBatchMovements(batchId),
    enabled: !!batchId && isAuthenticated && !!token,
  });
};

// Handlers hooks
export const useAllHandlers = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['allHandlers'],
    queryFn: () => handlersApi.getAllHandlers(),
    enabled: isAuthenticated && !!token,
  });
};

// Dashboard hooks
export const useInvigilatorDashboard = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  return useQuery({
    queryKey: ['invigilatorDashboard'],
    queryFn: () => dashboardApi.getInvigilatorDashboard(),
    enabled: isAuthenticated && !!token, // Only run when authenticated and token exists
  });
};
