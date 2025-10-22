import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export function DashboardStats() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Department Courses"
				value="18"
				icon={BookOpen}
				trend={{ value: 2, label: 'New this semester' }}
				variant="default"
			/>
			<StatCard
				title="Department Staff"
				value="12"
				icon={Users}
				trend={{ value: 0, label: 'Total instructors' }}
				variant="default"
			/>
			<StatCard
				title="Enrolled Students"
				value="234"
				icon={GraduationCap}
				trend={{ value: 6.7, label: 'vs last semester' }}
				variant="default"
			/>
			<StatCard
				title="Active Sections"
				value="32"
				icon={ClipboardList}
				trend={{ value: 4, label: 'Total sections' }}
				variant="default"
			/>
		</div>
	);
}
