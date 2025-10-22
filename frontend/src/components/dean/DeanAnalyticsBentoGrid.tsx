import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, BookOpen, PieChart } from 'lucide-react';

export function DeanAnalyticsBentoGrid() {
	return (
		<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
			{/* Large Card - Course Enrollment Trends */}
			<Card className="md:col-span-2 md:row-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp className="h-4 w-4 text-primary" />
						Faculty Enrollment Trends
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold">892</span>
							<span className="text-sm text-muted-foreground">students</span>
							<span className="text-sm font-medium text-green-600 flex items-center gap-1 ml-auto">
								<TrendingUp className="h-3 w-3" />
								+8.4%
							</span>
						</div>
						<div className="h-48 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 flex items-center justify-center">
							<div className="text-center space-y-2">
								<TrendingUp className="h-12 w-12 text-blue-400 mx-auto opacity-30" />
								<p className="text-sm text-muted-foreground">
									Chart: Faculty enrollment over time
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Student-Faculty Ratio */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Student-Faculty Ratio
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">13:1</div>
						<div className="flex items-center gap-1 text-xs">
							<TrendingUp className="h-3 w-3 text-green-600" />
							<span className="font-medium text-green-600">Improved</span>
							<span className="text-muted-foreground">vs last year</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Course Completion Rate */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Course Completion
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">89.2%</div>
						<div className="flex items-center gap-1 text-xs">
							<TrendingUp className="h-3 w-3 text-green-600" />
							<span className="font-medium text-green-600">+3.8%</span>
							<span className="text-muted-foreground">vs last semester</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Medium Card - Department Distribution */}
			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<PieChart className="h-4 w-4 text-primary" />
						Students by Department
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-32 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 flex items-center justify-center">
						<div className="text-center space-y-2">
							<PieChart className="h-10 w-10 text-purple-400 mx-auto opacity-30" />
							<p className="text-sm text-muted-foreground">
								Chart: Distribution across 8 departments
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
