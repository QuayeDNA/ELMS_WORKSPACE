import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';

const activities = [
	{
		id: 1,
		user: 'John Smith',
		action: 'submitted assignment',
		target: 'Lab 3 - Data Structures',
		time: '15 minutes ago',
		color: 'bg-blue-500',
	},
	{
		id: 2,
		user: 'Sarah Johnson',
		action: 'posted question',
		target: 'CS 401 Discussion',
		time: '1 hour ago',
		color: 'bg-green-500',
	},
	{
		id: 3,
		user: 'Mike Wilson',
		action: 'completed quiz',
		target: 'Algorithm Quiz 2',
		time: '2 hours ago',
		color: 'bg-purple-500',
	},
	{
		id: 4,
		user: 'Emily Brown',
		action: 'requested extension',
		target: 'Project Proposal',
		time: '3 hours ago',
		color: 'bg-orange-500',
	},
	{
		id: 5,
		user: 'David Lee',
		action: 'submitted assignment',
		target: 'Web Dev Assignment 4',
		time: '5 hours ago',
		color: 'bg-pink-500',
	},
];

export function RecentActivity() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					Recent Student Activity
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
