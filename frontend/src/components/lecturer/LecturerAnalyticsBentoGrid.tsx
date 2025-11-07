import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, PieChart } from 'lucide-react';

export function LecturerAnalyticsBentoGrid() {
	return (
		<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
			{/* Large Card - Student Performance Trends */}
			<Card className="md:col-span-2 md:row-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp className="h-4 w-4 text-primary" />
						Student Performance Trends
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold">82.4%</span>
							<span className="text-sm text-muted-foreground">
								average grade
							</span>
							<span className="text-sm font-medium text-green-600 flex items-center gap-1 ml-auto">
								<TrendingUp className="h-3 w-3" />
								+3.2%
							</span>
						</div>
						<div className="h-48 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 flex items-center justify-center">
							<div className="text-center space-y-2">
								<TrendingUp className="h-12 w-12 text-blue-400 mx-auto opacity-30" />
								<p className="text-sm text-muted-foreground">
									Chart: Grade trends across courses
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Assignment Submission Rate */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Submission Rate
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">91.5%</div>
						<div className="flex items-center gap-1 text-xs">
							<TrendingUp className="h-3 w-3 text-green-600" />
							<span className="font-medium text-green-600">+2.8%</span>
							<span className="text-muted-foreground">vs last month</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Class Average */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Class Participation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">87%</div>
						<div className="flex items-center gap-1 text-xs">
							<Users className="h-3 w-3 text-blue-600" />
							<span className="font-medium text-blue-600">Excellent</span>
							<span className="text-muted-foreground">engagement</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Medium Card - Grade Distribution */}
			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<PieChart className="h-4 w-4 text-primary" />
						Grade Distribution
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-32 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 flex items-center justify-center">
						<div className="text-center space-y-2">
							<PieChart className="h-10 w-10 text-purple-400 mx-auto opacity-30" />
							<p className="text-sm text-muted-foreground">
								Chart: Distribution of student grades
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
