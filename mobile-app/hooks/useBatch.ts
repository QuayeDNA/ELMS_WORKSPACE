/**
 * ELMS Mobile - React Query Hooks for Batch Management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as batchService from '../services/batch.service';
import type { TransferBatchPayload } from '../services/batch.service';

/**
 * Get handler's batches
 */
export const useMyBatches = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: ['batches', 'my-batches', filters],
    queryFn: () => batchService.getMyBatches(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Transfer batch mutation
 */
export const useTransferBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferBatchPayload) => batchService.transferBatch(payload),
    onSuccess: () => {
      // Invalidate batch queries
      queryClient.invalidateQueries({
        queryKey: ['batches', 'my-batches'],
      });
    },
  });
};

/**
 * Get batch movement history
 */
export const useBatchMovements = (batchScriptId: number) => {
  return useQuery({
    queryKey: ['batches', batchScriptId, 'movements'],
    queryFn: () => batchService.getBatchMovements(batchScriptId),
    enabled: !!batchScriptId,
  });
};

/**
 * Get available handlers for transfer
 */
export const useAvailableHandlers = () => {
  return useQuery({
    queryKey: ['handlers', 'list'],
    queryFn: batchService.getAvailableHandlers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
