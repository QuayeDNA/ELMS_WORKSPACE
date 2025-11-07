import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<div className="text-center max-w-2xl">
				{/* 404 Display */}
				<div className="mb-8 relative">
					<h1 className="text-[12rem] sm:text-[16rem] font-bold text-gray-200 dark:text-gray-800 leading-none select-none">
						404
					</h1>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="bg-white dark:bg-gray-900 rounded-full p-8 shadow-xl">
							<Search className="h-16 w-16 text-blue-500" />
						</div>
					</div>
				</div>

				{/* Message */}
				<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
					Page Not Found
				</h2>

				<p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
					Sorry, the page you're looking for doesn't exist or has been moved.
					Let's get you back on track.
				</p>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button asChild size="lg" className="gap-2">
						<Link to="/">
							<Home className="h-5 w-5" />
							Go Home
						</Link>
					</Button>

					<Button
						variant="outline"
						size="lg"
						onClick={() => window.history.back()}
						className="gap-2"
					>
						<ArrowLeft className="h-5 w-5" />
						Go Back
					</Button>
				</div>

				{/* Help Text */}
				<div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Need help?{' '}
						<a
							href="mailto:support@elms.edu"
							className="text-primary hover:underline font-medium"
						>
							Contact Support
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
