import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users } from 'lucide-react';

export function DepartmentOverview() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Active Courses */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BookOpen className="h-5 w-5 text-primary" />
						Active Courses This Semester
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 301 - Data Structures</p>
							<p className="text-xs text-muted-foreground">
								Dr. Smith • 45 students
							</p>
						</div>
						<Badge>3 sections</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 401 - Algorithms</p>
							<p className="text-xs text-muted-foreground">
								Dr. Johnson • 38 students
							</p>
						</div>
						<Badge>2 sections</Badge>
					</div>
					<div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<div className="space-y-1">
							<p className="text-sm font-medium">CS 205 - Web Development</p>
							<p className="text-xs text-muted-foreground">
								Prof. Williams • 52 students
							</p>
						</div>
						<Badge>3 sections</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Staff Schedule */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-primary" />
						Today's Schedule
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
							<Users className="h-4 w-4 text-primary mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Department Meeting</p>
								<p className="text-xs text-muted-foreground">
									10:00 AM - Conference Room A
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								In 2 hours
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
							<BookOpen className="h-4 w-4 text-primary mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Course Review Session</p>
								<p className="text-xs text-muted-foreground">
									2:00 PM - Lab 201
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								Today
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
							<Users className="h-4 w-4 text-primary mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Faculty Evaluation</p>
								<p className="text-xs text-muted-foreground">
									4:00 PM - Office
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								Today
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
