import { Loader2 } from 'lucide-react';

interface LoadingPageProps {
	message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<div className="text-center space-y-6">
				{/* Animated Logo/Spinner */}
				<div className="relative">
					<div className="w-20 h-20 mx-auto">
						<Loader2 className="w-full h-full text-primary animate-spin" />
					</div>
					<div className="absolute inset-0 w-20 h-20 mx-auto bg-primary/20 rounded-full blur-xl animate-pulse" />
				</div>

				{/* Loading Message */}
				<div className="space-y-2">
					<h2 className="text-xl font-semibold text-foreground">{message}</h2>
					<p className="text-sm text-muted-foreground">
						Please wait while we prepare everything for you
					</p>
				</div>

				{/* Loading Dots Animation */}
				<div className="flex items-center justify-center gap-2">
					<div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
					<div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
					<div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
				</div>
			</div>
		</div>
	);
}
