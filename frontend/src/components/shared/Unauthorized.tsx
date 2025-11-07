import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Unauthorized() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<Card className="max-w-2xl w-full shadow-xl border-red-200 dark:border-red-900">
				<CardHeader className="text-center border-b">
					<div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 relative">
						<ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
						<Lock className="h-6 w-6 text-red-600 dark:text-red-400 absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1" />
					</div>
					<CardTitle className="text-3xl font-bold">
						Access Denied
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6 space-y-6">
					<div className="space-y-3 text-center">
						<h3 className="text-xl font-semibold text-foreground">
							You don't have permission to access this page
						</h3>
						<p className="text-muted-foreground">
							This page requires specific permissions or role access that your
							account doesn't have. If you believe this is an error, please
							contact your administrator.
						</p>
					</div>

					{/* Possible Reasons */}
					<div className="bg-muted/50 rounded-lg p-4 space-y-2">
						<p className="text-sm font-semibold text-foreground">
							Possible reasons:
						</p>
						<ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>You need to sign in with a different account</li>
							<li>Your account role doesn't have access to this resource</li>
							<li>The resource requires additional permissions</li>
							<li>Your session may have expired</li>
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
							Need help?{' '}
							<a
								href="mailto:support@elms.edu"
								className="text-primary hover:underline font-medium"
							>
								Contact Support
							</a>{' '}
							or your system administrator
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
