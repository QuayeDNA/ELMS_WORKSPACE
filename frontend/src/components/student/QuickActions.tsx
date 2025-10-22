import {
	BookOpen,
	FileText,
	Calendar,
	Award,
	MessageSquare,
	Bell,
	BarChart,
	User,
} from 'lucide-react';
import { ActionCard } from '@/components/ui/action-card';

export function QuickActions() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ActionCard
					title="My Courses"
					description="View enrolled courses and materials"
					icon={BookOpen}
					href="/student/courses"
					badge="6 Courses"
				/>
				<ActionCard
					title="Assignments"
					description="View and submit assignments"
					icon={FileText}
					href="/student/assignments"
					badge="8 Pending"
				/>
				<ActionCard
					title="Exam Schedule"
					description="View upcoming exams"
					icon={Calendar}
					href="/student/exams"
					badge="3 Upcoming"
				/>
				<ActionCard
					title="Grades"
					description="Check your academic progress"
					icon={Award}
					href="/student/grades"
				/>
				<ActionCard
					title="Announcements"
					description="View course announcements"
					icon={Bell}
					href="/student/announcements"
					badge="5 New"
				/>
				<ActionCard
					title="Discussion Forums"
					description="Participate in course discussions"
					icon={MessageSquare}
					href="/student/discussions"
				/>
				<ActionCard
					title="Academic Progress"
					description="View detailed performance analytics"
					icon={BarChart}
					href="/student/progress"
				/>
				<ActionCard
					title="Profile"
					description="Update your profile information"
					icon={User}
					href="/student/profile"
				/>
			</div>
		</div>
	);
}
