import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';

const activities = [
	{
		id: 1,
		user: 'Dr. Smith',
		action: 'posted new assignment',
		target: 'Data Structures - Lab 4',
		time: '2 hours ago',
		color: 'bg-blue-500',
	},
	{
		id: 2,
		user: 'Prof. Johnson',
		action: 'graded assignment',
		target: 'Math Problem Set 3',
		time: '5 hours ago',
		color: 'bg-green-500',
	},
	{
		id: 3,
		user: 'Dr. Williams',
		action: 'posted announcement',
		target: 'Technical Writing Class',
		time: '1 day ago',
		color: 'bg-purple-500',
	},
	{
		id: 4,
		user: 'Prof. Brown',
		action: 'scheduled exam',
		target: 'Physics Midterm',
		time: '1 day ago',
		color: 'bg-orange-500',
	},
	{
		id: 5,
		user: 'System',
		action: 'reminder',
		target: 'Lab 3 due tomorrow',
		time: '2 days ago',
		color: 'bg-pink-500',
	},
];

export function RecentActivity() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					Recent Course Activity
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
