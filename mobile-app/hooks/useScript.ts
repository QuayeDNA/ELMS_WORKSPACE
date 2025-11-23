/**
 * ELMS Mobile - React Query Hooks for Script Submission
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as scriptService from '../services/script.service';
import type {
  SubmitScriptPayload,
  BulkSubmitPayload,
} from '../services/script.service';

/**
 * Scan student mutation
 */
export const useScanStudent = () => {
  return useMutation({
    mutationFn: (qrData: string) => scriptService.scanStudent(qrData),
  });
};

/**
 * Submit script mutation
 */
export const useSubmitScript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitScriptPayload) => scriptService.submitScript(payload),
    onSuccess: (_, variables) => {
      // Invalidate session details to refresh counts
      queryClient.invalidateQueries({
        queryKey: ['sessions', variables.examSessionId],
      });
    },
  });
};

/**
 * Bulk submit scripts mutation
 */
export const useBulkSubmitScripts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkSubmitPayload) => scriptService.bulkSubmitScripts(payload),
    onSuccess: (_, variables) => {
      // Invalidate session and batch queries
      queryClient.invalidateQueries({
        queryKey: ['sessions', variables.examSessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['batches'],
      });
    },
  });
};

/**
 * Seal batch mutation
 */
export const useSealBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, location }: {
      batchId: number;
      location?: { latitude: number; longitude: number }
    }) => scriptService.sealBatch(batchId, location),
    onSuccess: (_, variables) => {
      // Invalidate batch queries
      queryClient.invalidateQueries({
        queryKey: ['batches', variables.batchId],
      });
      queryClient.invalidateQueries({
        queryKey: ['batches', 'my-batches'],
      });
    },
  });
};

/**
 * Get batch details query
 */
export const useBatchDetails = (batchId: number) => {
  return useQuery({
    queryKey: ['batches', batchId],
    queryFn: () => scriptService.getBatchDetails(batchId),
    enabled: !!batchId,
  });
};
