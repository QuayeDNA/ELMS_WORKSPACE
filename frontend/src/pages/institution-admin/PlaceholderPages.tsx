import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="p-6 min-h-screen flex flex-col justify-center items-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          {icon || <Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-8">{description}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800 text-sm">
            🚧 This page is currently under development. Please check back later for updates.
          </p>
        </div>

        <Link
          to="/admin/institution"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// Specific page components using the placeholder
export function ExamsPage() {
  return (
    <PlaceholderPage
      title="Exams Management"
      description="Manage exam schedules, create assessments, and monitor exam logistics."
    />
  );
}

export function IncidentsPage() {
  return (
    <PlaceholderPage
      title="Incidents Reporting"
      description="Track and manage security incidents, violations, and exam irregularities."
    />
  );
}

export function ReportsPage() {
  return (
    <PlaceholderPage
      title="Reports & Analytics"
      description="Generate comprehensive reports and view analytical insights."
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="System Settings"
      description="Configure system preferences, user permissions, and institutional settings."
    />
  );
}



