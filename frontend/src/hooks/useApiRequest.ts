import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '@/types/api';

// ========================================
// TYPES
// ========================================

interface UseApiRequestOptions<T> {
  immediate?: boolean; // Whether to run immediately on mount
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
}

// ========================================
// CUSTOM HOOK
// ========================================

/**
 * Custom hook for handling API requests with proper cleanup and abort handling
 * Prevents duplicate requests when React.StrictMode double-invokes effects
 */
export function useApiRequest<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  deps: React.DependencyList = [],
  options: UseApiRequestOptions<T> = {}
): UseApiRequestResult<T> {
  const { immediate = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if component is mounted and request should be processed
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();

      // Check if component is still mounted and request wasn't aborted
      if (!isMountedRef.current || abortControllerRef.current.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || response.message || 'Request failed';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      // Don't handle error if component unmounted or request aborted
      if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Effect to run the API call
  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, immediate]); // FIXED: Removed 'execute' from deps to prevent infinite loop

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// ========================================
// SPECIALIZED HOOKS
// ========================================

/**
 * Hook for fetching a single resource by ID
 */
export function useApiResourceById<T>(
  fetchFunction: (id: number) => Promise<ApiResponse<T>>,
  id: number | string | undefined,
  options?: UseApiRequestOptions<T>
) {
  const apiCall = useCallback(async () => {
    if (!id) throw new Error('ID is required');
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    if (isNaN(numericId)) throw new Error('Invalid ID');
    return fetchFunction(numericId);
  }, [fetchFunction, id]);

  return useApiRequest(
    apiCall,
    [id],
    {
      immediate: !!id,
      ...options,
    }
  );
}

/**
 * Hook for API calls that should only run when explicitly triggered
 */
export function useApiMutation<TData, TVariables = void>(
  mutationFunction: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: UseApiRequestOptions<TData>
) {
  const [variables, setVariables] = useState<TVariables | null>(null);

  const apiCall = useCallback(async () => {
    if (variables === null) throw new Error('No variables provided');
    return mutationFunction(variables);
  }, [mutationFunction, variables]);

  const result = useApiRequest(
    apiCall,
    [variables],
    {
      immediate: false,
      ...options,
    }
  );

  const mutate = useCallback(
    async (vars: TVariables) => {
      setVariables(vars);
      await result.execute();
    },
    [result]
  );

  return {
    ...result,
    mutate,
  };
}
