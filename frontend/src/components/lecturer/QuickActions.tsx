import {
	BookOpen,
	Users,
	FileText,
	Calendar,
	ClipboardCheck,
	MessageSquare,
	BarChart,
	Settings,
} from 'lucide-react';
import { ActionCard } from '@/components/ui/action-card';

export function QuickActions() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ActionCard
					title="My Courses"
					description="View and manage your courses"
					icon={BookOpen}
					href="/lecturer/courses"
					badge="4 Active"
				/>
				<ActionCard
					title="Students"
					description="View student roster and details"
					icon={Users}
					href="/lecturer/students"
					badge="156 Students"
				/>
				<ActionCard
					title="Assignments"
					description="Create and grade assignments"
					icon={FileText}
					href="/lecturer/assignments"
					badge="23 Pending"
				/>
				<ActionCard
					title="Attendance"
					description="Track student attendance"
					icon={ClipboardCheck}
					href="/lecturer/attendance"
				/>
				<ActionCard
					title="Schedule"
					description="View your teaching schedule"
					icon={Calendar}
					href="/lecturer/schedule"
				/>
				<ActionCard
					title="Announcements"
					description="Post course announcements"
					icon={MessageSquare}
					href="/lecturer/announcements"
				/>
				<ActionCard
					title="Grade Analytics"
					description="View student performance data"
					icon={BarChart}
					href="/lecturer/analytics"
				/>
				<ActionCard
					title="Course Settings"
					description="Configure course preferences"
					icon={Settings}
					href="/lecturer/settings"
				/>
			</div>
		</div>
	);
}
