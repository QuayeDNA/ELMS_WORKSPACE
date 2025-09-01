import { Outlet } from 'react-router-dom';
import { Header } from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
}
