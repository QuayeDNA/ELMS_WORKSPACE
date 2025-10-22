import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award } from 'lucide-react';

export function FacultyOverview() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* Current Academic Period */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Current Academic Period
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Semester</span>
							<Badge>Fall 2024</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Start Date</span>
							<span className="text-sm font-medium">Sep 1, 2024</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">End Date</span>
							<span className="text-sm font-medium">Dec 20, 2024</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">
								Days Remaining
							</span>
							<span className="text-sm font-semibold text-primary">45 days</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Faculty Milestones */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Award className="h-5 w-5 text-primary" />
						Upcoming Milestones
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
							<Clock className="h-4 w-4 text-primary mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Mid-term Exams</p>
								<p className="text-xs text-muted-foreground">
									November 15-20, 2024
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								2 weeks
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
							<Clock className="h-4 w-4 text-primary mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">Faculty Review Meeting</p>
								<p className="text-xs text-muted-foreground">
									November 8, 2024
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								1 week
							</Badge>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
							<Clock className="h-4 w-4 text-primary mt-0.5" />
							<div className="flex-1 space-y-1">
								<p className="text-sm font-medium">
									Accreditation Site Visit
								</p>
								<p className="text-xs text-muted-foreground">
									December 5, 2024
								</p>
							</div>
							<Badge variant="outline" className="text-xs">
								6 weeks
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
