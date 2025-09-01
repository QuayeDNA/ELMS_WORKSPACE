import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b h-16 flex-shrink-0">
      <div className="h-full px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">ELMS</h1>
          <span className="hidden md:block text-sm text-gray-500">
            Examination Logistics Management System
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:block text-sm text-gray-700">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {user?.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
