import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { studentService } from '@/services/student.service';
import { registrationService } from '@/services/registration.service';
import { academicService } from '@/services/academic.service';
import { Student } from '@/types/student';
import {
	DashboardStats,
	QuickActions,
	AcademicOverview,
	StudentAnalyticsBentoGrid,
	RecentActivity,
	StudentIdCard,
} from '@/components/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GraduationCap, Book, User, Mail, Phone, Calendar, Trash2, Send, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
	const { user } = useAuthStore();
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
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Fetch current semester
	const { data: currentSemester } = useQuery({
		queryKey: ['currentSemester'],
		queryFn: async () => {
			const response = await academicService.getCurrentSemester();
			return response.data;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	});

	// Fetch eligible courses for registration
	const {
		data: eligibleCoursesResponse,
		refetch: refetchEligibleCourses,
		isLoading: isLoadingCourses,
		error: coursesError
	} = useQuery({
		queryKey: ['eligibleCourses', studentProfile?.id, currentSemester?.id],
		queryFn: async () => {
			if (!studentProfile?.id || !currentSemester?.id) return { data: [], count: 0 };
			return await registrationService.getEligibleCourses(
				String(studentProfile.id),
				String(currentSemester.id)
			);
		},
		enabled: !!studentProfile?.id && !!currentSemester?.id,
		staleTime: 5 * 60 * 1000,
	});

	const eligibleCourses = eligibleCoursesResponse?.data || [];

	// Fetch registration summary
	const {
		data: registrationSummary,
		refetch: refetchSummary
	} = useQuery({
		queryKey: ['registrationSummary', studentProfile?.id, currentSemester?.id],
		queryFn: async () => {
			if (!studentProfile?.id || !currentSemester?.id) return null;
			return await registrationService.getRegistrationSummary(
				String(studentProfile.id),
				String(currentSemester.id)
			);
		},
		enabled: !!studentProfile?.id && !!currentSemester?.id,
		staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates
	});

	// Mutation for removing course from registration
	const removeCourseMutation = useMutation({
		mutationFn: async (registeredCourseId: string) => {
			return await registrationService.removeCourseFromRegistration(registeredCourseId);
		},
		onSuccess: () => {
			toast.success('Course has been removed from your registration.');
			refetchSummary();
			refetchEligibleCourses();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Mutation for submitting registration
	const submitRegistrationMutation = useMutation({
		mutationFn: async (registrationId: string) => {
			return await registrationService.submitRegistration(registrationId);
		},
		onSuccess: () => {
			toast.success('Your course registration has been submitted for approval.');
			refetchSummary();
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	// Mutation for registering all eligible courses
	const registerAllMutation = useMutation({
		mutationFn: async () => {
			if (!studentProfile?.id || !currentSemester?.id) {
				throw new Error('Missing student profile or semester information');
			}
			return await registrationService.registerAllEligibleCourses(
				studentProfile.id,
				currentSemester.id
			);
		},
		onSuccess: (data) => {
			toast.success(`Successfully registered for ${data.registeredCount} course${data.registeredCount !== 1 ? 's' : ''}`);
			refetchSummary();
			refetchEligibleCourses();
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to register for courses');
		},
	});

	// Check if student is newly registered (within last 24 hours)
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
				<div>
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-5 w-96 mt-2" />
				</div>
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-32" />
					))}
				</div>
				<Skeleton className="h-64" />
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
					Your academic progress and activities
				</p>
			</div>

			{/* New Student Welcome Message */}
			{isNewStudent && (
				<Alert className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
					<GraduationCap className="h-5 w-5 text-blue-600" />
					<AlertDescription className="text-blue-900">
						<strong>Welcome to your student dashboard!</strong> Your account has been
						successfully created. You can now access your courses, view your academic
						information, and track your progress.
					</AlertDescription>
				</Alert>
			)}

			{/* Dashboard Stats - Moved to top */}
			<DashboardStats />

			{/* Student ID Card - Full width, stacked vertically */}
			{studentProfile && (
				<div className="space-y-6">
					<StudentIdCard student={studentProfile} />

					{/* Profile and Quick Actions in two columns */}
					<div className="grid lg:grid-cols-2 gap-6">
						{/* Profile Information - Left Column */}
						<Card className="border-l-4 border-l-blue-500">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									Student Profile
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Personal Information */}
									<div className="space-y-3">
										<h4 className="font-semibold text-sm text-muted-foreground uppercase">
											Personal Information
										</h4>
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												<User className="h-4 w-4 text-muted-foreground" />
												<span className="text-base">
													{user?.firstName} {user?.middleName} {user?.lastName}
												</span>
											</div>
											<div className="flex items-center gap-3">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span className="text-base">{user?.email}</span>
											</div>
											{user?.phone && (
												<div className="flex items-center gap-3">
													<Phone className="h-4 w-4 text-muted-foreground" />
													<span className="text-base">{user?.phone}</span>
												</div>
											)}
										</div>
									</div>

									{/* Academic Information */}
									<div className="space-y-3">
										<h4 className="font-semibold text-sm text-muted-foreground uppercase">
											Academic Information
										</h4>
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												<GraduationCap className="h-4 w-4 text-muted-foreground" />
												<span className="text-base font-medium">
													Student ID: {studentProfile.studentId}
												</span>
											</div>
											{studentProfile.indexNumber && (
												<div className="flex items-center gap-3">
													<Book className="h-4 w-4 text-muted-foreground" />
													<span className="text-base">
														Index Number: {studentProfile.indexNumber}
													</span>
												</div>
											)}
											<div className="flex items-center gap-3">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span className="text-base">
													Level {studentProfile.level} - Semester {studentProfile.semester}
												</span>
											</div>
										</div>
									</div>

									{/* Program Information - Spans both columns */}
									{studentProfile.program && (
										<div className="space-y-3 md:col-span-2">
											<h4 className="font-semibold text-sm text-muted-foreground uppercase">
												Program Details
											</h4>
											<div className="space-y-3">
												<div>
													<p className="text-lg font-medium">
														{studentProfile.program.name}
													</p>
													<p className="text-sm text-muted-foreground">
														{studentProfile.program.code}
													</p>
												</div>
												{studentProfile.program.department && (
													<div>
														<p className="text-sm text-muted-foreground">
															Department: {studentProfile.program.department.name}
														</p>
														{studentProfile.program.department.faculty && (
															<p className="text-sm text-muted-foreground">
																Faculty: {studentProfile.program.department.faculty.name}
															</p>
														)}
													</div>
												)}
												<div className="flex gap-2 mt-3">
													<Badge variant={studentProfile.enrollmentStatus === 'ACTIVE' ? 'default' : 'secondary'}>
														{studentProfile.enrollmentStatus}
													</Badge>
													<Badge variant={studentProfile.academicStatus === 'GOOD_STANDING' ? 'default' : 'secondary'}>
														{studentProfile.academicStatus}
													</Badge>
												</div>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions - Right Column */}
						<div className="lg:col-span-1">
							<QuickActions />
						</div>
					</div>
				</div>
			)}

			{/* Course Registration Section */}
			{currentSemester && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Course Registration - {currentSemester.name}</span>
							{registrationSummary?.status && (
								<Badge
									variant={
										registrationSummary.status === 'APPROVED' ? 'default' :
										registrationSummary.status === 'SUBMITTED' ? 'secondary' :
										registrationSummary.status === 'DRAFT' ? 'outline' :
										'destructive'
									}
								>
									{registrationSummary.status}
								</Badge>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Registration Summary */}
						{registrationSummary && (
							<>
								<div className="p-4 bg-muted/50 rounded-lg space-y-2">
									<h4 className="font-semibold text-sm">Registration Summary</h4>
									<div className="grid grid-cols-3 gap-4 text-sm">
										<div>
											<span className="text-muted-foreground">Total Credits:</span>
											<p className="font-semibold">{registrationSummary.totalCredits}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Min Credits:</span>
											<p className="font-semibold">{registrationSummary.minCredits}</p>
										</div>
										<div>
											<span className="text-muted-foreground">Max Credits:</span>
											<p className="font-semibold">{registrationSummary.maxCredits}</p>
										</div>
									</div>
								</div>

								{/* Registered Courses */}
								{registrationSummary?.registeredCourses && registrationSummary.registeredCourses.length > 0 && (
								<div className="mt-4">
										<h5 className="font-medium text-sm mb-2">Registered Courses:</h5>
										<div className="space-y-1">
											{registrationSummary.registeredCourses.map((course) => (
												<div key={course.id} className="flex items-center justify-between p-2 bg-background rounded">
													<div className="flex items-center gap-2">
														<Book className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm">
															{course.courseCode} - {course.courseName}
														</span>
														<Badge variant="outline" className="text-xs">
															{course.credits} credits
														</Badge>
													</div>
													{registrationSummary.status === 'DRAFT' && (
														<Button
															size="sm"
															variant="ghost"
															onClick={() => removeCourseMutation.mutate(course.id)}
															disabled={removeCourseMutation.isPending}
														>
															<Trash2 className="h-4 w-4 text-destructive" />
														</Button>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{/* Submit Button */}
								{registrationSummary.status === 'DRAFT' && registrationSummary.canSubmit && (
									<Button
										className="w-full mt-4"
										onClick={() => {
											if (registrationSummary.registrationId) {
												submitRegistrationMutation.mutate(registrationSummary.registrationId);
											}
										}}
										disabled={submitRegistrationMutation.isPending}
									>
										<Send className="h-4 w-4 mr-2" />
										Submit Registration for Approval
									</Button>
								)}

								{registrationSummary.status === 'APPROVED' && (
									<Alert className="mt-4">
										<CheckCircle className="h-4 w-4" />
										<AlertDescription>
											Your course registration has been approved. You are now enrolled in these courses.
										</AlertDescription>
									</Alert>
								)}
							</>
						)}

						{/* Available Courses */}
						{registrationSummary?.status !== 'APPROVED' && (
							<div>
								<div className="flex items-center justify-between mb-3">
									<div>
										<h4 className="font-semibold text-sm">
											Available Courses
											{eligibleCoursesResponse?.count !== undefined && (
												<Badge variant="outline" className="ml-2">
													{eligibleCoursesResponse.count} {eligibleCoursesResponse.count === 1 ? 'course' : 'courses'}
												</Badge>
											)}
										</h4>
									</div>

									{/* Register All Button */}
									{!isLoadingCourses && !coursesError && eligibleCourses.length > 0 &&
									(!registrationSummary || registrationSummary?.status === 'DRAFT') && (
										<Button
											onClick={() => registerAllMutation.mutate()}
											disabled={registerAllMutation.isPending}
											className="gap-2"
										>
											<GraduationCap className="h-4 w-4" />
											{registerAllMutation.isPending ? 'Registering...' : 'Register All Courses'}
										</Button>
									)}
								</div>

								{/* Loading State */}
								{isLoadingCourses && (
									<div className="space-y-2">
										{[1, 2, 3].map((i) => (
											<div key={i} className="p-3 border rounded-lg">
												<Skeleton className="h-6 w-3/4 mb-2" />
												<Skeleton className="h-4 w-1/2" />
											</div>
										))}
									</div>
								)}

								{/* Error State */}
								{coursesError && (
									<Alert variant="destructive">
										<AlertDescription>
											Failed to load available courses. Please try refreshing the page.
										</AlertDescription>
									</Alert>
								)}

								{/* Empty State */}
								{!isLoadingCourses && !coursesError && eligibleCourses.length === 0 && (
									<Alert>
										<AlertDescription>
											No courses are available for registration at this time. Please check back later or contact your academic advisor.
										</AlertDescription>
									</Alert>
								)}

								{/* Courses List */}
								{!isLoadingCourses && !coursesError && eligibleCourses.length > 0 && (
									<div className="space-y-2">
										{eligibleCourses
											.filter(item =>
												!registrationSummary?.registeredCourses?.some(rc => rc.courseCode === item.courseOffering.course.code)
											)
											.map((item) => {
												const { courseOffering, eligibility } = item;
												const { course, primaryLecturer } = courseOffering;

												return (
													<div
														key={courseOffering.id}
														className={`p-3 border rounded-lg transition-colors ${
															eligibility.isEligible ? 'bg-background' : 'bg-muted/30 opacity-75'
														}`}
													>
														<div className="flex-1">
															<div className="flex items-center gap-2 flex-wrap">
																<span className="font-medium">{course.code}</span>
																<span className="text-muted-foreground">-</span>
																<span>{course.name}</span>
																<Badge variant="secondary" className="text-xs">
																	{course.creditHours} credits
																</Badge>
																<Badge variant="outline" className="text-xs">
																	{course.courseType}
																</Badge>
															</div>

															{primaryLecturer && (
																<p className="text-sm text-muted-foreground mt-1">
																	Instructor: {primaryLecturer.firstName} {primaryLecturer.lastName}
																</p>
															)}

															{course.prerequisites && (
																<p className="text-xs text-muted-foreground mt-1">
																	Prerequisites: {JSON.parse(course.prerequisites).join(', ')}
																</p>
															)}

															{!eligibility.isEligible && eligibility.reasons.length > 0 && (
																<div className="mt-2">
																	{eligibility.reasons.map((reason, idx) => (
																		<p key={idx} className="text-xs text-destructive">
																			⚠ {reason}
																		</p>
																	))}
																</div>
															)}
														</div>
													</div>
												);
											})}
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			)}

			<AcademicOverview />

			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-foreground">
					Academic Analytics
				</h2>
				<StudentAnalyticsBentoGrid />
			</div>

			<RecentActivity />
		</div>
	);
}
