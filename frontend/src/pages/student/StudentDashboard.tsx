import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { studentService } from '@/services/student.service';
import { registrationService, CourseOfferingWithDetails, StudentRegistration } from '@/services/registration.service';
import { academicService } from '@/services/academic.service';
import { Student } from '@/types/student';
import { StudentIdCard } from '@/components/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { GraduationCap, Book, CheckCircle, XCircle } from 'lucide-react';

export default function StudentDashboard() {
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
	const [isNewStudent, setIsNewStudent] = useState(false);

	// Fetch student profile data
	const {
		data: studentProfile,
		isLoading,
		error,
	} = useQuery<Student>({
		queryKey: ['studentProfile', user?.id],
		queryFn: async () => {
			if (!user?.id) throw new Error('User not authenticated');
			return await studentService.getStudentByUserId(user.id);
		},
		enabled: !!user?.id,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch current semester
	const { data: currentSemester } = useQuery({
		queryKey: ['currentSemester'],
		queryFn: async () => {
			const response = await academicService.getCurrentSemester();
			return response.data;
		},
		staleTime: 10 * 60 * 1000,
	});

	// Fetch available courses
	const {
		data: availableCourses,
		isLoading: isLoadingCourses,
		error: coursesError
	} = useQuery<CourseOfferingWithDetails[]>({
		queryKey: ['availableCourses', currentSemester?.id],
		queryFn: async () => {
			if (!currentSemester?.id) return [];
			return await registrationService.getAvailableCourses(currentSemester.id);
		},
		enabled: !!currentSemester?.id,
		staleTime: 5 * 60 * 1000,
	});

	// Fetch student's current registration
	const {
		data: currentRegistration,
		isLoading: isLoadingRegistration
	} = useQuery<StudentRegistration | null>({
		queryKey: ['studentRegistration', user?.id, currentSemester?.id],
		queryFn: async () => {
			if (!user?.id || !currentSemester?.id) return null;
			return await registrationService.getStudentRegistration(user.id, currentSemester.id);
		},
		enabled: !!user?.id && !!currentSemester?.id,
		staleTime: 2 * 60 * 1000,
	});

	// Register for courses mutation
	const registerMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id || !currentSemester?.id || selectedCourses.length === 0) {
				throw new Error('Missing required information');
			}
			return await registrationService.registerForCourses(
				user.id,
				currentSemester.id,
				selectedCourses
			);
		},
		onSuccess: (data) => {
			toast.success(data.message || `Successfully registered for ${selectedCourses.length} course(s)`);
			setSelectedCourses([]);
			queryClient.invalidateQueries({ queryKey: ['studentRegistration'] });
			queryClient.invalidateQueries({ queryKey: ['availableCourses'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to register for courses');
		},
	});

	// Drop courses mutation
	const dropCoursesMutation = useMutation({
		mutationFn: async (courseOfferingIds: number[]) => {
			if (!user?.id || !currentSemester?.id) {
				throw new Error('Missing required information');
			}
			return await registrationService.dropCourses(
				user.id,
				currentSemester.id,
				courseOfferingIds
			);
		},
		onSuccess: (data) => {
			toast.success(data.message || 'Course(s) dropped successfully');
			queryClient.invalidateQueries({ queryKey: ['studentRegistration'] });
			queryClient.invalidateQueries({ queryKey: ['availableCourses'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to drop course(s)');
		},
	});

	// Cancel registration mutation
	const cancelRegistrationMutation = useMutation({
		mutationFn: async () => {
			if (!user?.id || !currentSemester?.id) {
				throw new Error('Missing required information');
			}
			return await registrationService.cancelRegistration(user.id, currentSemester.id);
		},
		onSuccess: (data) => {
			toast.success(data.message || 'Registration cancelled successfully');
			queryClient.invalidateQueries({ queryKey: ['studentRegistration'] });
			queryClient.invalidateQueries({ queryKey: ['availableCourses'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to cancel registration');
		},
	});

	// Toggle course selection
	const toggleCourseSelection = (courseOfferingId: number) => {
		setSelectedCourses(prev =>
			prev.includes(courseOfferingId)
				? prev.filter(id => id !== courseOfferingId)
				: [...prev, courseOfferingId]
		);
	};

	// Calculate total credits for selected courses
	const selectedCredits = availableCourses
		?.filter(course => selectedCourses.includes(course.id))
		.reduce((sum, course) => sum + course.course.creditHours, 0) || 0;

	// Check if student is newly registered
	useEffect(() => {
		if (studentProfile?.createdAt) {
			const createdDate = new Date(studentProfile.createdAt);
			const now = new Date();
			const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
			setIsNewStudent(hoursSinceCreation < 24);
		}
	}, [studentProfile]);

	if (isLoading) {
		return (
			<div className="space-y-8 p-8">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-64" />
				<Skeleton className="h-96" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-8 p-8">
				<Alert variant="destructive">
					<AlertDescription>
						Failed to load student profile. Please try refreshing the page.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			{/* Welcome Header */}
			<div>
				<div className="flex items-center gap-3">
					<h1 className="text-3xl font-bold tracking-tight">
						Welcome back, {user?.firstName}! 👋
					</h1>
					{isNewStudent && (
						<Badge variant="secondary" className="text-sm">
							New Student
						</Badge>
					)}
				</div>
				<p className="text-muted-foreground mt-2">
					Your academic dashboard
				</p>
			</div>

			{/* New Student Welcome Message */}
			{isNewStudent && (
				<Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
					<GraduationCap className="h-5 w-5 text-blue-600" />
					<AlertDescription className="text-blue-900">
						<strong>Welcome!</strong> Your account has been successfully created. You can now register for courses and access your student ID card.
					</AlertDescription>
				</Alert>
			)}

			{/* Student ID Card */}
			{studentProfile && (
				<StudentIdCard student={studentProfile} />
			)}

			{/* Course Registration Section */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Available Courses */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Book className="h-5 w-5" />
							Available Courses
							{currentSemester && (
								<Badge variant="outline" className="ml-auto">
									{currentSemester.name}
								</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoadingCourses ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-20" />
								))}
							</div>
						) : coursesError ? (
							<Alert variant="destructive">
								<AlertDescription>
									Failed to load available courses.
								</AlertDescription>
							</Alert>
						) : !availableCourses || availableCourses.length === 0 ? (
							<Alert>
								<AlertDescription>
									No courses available for registration at this time.
								</AlertDescription>
							</Alert>
						) : (
							<>
								<div className="space-y-2 mb-4">
									{availableCourses.map((offering) => {
										const isSelected = selectedCourses.includes(offering.id);
										const isRegistered = currentRegistration?.items?.some(
											item => item.courseOfferingId === offering.id && item.status === 'REGISTERED'
										);
										const isFull = offering.currentEnrollment >= offering.maxCapacity;

										return (
											<div
												key={offering.id}
												className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
													isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
												} ${isRegistered ? 'opacity-50' : ''}`}
											>
												<Checkbox
													id={`course-${offering.id}`}
													checked={isSelected}
													onCheckedChange={() => toggleCourseSelection(offering.id)}
													disabled={isRegistered || isFull || registerMutation.isPending}
												/>
												<label
													htmlFor={`course-${offering.id}`}
													className="flex-1 cursor-pointer"
												>
													<div className="flex items-start justify-between">
														<div>
															<div className="font-medium">
																{offering.course.code} - {offering.course.name}
															</div>
															<div className="text-sm text-muted-foreground">
																{offering.course.creditHours} credits
																{offering.instructor && ` • ${offering.instructor.firstName} ${offering.instructor.lastName}`}
															</div>
															<div className="text-xs text-muted-foreground mt-1">
																{offering.currentEnrollment}/{offering.maxCapacity} enrolled
															</div>
														</div>
														<div className="flex flex-col gap-1">
															{isRegistered && (
															<Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
																<CheckCircle className="h-3 w-3 mr-1" />
																Registered
															</Badge>
														)}
															{isFull && !isRegistered && (
																<Badge variant="destructive" className="text-xs">
																	Full
																</Badge>
															)}
														</div>
													</div>
												</label>
											</div>
										);
									})}
								</div>

								{/* Registration Actions */}
								{selectedCourses.length > 0 && (
									<div className="pt-4 border-t">
										<div className="flex items-center justify-between mb-3">
											<div className="text-sm">
												<span className="font-medium">{selectedCourses.length} course(s) selected</span>
												<span className="text-muted-foreground ml-2">({selectedCredits} credits)</span>
											</div>
											<Button
												size="sm"
												variant="outline"
												onClick={() => setSelectedCourses([])}
											>
												Clear Selection
											</Button>
										</div>
										<Button
											className="w-full"
											onClick={() => registerMutation.mutate()}
											disabled={registerMutation.isPending}
										>
											{registerMutation.isPending ? 'Registering...' : 'Register for Selected Courses'}
										</Button>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Registered Courses */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5" />
							My Registered Courses
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoadingRegistration ? (
							<div className="space-y-3">
								{[1, 2].map((i) => (
									<Skeleton key={i} className="h-20" />
								))}
							</div>
						) : !currentRegistration || currentRegistration.items.length === 0 ? (
							<Alert>
								<AlertDescription>
									You haven't registered for any courses yet.
								</AlertDescription>
							</Alert>
						) : (
							<>
								<div className="space-y-2 mb-4">
									{currentRegistration.items.map((item) => (
										<div
											key={item.id}
											className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="font-medium">
														{item.courseOffering.course.code} - {item.courseOffering.course.name}
													</div>
													<div className="text-sm text-muted-foreground">
														{item.courseOffering.course.creditHours} credits
														{item.courseOffering.instructor &&
															` • ${item.courseOffering.instructor.firstName} ${item.courseOffering.instructor.lastName}`
														}
													</div>
													<div className="flex items-center gap-2 mt-2">
														<Badge
															variant={
																item.status === 'REGISTERED' ? 'secondary' :
																item.status === 'DROPPED' ? 'destructive' :
																'secondary'
															}
															className={`text-xs ${item.status === 'REGISTERED' ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
														>
															{item.status === 'REGISTERED' && <CheckCircle className="h-3 w-3 mr-1" />}
															{item.status === 'DROPPED' && <XCircle className="h-3 w-3 mr-1" />}
															{item.status}
														</Badge>
													</div>
												</div>
												{item.status === 'REGISTERED' && (
													<Button
														size="sm"
														variant="ghost"
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
														onClick={() => dropCoursesMutation.mutate([item.courseOfferingId])}
														disabled={dropCoursesMutation.isPending}
													>
														<XCircle className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>
									))}
								</div>

								{/* Registration Summary */}
								<div className="pt-4 border-t space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Total Courses:</span>
										<span className="font-medium">
											{currentRegistration.items.filter(item => item.status === 'REGISTERED').length}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Total Credits:</span>
										<span className="font-medium">{currentRegistration.totalCredits}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Status:</span>
										<Badge
											variant={
												currentRegistration.status === 'ACTIVE' ? 'secondary' :
												currentRegistration.status === 'CANCELLED' ? 'destructive' :
												'secondary'
											}
											className={currentRegistration.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' : ''}
										>
											{currentRegistration.status}
										</Badge>
									</div>

									{currentRegistration.status === 'ACTIVE' && currentRegistration.items.length > 0 && (
										<Button
											variant="destructive"
											size="sm"
											className="w-full mt-4"
											onClick={() => {
												if (confirm('Are you sure you want to cancel your entire registration? This will drop all registered courses.')) {
													cancelRegistrationMutation.mutate();
												}
											}}
											disabled={cancelRegistrationMutation.isPending}
										>
											<XCircle className="h-4 w-4 mr-2" />
											{cancelRegistrationMutation.isPending ? 'Cancelling...' : 'Cancel Registration'}
										</Button>
									)}
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
