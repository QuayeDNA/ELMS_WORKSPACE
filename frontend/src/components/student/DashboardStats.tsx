import { BookOpen, FileText, Calendar, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export function DashboardStats() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Enrolled Courses"
				value="6"
				icon={BookOpen}
				trend={{ value: 0, label: 'This semester' }}
				variant="default"
			/>
			<StatCard
				title="Pending Assignments"
				value="8"
				icon={FileText}
				trend={{ value: 0, label: 'Due this week' }}
				variant="default"
			/>
			<StatCard
				title="Upcoming Exams"
				value="3"
				icon={Calendar}
				trend={{ value: 0, label: 'Next 2 weeks' }}
				variant="default"
			/>
			<StatCard
				title="Current GPA"
				value="3.67"
				icon={TrendingUp}
				trend={{ value: 0.15, label: 'vs last semester' }}
				variant="default"
			/>
		</div>
	);
}
