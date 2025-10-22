import { RefreshCw, Clock, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface MaintenanceProps {
	expectedDuration?: string;
	message?: string;
	showRefresh?: boolean;
}

export function Maintenance({
	expectedDuration = '1-2 hours',
	message = "We're currently performing scheduled maintenance to improve your experience.",
	showRefresh = true,
}: MaintenanceProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<Card className="max-w-2xl w-full shadow-xl border-blue-200 dark:border-blue-900">
				<CardHeader className="text-center border-b">
					<div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 relative">
						<Wrench className="h-10 w-10 text-blue-600 dark:text-blue-400" />
						<Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 animate-pulse" />
					</div>
					<CardTitle className="text-3xl font-bold">
						Under Maintenance
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6 space-y-6">
					<div className="space-y-3 text-center">
						<h3 className="text-xl font-semibold text-foreground">
							We'll be back soon!
						</h3>
						<p className="text-muted-foreground">{message}</p>
					</div>

					{/* Maintenance Info */}
					<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">
								Expected Duration:
							</span>
							<span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
								{expectedDuration}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Status:</span>
							<span className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
								<div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
								In Progress
							</span>
						</div>
					</div>

					{/* What's being updated */}
					<div className="bg-muted/50 rounded-lg p-4 space-y-2">
						<p className="text-sm font-semibold text-foreground">
							What we're working on:
						</p>
						<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>System updates and improvements</li>
							<li>Performance optimizations</li>
							<li>Security enhancements</li>
							<li>Bug fixes and stability improvements</li>
						</ul>
					</div>

					{/* Progress Animation */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span>Maintenance Progress</span>
							<span className="font-medium">In Progress...</span>
						</div>
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse w-2/3" />
						</div>
					</div>

					{/* Action Buttons */}
					{showRefresh && (
						<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
							<Button
								onClick={() => window.location.reload()}
								className="gap-2"
							>
								<RefreshCw className="h-4 w-4" />
								Check Status
							</Button>
						</div>
					)}

					{/* Contact Info */}
					<div className="text-center pt-4 border-t">
						<p className="text-sm text-muted-foreground">
							For urgent matters, please contact{' '}
							<a
								href="mailto:support@elms.edu"
								className="text-primary hover:underline font-medium"
							>
								support@elms.edu
							</a>
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							We apologize for any inconvenience
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Additional Info */}
			<div className="mt-8 text-center">
				<p className="text-sm text-muted-foreground">
					Follow us on social media for real-time updates
				</p>
			</div>
		</div>
	);
}
