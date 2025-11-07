import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: Readonly<LayoutProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [children]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            {/* Sidebar */}
            <div className={cn(
              "absolute top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              {/* Close button */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebar}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
          )}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header with menu button */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="gap-2"
            >
              <Menu className="h-5 w-5" />
              <span className="font-medium">Menu</span>
            </Button>
          </div>

          {/* Desktop sidebar toggle */}
          <div className="hidden lg:flex items-center justify-end px-4 py-2 bg-white border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="gap-2"
            >
              {sidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="h-4 w-4" />
                  <span className="text-xs">Expand</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span className="text-xs">Collapse</span>
                </>
              )}
            </Button>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}



