import {
	ClipboardList,
	Calendar,
	MapPin,
	Users,
	FileText,
	Settings,
	AlertTriangle,
	TrendingUp,
} from 'lucide-react';
import { ActionCard } from '@/components/ui/action-card';

export function QuickActions() {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ActionCard
					title="Exam Schedule"
					description="Create and manage exam timetables"
					icon={Calendar}
					href="/exams-officer/schedule"
					badge="23 Active"
				/>
				<ActionCard
					title="Exam Venues"
					description="Assign and manage examination venues"
					icon={MapPin}
					href="/exams-officer/venues"
				/>
				<ActionCard
					title="Invigilators"
					description="Manage exam invigilator assignments"
					icon={Users}
					href="/exams-officer/invigilators"
				/>
				<ActionCard
					title="Exam Papers"
					description="Handle exam paper submissions"
					icon={ClipboardList}
					href="/exams-officer/papers"
				/>
				<ActionCard
					title="Results"
					description="Process and publish exam results"
					icon={FileText}
					href="/exams-officer/results"
				/>
				<ActionCard
					title="Incidents"
					description="Track and manage exam incidents"
					icon={AlertTriangle}
					href="/exams-officer/incidents"
					badge="2 Open"
				/>
				<ActionCard
					title="Analytics"
					description="View exam statistics and trends"
					icon={TrendingUp}
					href="/exams-officer/analytics"
				/>
				<ActionCard
					title="Exam Settings"
					description="Configure examination settings"
					icon={Settings}
					href="/exams-officer/settings"
				/>
			</div>
		</div>
	);
}
