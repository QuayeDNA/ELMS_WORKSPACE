import {
	DashboardStats,
	QuickActions,
	CourseOverview,
	LecturerAnalyticsBentoGrid,
	RecentActivity,
} from '@/components/lecturer';

export default function LecturerDashboard() {
	return (
		<div className="space-y-8 p-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Lecturer Dashboard
				</h1>
				<p className="text-muted-foreground mt-2">
					Course and student management
				</p>
			</div>

			<DashboardStats />

			<QuickActions />

			<CourseOverview />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">
					Teaching Analytics
				</h2>
				<LecturerAnalyticsBentoGrid />
			</div>

			<RecentActivity />
		</div>
	);
}
