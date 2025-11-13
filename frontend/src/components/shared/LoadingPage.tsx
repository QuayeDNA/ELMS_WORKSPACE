import { GraduationCap } from 'lucide-react';

interface LoadingPageProps {
	message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-950 flex flex-col justify-center items-center px-4">
			<div className="text-center space-y-8">
				{/* ELMS Logo/Brand */}
				<div className="relative">
					{/* Animated Background Rings */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-32 h-32 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-ping opacity-20" />
					</div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-24 h-24 border-4 border-blue-300 dark:border-blue-800 rounded-full animate-pulse" />
					</div>

					{/* Logo Container */}
					<div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform">
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

				{/* Loading Animation */}
				<div className="flex items-center justify-center gap-2">
					<div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
					<div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
					<div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
				</div>

				{/* Progress Bar */}
				<div className="w-64 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
					<div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
						 style={{ width: '40%' }}
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
