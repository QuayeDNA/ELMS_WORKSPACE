import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth early in the app lifecycle
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}

export default App;



