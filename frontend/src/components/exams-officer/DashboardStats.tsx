import { ClipboardList, Calendar, Users, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export function DashboardStats() {
	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<StatCard
				title="Active Exams"
				value="23"
				icon={ClipboardList}
				trend={{ value: 0, label: 'This semester' }}
				variant="default"
			/>
			<StatCard
				title="Upcoming Exams"
				value="8"
				icon={Calendar}
				trend={{ value: 0, label: 'Next 2 weeks' }}
				variant="default"
			/>
			<StatCard
				title="Total Candidates"
				value="1,847"
				icon={Users}
				trend={{ value: 4.2, label: 'vs last exam period' }}
				variant="default"
			/>
			<StatCard
				title="Completed Exams"
				value="15"
				icon={CheckCircle}
				trend={{ value: 65, label: '% completion rate' }}
				variant="default"
			/>
		</div>
	);
}
