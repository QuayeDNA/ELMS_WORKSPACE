import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, MapPin } from 'lucide-react';

export function ExamOverview() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Upcoming Exams */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Upcoming Exams This Week
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<Calendar className="h-4 w-4 text-primary mt-0.5" />
						<div className="flex-1 space-y-1">
							<p className="text-sm font-medium">CS 301 - Data Structures</p>
							<p className="text-xs text-muted-foreground">
								Nov 5, 2024 • 9:00 AM - 12:00 PM
							</p>
							<p className="text-xs text-muted-foreground">Hall A • 45 students</p>
						</div>
						<Badge>Tomorrow</Badge>
					</div>
					<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<Calendar className="h-4 w-4 text-primary mt-0.5" />
						<div className="flex-1 space-y-1">
							<p className="text-sm font-medium">MATH 202 - Calculus II</p>
							<p className="text-xs text-muted-foreground">
								Nov 6, 2024 • 2:00 PM - 5:00 PM
							</p>
							<p className="text-xs text-muted-foreground">Hall B • 78 students</p>
						</div>
						<Badge>2 days</Badge>
					</div>
					<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
						<Calendar className="h-4 w-4 text-primary mt-0.5" />
						<div className="flex-1 space-y-1">
							<p className="text-sm font-medium">ENG 101 - English Composition</p>
							<p className="text-xs text-muted-foreground">
								Nov 7, 2024 • 10:00 AM - 12:00 PM
							</p>
							<p className="text-xs text-muted-foreground">Hall C • 92 students</p>
						</div>
						<Badge>3 days</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Action Items */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-primary" />
						Action Items
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
							<AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">
									Missing Invigilator Assignment
								</p>
								<p className="text-xs text-muted-foreground">
									CS 301 exam requires 2 more invigilators
								</p>
							</div>
							<Badge variant="destructive" className="text-xs">
								Urgent
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
							<MapPin className="h-4 w-4 text-yellow-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Venue Conflict Detected</p>
								<p className="text-xs text-muted-foreground">
									Hall B scheduled for 2 exams on Nov 6
								</p>
							</div>
							<Badge
								variant="outline"
								className="text-xs border-yellow-600 text-yellow-600"
							>
								Warning
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
							<Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Pending Paper Submission</p>
								<p className="text-xs text-muted-foreground">
									3 exam papers awaiting approval
								</p>
							</div>
							<Badge
								variant="outline"
								className="text-xs border-blue-600 text-blue-600"
							>
								Review
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
