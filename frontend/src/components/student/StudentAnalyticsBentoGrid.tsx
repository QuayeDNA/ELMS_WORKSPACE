import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, BarChart, PieChart } from 'lucide-react';

export function StudentAnalyticsBentoGrid() {
	return (
		<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
			{/* Large Card - GPA Trends */}
			<Card className="md:col-span-2 md:row-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp className="h-4 w-4 text-primary" />
						Academic Performance Trends
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold">3.67</span>
							<span className="text-sm text-muted-foreground">
								current GPA
							</span>
							<span className="text-sm font-medium text-green-600 flex items-center gap-1 ml-auto">
								<TrendingUp className="h-3 w-3" />
								+0.15
							</span>
						</div>
						<div className="h-48 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 flex items-center justify-center">
							<div className="text-center space-y-2">
								<TrendingUp className="h-12 w-12 text-blue-400 mx-auto opacity-30" />
								<p className="text-sm text-muted-foreground">
									Chart: GPA trend over time
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Credits Earned */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Credits Earned
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">78/120</div>
						<div className="flex items-center gap-1 text-xs">
							<Award className="h-3 w-3 text-blue-600" />
							<span className="font-medium text-blue-600">65%</span>
							<span className="text-muted-foreground">complete</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Attendance Rate */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Attendance Rate
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">95.2%</div>
						<div className="flex items-center gap-1 text-xs">
							<TrendingUp className="h-3 w-3 text-green-600" />
							<span className="font-medium text-green-600">Excellent</span>
							<span className="text-muted-foreground">record</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Medium Card - Grade Distribution */}
			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<PieChart className="h-4 w-4 text-primary" />
						Current Semester Grades
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-32 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 flex items-center justify-center">
						<div className="text-center space-y-2">
							<PieChart className="h-10 w-10 text-purple-400 mx-auto opacity-30" />
							<p className="text-sm text-muted-foreground">
								Chart: Distribution of current grades
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
