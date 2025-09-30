import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: Readonly<LayoutProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile sidebar overlay */}
        <div
          className={cn(
            'fixed inset-0 z-50 lg:hidden',
            sidebarOpen ? 'block' : 'hidden'
          )}
        >
          <button
            type="button"
            className="fixed inset-0 bg-gray-600 bg-opacity-75 cursor-pointer"
            onClick={closeSidebar}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeSidebar();
            }}
            aria-label="Close sidebar"
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div
          className={cn(
            'hidden lg:flex lg:flex-shrink-0 transition-all duration-300',
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
          )}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="ml-2">Menu</span>
            </Button>
            
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop sidebar toggle (always visible on desktop) */}
          <div className="hidden lg:flex justify-end p-2 border-b bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}



