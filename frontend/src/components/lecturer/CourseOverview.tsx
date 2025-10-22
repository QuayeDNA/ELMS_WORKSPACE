import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';

export function CourseOverview() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* My Courses */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-primary" />
						My Active Courses
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 301 - Data Structures</p>
							<p className="text-xs text-muted-foreground">
								45 students • Mon, Wed 10:00 AM
							</p>
						</div>
						<Badge>Active</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 401 - Algorithms</p>
							<p className="text-xs text-muted-foreground">
								38 students • Tue, Thu 2:00 PM
							</p>
						</div>
						<Badge>Active</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 205 - Web Development</p>
							<p className="text-xs text-muted-foreground">
								52 students • Mon, Wed 2:00 PM
							</p>
						</div>
						<Badge>Active</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 101 - Intro to Programming</p>
							<p className="text-xs text-muted-foreground">
								21 students • Fri 9:00 AM
							</p>
						</div>
						<Badge>Active</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Today's Schedule & Tasks */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-primary" />
						Today's Schedule & Tasks
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
							<BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">CS 301 Lecture</p>
								<p className="text-xs text-muted-foreground">
									10:00 AM - 11:30 AM • Room 201
								</p>
							</div>
							<Badge
								variant="outline"
								className="text-xs border-blue-600 text-blue-600"
							>
								In 2 hours
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
							<BookOpen className="h-4 w-4 text-purple-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">CS 205 Lab Session</p>
								<p className="text-xs text-muted-foreground">
									2:00 PM - 4:00 PM • Lab 101
								</p>
							</div>
							<Badge
								variant="outline"
								className="text-xs border-purple-600 text-purple-600"
							>
								Today
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
							<AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Grade Lab 3 Submissions</p>
								<p className="text-xs text-muted-foreground">
									Due by end of day • 23 submissions
								</p>
							</div>
							<Badge variant="destructive" className="text-xs">
								Urgent
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
