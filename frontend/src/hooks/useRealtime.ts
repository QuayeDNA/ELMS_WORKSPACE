import { useContext } from 'react';
import { RealtimeContextValue } from '../types/realtime';
import { RealtimeContext } from '../contexts/RealtimeContext';

export const useRealtime = (): RealtimeContextValue => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
