import {
	DashboardStats,
	QuickActions,
	DepartmentOverview,
	HodAnalyticsBentoGrid,
	RecentActivity,
} from '@/components/hod';

export default function HodDashboard() {
	return (
		<div className="space-y-8 p-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Head of Department Dashboard
				</h1>
				<p className="text-muted-foreground mt-2">
					Department management and oversight
				</p>
			</div>

			<DashboardStats />

			<QuickActions />

			<DepartmentOverview />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">
					Department Analytics
				</h2>
				<HodAnalyticsBentoGrid />
			</div>

			<RecentActivity />
		</div>
	);
}
