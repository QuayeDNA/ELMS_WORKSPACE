import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { institutionService } from '@/services/institution.service';

interface InstitutionAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalFaculties: number;
  usersByRole: Record<string, number>;
  recentActivity?: Array<{
    type: string;
    count: number;
    time: string;
  }>;
}

interface InstitutionAnalyticsContextType {
  analytics: InstitutionAnalytics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const InstitutionAnalyticsContext = createContext<InstitutionAnalyticsContextType | undefined>(
  undefined
);

interface InstitutionAnalyticsProviderProps {
  children: ReactNode;
}

export function InstitutionAnalyticsProvider({ children }: InstitutionAnalyticsProviderProps) {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.institutionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await institutionService.getInstitutionAnalytics(user.institutionId);
      if (response) {
        setAnalytics(response);
      }
    } catch (err) {
      console.error('Error loading institution analytics:', err);
      setError(err instanceof Error ? err : new Error('Failed to load analytics'));
    } finally {
      setLoading(false);
    }
  }, [user?.institutionId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const value: InstitutionAnalyticsContextType = {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };

  return (
    <InstitutionAnalyticsContext.Provider value={value}>
      {children}
    </InstitutionAnalyticsContext.Provider>
  );
}

export function useInstitutionAnalytics() {
  const context = useContext(InstitutionAnalyticsContext);
  if (context === undefined) {
    throw new Error(
      'useInstitutionAnalytics must be used within an InstitutionAnalyticsProvider'
    );
  }
  return context;
}
