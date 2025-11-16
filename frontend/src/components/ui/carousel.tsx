import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselProps {
	children: React.ReactNode[];
	itemsPerView?: number;
	itemsPerViewMobile?: number;
	className?: string;
}

export function Carousel({
	children,
	itemsPerView = 4,
	itemsPerViewMobile = 2,
	className = ''
}: CarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768); // md breakpoint
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const itemsPerViewCurrent = isMobile ? itemsPerViewMobile : itemsPerView;
	const totalItems = children.length;
	const maxIndex = Math.max(0, totalItems - itemsPerViewCurrent);

	const nextSlide = () => {
		setCurrentIndex((prev) => Math.min(prev + itemsPerViewCurrent, maxIndex));
	};

	const prevSlide = () => {
		setCurrentIndex((prev) => Math.max(prev - itemsPerViewCurrent, 0));
	};

	const visibleItems = children.slice(currentIndex, currentIndex + itemsPerViewCurrent);

	return (
		<div className={`relative ${className}`}>
			{/* Navigation Buttons - Hidden on very small screens */}
			{currentIndex > 0 && (
				<Button
					variant="outline"
					size="sm"
					className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md hidden sm:flex"
					onClick={prevSlide}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			)}

			{currentIndex < maxIndex && (
				<Button
					variant="outline"
					size="sm"
					className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md hidden sm:flex"
					onClick={nextSlide}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			)}

			{/* Mobile Navigation Buttons - Show when there are more items to navigate */}
			{totalItems > itemsPerViewCurrent && (
				<div className="flex justify-between items-center mb-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentIndex === 0}
						onClick={prevSlide}
						className="flex-1 mr-2"
					>
						<ChevronLeft className="h-4 w-4" />
						<span className="ml-1 hidden sm:inline">Prev</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={currentIndex >= maxIndex}
						onClick={nextSlide}
						className="flex-1 ml-2"
					>
						<span className="mr-1 hidden sm:inline">Next</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Carousel Content */}
			<div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
				{visibleItems.map((item, index) => (
					<div key={currentIndex + index}>
						{item}
					</div>
				))}
			</div>

			{/* Dots Indicator */}
			{totalItems > itemsPerViewCurrent && (
				<div className="flex justify-center mt-4 space-x-2">
					{Array.from({ length: Math.ceil(totalItems / itemsPerViewCurrent) }, (_, i) => (
						<button
							key={i}
							className={`w-2 h-2 rounded-full transition-colors ${
								i === Math.floor(currentIndex / itemsPerViewCurrent)
									? 'bg-blue-600'
									: 'bg-gray-300'
							}`}
							onClick={() => setCurrentIndex(i * itemsPerViewCurrent)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
