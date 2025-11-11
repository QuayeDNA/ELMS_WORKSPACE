import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import './App.css';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth early in the app lifecycle
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <RealtimeProvider>
        <AppRoutes />
        <Toaster />
      </RealtimeProvider>
    </Router>
  );
}

export default App;



