import {
	DashboardStats,
	QuickActions,
	FacultyOverview,
	DeanAnalyticsBentoGrid,
	RecentActivity,
} from '@/components/dean';

export default function DeanDashboard() {
	return (
		<div className="space-y-8 p-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Dean Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Faculty management and oversight
				</p>
			</div>

			<DashboardStats />

			<QuickActions />

			<FacultyOverview />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">
					Faculty Analytics
				</h2>
				<DeanAnalyticsBentoGrid />
			</div>

			<RecentActivity />
		</div>
	);
}
