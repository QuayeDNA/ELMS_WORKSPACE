import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';

const activities = [
	{
		id: 1,
		user: 'Dr. Michael Chen',
		action: 'submitted course syllabus',
		target: 'Advanced Database Systems',
		time: '2 hours ago',
		color: 'bg-blue-500',
	},
	{
		id: 2,
		user: 'Prof. Sarah Johnson',
		action: 'updated department budget',
		target: 'Computer Science Department',
		time: '4 hours ago',
		color: 'bg-green-500',
	},
	{
		id: 3,
		user: 'Dr. James Wilson',
		action: 'requested equipment',
		target: 'Research Lab',
		time: '6 hours ago',
		color: 'bg-purple-500',
	},
	{
		id: 4,
		user: 'Dr. Emily Brown',
		action: 'published research paper',
		target: 'Journal of Computing',
		time: '1 day ago',
		color: 'bg-orange-500',
	},
	{
		id: 5,
		user: 'Prof. David Lee',
		action: 'scheduled faculty meeting',
		target: 'Monthly Review',
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
					Recent Faculty Activity
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
