import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { studentService } from '@/services/student.service';
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
import { GraduationCap, Book, User, Mail, Phone, Calendar } from 'lucide-react';

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
				<Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
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
