import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart, Users, BookOpen } from 'lucide-react';

export function HodAnalyticsBentoGrid() {
	return (
		<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
			{/* Large Card - Course Performance Trends */}
			<Card className="md:col-span-2 md:row-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp className="h-4 w-4 text-primary" />
						Department Performance Trends
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold">86.4%</span>
							<span className="text-sm text-muted-foreground">
								avg completion rate
							</span>
							<span className="text-sm font-medium text-green-600 flex items-center gap-1 ml-auto">
								<TrendingUp className="h-3 w-3" />
								+4.2%
							</span>
						</div>
						<div className="h-48 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 flex items-center justify-center">
							<div className="text-center space-y-2">
								<TrendingUp className="h-12 w-12 text-blue-400 mx-auto opacity-30" />
								<p className="text-sm text-muted-foreground">
									Chart: Course completion over time
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Average Class Size */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Average Class Size
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">28</div>
						<div className="flex items-center gap-1 text-xs">
							<Users className="h-3 w-3 text-blue-600" />
							<span className="font-medium text-blue-600">Optimal</span>
							<span className="text-muted-foreground">capacity</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Small Card - Student Satisfaction */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-sm font-medium text-muted-foreground">
						Student Satisfaction
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="text-2xl font-bold">4.2/5</div>
						<div className="flex items-center gap-1 text-xs">
							<TrendingUp className="h-3 w-3 text-green-600" />
							<span className="font-medium text-green-600">+0.3</span>
							<span className="text-muted-foreground">vs last semester</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Medium Card - Course Distribution */}
			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<BarChart className="h-4 w-4 text-primary" />
						Students by Course Level
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-32 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 flex items-center justify-center">
						<div className="text-center space-y-2">
							<BarChart className="h-10 w-10 text-purple-400 mx-auto opacity-30" />
							<p className="text-sm text-muted-foreground">
								Chart: Distribution across course levels
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
