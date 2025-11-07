import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});
	}

	private handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	private handleReload = () => {
		window.location.reload();
	};

	private handleGoHome = () => {
		window.location.href = '/';
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
					<Card className="max-w-2xl w-full shadow-lg">
						<CardHeader className="text-center border-b">
							<div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
								<AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
							</div>
							<CardTitle className="text-2xl font-bold">
								Oops! Something went wrong
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6 space-y-6">
							<div className="space-y-2">
								<p className="text-center text-muted-foreground">
									We encountered an unexpected error. Our team has been notified
									and is working to fix it.
								</p>
							</div>

							{this.state.error && (
								<div className="bg-muted/50 rounded-lg p-4 space-y-2">
									<p className="text-sm font-semibold text-foreground">
										Error Details:
									</p>
									<p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
										{this.state.error.toString()}
									</p>
									{this.state.errorInfo && (
										<details className="mt-2">
											<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
												Stack Trace
											</summary>
											<pre className="mt-2 text-xs font-mono text-muted-foreground overflow-auto max-h-48 p-2 bg-background rounded">
												{this.state.errorInfo.componentStack}
											</pre>
										</details>
									)}
								</div>
							)}

							<div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
								<Button
									onClick={this.handleReset}
									variant="outline"
									className="gap-2"
								>
									<RefreshCw className="h-4 w-4" />
									Try Again
								</Button>
								<Button
									onClick={this.handleReload}
									variant="outline"
									className="gap-2"
								>
									<RefreshCw className="h-4 w-4" />
									Reload Page
								</Button>
								<Button onClick={this.handleGoHome} className="gap-2">
									<Home className="h-4 w-4" />
									Go Home
								</Button>
							</div>

							<div className="text-center pt-4 border-t">
								<p className="text-xs text-muted-foreground">
									If this problem persists, please contact{' '}
									<a
										href="mailto:support@elms.edu"
										className="text-primary hover:underline"
									>
										support@elms.edu
									</a>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
