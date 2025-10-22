import {
	BookOpen,
	Users,
	Calendar,
	FileText,
	Settings,
	TrendingUp,
	ClipboardList,
	Award,
} from 'lucide-react';
import { ActionCard } from '@/components/ui/action-card';

export function QuickActions() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ActionCard
					title="Courses"
					description="Manage department course offerings"
					icon={BookOpen}
					href="/hod/courses"
					badge="18 Courses"
				/>
				<ActionCard
					title="Instructors"
					description="Oversee teaching staff assignments"
					icon={Users}
					href="/hod/instructors"
					badge="12 Staff"
				/>
				<ActionCard
					title="Course Sections"
					description="Manage course sections and schedules"
					icon={ClipboardList}
					href="/hod/sections"
					badge="32 Active"
				/>
				<ActionCard
					title="Timetable"
					description="View and manage department schedule"
					icon={Calendar}
					href="/hod/timetable"
				/>
				<ActionCard
					title="Student Performance"
					description="Monitor academic progress"
					icon={TrendingUp}
					href="/hod/performance"
				/>
				<ActionCard
					title="Course Reviews"
					description="Review course evaluations"
					icon={Award}
					href="/hod/reviews"
				/>
				<ActionCard
					title="Reports"
					description="Generate department reports"
					icon={FileText}
					href="/hod/reports"
				/>
				<ActionCard
					title="Department Settings"
					description="Configure department preferences"
					icon={Settings}
					href="/hod/settings"
				/>
			</div>
		</div>
	);
}
