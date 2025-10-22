import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';

export function AcademicOverview() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Current Courses */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-primary" />
						My Current Courses
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 301 - Data Structures</p>
							<p className="text-xs text-muted-foreground">
								Dr. Smith • Mon, Wed 10:00 AM
							</p>
						</div>
						<Badge className="bg-green-500">A-</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">MATH 202 - Calculus II</p>
							<p className="text-xs text-muted-foreground">
								Prof. Johnson • Tue, Thu 9:00 AM
							</p>
						</div>
						<Badge className="bg-blue-500">B+</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">ENG 201 - Technical Writing</p>
							<p className="text-xs text-muted-foreground">
								Dr. Williams • Wed, Fri 2:00 PM
							</p>
						</div>
						<Badge className="bg-green-500">A</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">PHY 101 - Physics I</p>
							<p className="text-xs text-muted-foreground">
								Prof. Brown • Mon, Wed 1:00 PM
							</p>
						</div>
						<Badge className="bg-blue-500">B</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Upcoming Deadlines */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-primary" />
						Upcoming Deadlines
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
							<AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Lab 3 - Data Structures</p>
								<p className="text-xs text-muted-foreground">
									Due: Tomorrow at 11:59 PM
								</p>
							</div>
							<Badge variant="destructive" className="text-xs">
								Urgent
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
							<Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Math Problem Set 4</p>
								<p className="text-xs text-muted-foreground">
									Due: Nov 7, 2024 at 11:59 PM
								</p>
							</div>
							<Badge
								variant="outline"
								className="text-xs border-yellow-600 text-yellow-600"
							>
								3 days
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
							<BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Essay - Technical Writing</p>
								<p className="text-xs text-muted-foreground">
									Due: Nov 10, 2024 at 11:59 PM
								</p>
							</div>
							<Badge
								variant="outline"
								className="text-xs border-blue-600 text-blue-600"
							>
								6 days
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
