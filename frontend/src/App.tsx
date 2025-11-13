import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RealtimeProvider>
          <AppRoutes />
          <Toaster />
        </RealtimeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;



