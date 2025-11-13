import { GraduationCap } from 'lucide-react';

interface LoadingPageProps {
	message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<div className="text-center space-y-8">
				{/* ELMS Logo/Brand */}
				<div className="relative">
					{/* Logo Container */}
					<div className="relative w-20 h-20 mx-auto bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
						<GraduationCap className="w-10 h-10 text-white" />
					</div>
				</div>

				{/* Brand Name */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
						ELMS
					</h1>
					<p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
						Examination Logistics Management System
					</p>
				</div>

				{/* Loading Message */}
				<div className="space-y-3 max-w-md">
					<h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
						{message}
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Please wait while we prepare everything for you
					</p>
				</div>

				{/* Progress Bar */}
				<div className="w-64 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
					<div className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '40%' }}
					/>
				</div>
			</div>

			{/* Footer */}
			<div className="absolute bottom-8 text-center">
				<p className="text-xs text-gray-400 dark:text-gray-600">
					Powered by Academic Excellence
				</p>
			</div>

			<style>{`
				@keyframes shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(400%); }
				}
			`}</style>
		</div>
	);
}
