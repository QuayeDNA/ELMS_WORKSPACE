import { Users, BookOpen, Building2, GraduationCap } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export function DashboardStats() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Departments"
				value="8"
				icon={Building2}
				trend={{ value: 0, label: 'Total departments' }}
				variant="default"
			/>
			<StatCard
				title="Total Courses"
				value="124"
				icon={BookOpen}
				trend={{ value: 5.2, label: 'vs last semester' }}
				variant="default"
			/>
			<StatCard
				title="Faculty Instructors"
				value="67"
				icon={Users}
				trend={{ value: 3.1, label: 'vs last semester' }}
				variant="default"
			/>
			<StatCard
				title="Enrolled Students"
				value="892"
				icon={GraduationCap}
				trend={{ value: 8.4, label: 'vs last semester' }}
				variant="default"
			/>
		</div>
	);
}
