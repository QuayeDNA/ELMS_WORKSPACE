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
import { Carousel } from '@/components/ui/carousel';

export function QuickActions() {
	const actions = [
		<ActionCard
			key="courses"
			title="My Courses"
			description="View enrolled courses and materials"
			icon={BookOpen}
			href="/student/courses"
			badge="6 Courses"
		/>,
		<ActionCard
			key="assignments"
			title="Assignments"
			description="View and submit assignments"
			icon={FileText}
			href="/student/assignments"
			badge="8 Pending"
		/>,
		<ActionCard
			key="exams"
			title="Exam Schedule"
			description="View upcoming exams"
			icon={Calendar}
			href="/student/exams"
			badge="3 Upcoming"
		/>,
		<ActionCard
			key="grades"
			title="Grades"
			description="Check your academic progress"
			icon={Award}
			href="/student/grades"
		/>,
		<ActionCard
			key="announcements"
			title="Announcements"
			description="View course announcements"
			icon={Bell}
			href="/student/announcements"
			badge="5 New"
		/>,
		<ActionCard
			key="discussions"
			title="Discussion Forums"
			description="Participate in course discussions"
			icon={MessageSquare}
			href="/student/discussions"
		/>,
		<ActionCard
			key="progress"
			title="Academic Progress"
			description="View detailed performance analytics"
			icon={BarChart}
			href="/student/progress"
		/>,
		<ActionCard
			key="profile"
			title="Profile"
			description="Update your profile information"
			icon={User}
			href="/student/profile"
		/>,
	];

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
			<Carousel itemsPerView={4} itemsPerViewMobile={4} className="overflow-hidden">
				{actions}
			</Carousel>
		</div>
	);
}
