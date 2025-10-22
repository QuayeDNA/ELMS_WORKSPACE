import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function Forbidden() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<Card className="max-w-2xl w-full shadow-xl border-purple-200 dark:border-purple-900">
				<CardHeader className="text-center border-b">
					<div className="mx-auto w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 relative">
						<ShieldX className="h-10 w-10 text-purple-600 dark:text-purple-400" />
						<AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400 absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1" />
					</div>
					<CardTitle className="text-3xl font-bold">
						403 - Forbidden
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6 space-y-6">
					<div className="space-y-3 text-center">
						<h3 className="text-xl font-semibold text-foreground">
							Access to this resource is forbidden
						</h3>
						<p className="text-muted-foreground">
							You don't have the necessary permissions to access this resource.
							This action has been logged for security purposes.
						</p>
					</div>

					{/* Security Notice */}
					<div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4 space-y-2">
						<div className="flex items-start gap-2">
							<AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-semibold text-foreground">
									Security Notice
								</p>
								<p className="text-sm text-muted-foreground">
									Repeated attempts to access forbidden resources may result in
									your account being temporarily suspended. If you need access,
									please request permission from your administrator.
								</p>
							</div>
						</div>
					</div>

					{/* What to do */}
					<div className="bg-muted/50 rounded-lg p-4 space-y-2">
						<p className="text-sm font-semibold text-foreground">
							What you can do:
						</p>
						<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>Verify you're using the correct account</li>
							<li>Request access from your system administrator</li>
							<li>Check if your role has the required permissions</li>
							<li>Contact support if you believe this is an error</li>
						</ul>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
						<Button asChild className="gap-2">
							<Link to="/">
								<Home className="h-4 w-4" />
								Go Home
							</Link>
						</Button>
						<Button
							variant="outline"
							onClick={() => window.history.back()}
							className="gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Go Back
						</Button>
					</div>

					{/* Contact Support */}
					<div className="text-center pt-4 border-t">
						<p className="text-sm text-muted-foreground">
							Need access?{' '}
							<a
								href="mailto:admin@elms.edu"
								className="text-primary hover:underline font-medium"
							>
								Contact Administrator
							</a>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
