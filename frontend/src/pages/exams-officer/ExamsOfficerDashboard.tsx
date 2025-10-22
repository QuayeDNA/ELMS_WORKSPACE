import {
	DashboardStats,
	QuickActions,
	ExamOverview,
	ExamsAnalyticsBentoGrid,
	RecentActivity,
} from '@/components/exams-officer';

export default function ExamsOfficerDashboard() {
	return (
		<div className="space-y-8 p-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Exams Officer Dashboard
				</h1>
				<p className="text-muted-foreground mt-2">
					Examination management and coordination
				</p>
			</div>

			<DashboardStats />

			<QuickActions />

			<ExamOverview />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">
					Exam Analytics
				</h2>
				<ExamsAnalyticsBentoGrid />
			</div>

			<RecentActivity />
		</div>
	);
}
