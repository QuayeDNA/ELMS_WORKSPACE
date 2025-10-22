import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';

const activities = [
	{
		id: 1,
		user: 'System',
		action: 'published exam schedule',
		target: 'CS 301 - Data Structures',
		time: '30 minutes ago',
		color: 'bg-blue-500',
	},
	{
		id: 2,
		user: 'Dr. Smith',
		action: 'submitted exam paper',
		target: 'MATH 202 - Calculus II',
		time: '2 hours ago',
		color: 'bg-green-500',
	},
	{
		id: 3,
		user: 'Admin',
		action: 'assigned invigilator',
		target: 'Hall A - Morning Shift',
		time: '4 hours ago',
		color: 'bg-purple-500',
	},
	{
		id: 4,
		user: 'System',
		action: 'detected venue conflict',
		target: 'Hall B - Nov 6',
		time: '5 hours ago',
		color: 'bg-orange-500',
	},
	{
		id: 5,
		user: 'Prof. Johnson',
		action: 'updated exam duration',
		target: 'ENG 101 - English',
		time: '1 day ago',
		color: 'bg-pink-500',
	},
];

export function RecentActivity() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					Recent Exam Activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity) => (
						<div key={activity.id} className="flex items-start gap-4">
							<Avatar className="h-9 w-9">
								<AvatarFallback className={activity.color}>
									{activity.user
										.split(' ')
										.map((n) => n[0])
										.join('')}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 space-y-1">
								<p className="text-sm">
									<span className="font-medium">{activity.user}</span>{' '}
									<span className="text-muted-foreground">
										{activity.action}
									</span>{' '}
									<span className="font-medium">{activity.target}</span>
								</p>
								<p className="text-xs text-muted-foreground">{activity.time}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
