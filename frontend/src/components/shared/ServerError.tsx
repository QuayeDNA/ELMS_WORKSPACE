import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function ServerError() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-950 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<Card className="max-w-2xl w-full shadow-xl border-red-200 dark:border-red-900">
				<CardHeader className="text-center border-b">
					<div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
						<AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
					</div>
					<CardTitle className="text-3xl font-bold">
						500 - Server Error
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6 space-y-6">
					<div className="space-y-3 text-center">
						<h3 className="text-xl font-semibold text-foreground">
							Something went wrong on our end
						</h3>
						<p className="text-muted-foreground">
							We're experiencing technical difficulties. Our team has been
							automatically notified and is working to resolve the issue.
						</p>
					</div>

					{/* Status Info */}
					<div className="bg-muted/50 rounded-lg p-4 space-y-2">
						<p className="text-sm font-semibold text-foreground">
							What happened:
						</p>
						<p className="text-sm text-muted-foreground">
							The server encountered an internal error and was unable to
							complete your request. This is not your fault, and there's
							nothing wrong with your connection.
						</p>
					</div>

					{/* What to do */}
					<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
						<p className="text-sm font-semibold text-foreground">
							What you can do:
						</p>
						<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>Wait a few moments and try refreshing the page</li>
							<li>Clear your browser cache and cookies</li>
							<li>Try again in a few minutes</li>
							<li>If the problem persists, contact support</li>
						</ul>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
						<Button
							onClick={() => window.location.reload()}
							className="gap-2"
						>
							<RefreshCw className="h-4 w-4" />
							Refresh Page
						</Button>
						<Button
							variant="outline"
							onClick={() => (window.location.href = '/')}
							className="gap-2"
						>
							<Home className="h-4 w-4" />
							Go Home
						</Button>
					</div>

					{/* Error Code */}
					<div className="text-center pt-4 border-t">
						<p className="text-xs text-muted-foreground font-mono">
							Error Code: 500 | {new Date().toISOString()}
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Need immediate assistance?{' '}
							<a
								href="mailto:support@elms.edu"
								className="text-primary hover:underline font-medium"
							>
								Contact Support
							</a>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
