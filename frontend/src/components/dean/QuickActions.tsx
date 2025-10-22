import {
	Building2,
	BookOpen,
	Users,
	Calendar,
	FileText,
	Settings,
	TrendingUp,
	Award,
} from 'lucide-react';
import { ActionCard } from '@/components/ui/action-card';

export function QuickActions() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ActionCard
					title="Departments"
					description="Manage faculty departments and organizational structure"
					icon={Building2}
					href="/dean/departments"
					badge="8 Active"
				/>
				<ActionCard
					title="Courses"
					description="Oversee course offerings and curriculum"
					icon={BookOpen}
					href="/dean/courses"
					badge="124 Courses"
				/>
				<ActionCard
					title="Instructors"
					description="Manage faculty members and assignments"
					icon={Users}
					href="/dean/instructors"
					badge="67 Staff"
				/>
				<ActionCard
					title="Academic Calendar"
					description="View and manage faculty academic schedule"
					icon={Calendar}
					href="/dean/calendar"
				/>
				<ActionCard
					title="Faculty Reports"
					description="Generate and review faculty performance reports"
					icon={FileText}
					href="/dean/reports"
				/>
				<ActionCard
					title="Analytics"
					description="View faculty performance metrics"
					icon={TrendingUp}
					href="/dean/analytics"
				/>
				<ActionCard
					title="Accreditation"
					description="Track accreditation requirements"
					icon={Award}
					href="/dean/accreditation"
				/>
				<ActionCard
					title="Faculty Settings"
					description="Configure faculty-specific settings"
					icon={Settings}
					href="/dean/settings"
				/>
			</div>
		</div>
	);
}
