import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { AppRoutes } from '@/routes/AppRoutes';
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
    </Router>
  );
}

export default App;
