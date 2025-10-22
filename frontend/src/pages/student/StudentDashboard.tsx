import {
	DashboardStats,
	QuickActions,
	AcademicOverview,
	StudentAnalyticsBentoGrid,
	RecentActivity,
} from '@/components/student';

export default function StudentDashboard() {
	return (
		<div className="space-y-8 p-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Your academic progress and activities
				</p>
			</div>

			<DashboardStats />

			<QuickActions />

			<AcademicOverview />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">
					Academic Analytics
				</h2>
				<StudentAnalyticsBentoGrid />
			</div>

			<RecentActivity />
		</div>
	);
}
