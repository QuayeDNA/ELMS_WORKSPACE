import { BookOpen, Users, FileText, ClipboardCheck } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export function DashboardStats() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="My Courses"
				value="4"
				icon={BookOpen}
				trend={{ value: 0, label: 'Active courses' }}
				variant="default"
			/>
			<StatCard
				title="Total Students"
				value="156"
				icon={Users}
				trend={{ value: 8.3, label: 'vs last semester' }}
				variant="default"
			/>
			<StatCard
				title="Pending Grading"
				value="23"
				icon={FileText}
				trend={{ value: 0, label: 'Assignments to grade' }}
				variant="default"
			/>
			<StatCard
				title="Attendance Rate"
				value="94.2%"
				icon={ClipboardCheck}
				trend={{ value: 2.1, label: 'vs last month' }}
				variant="default"
			/>
		</div>
	);
}
