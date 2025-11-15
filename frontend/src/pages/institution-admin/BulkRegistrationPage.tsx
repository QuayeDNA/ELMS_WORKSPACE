import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academicService } from '@/services/academic.service';
import { studentService } from '@/services/student.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, Users, BookOpen, Send, Filter, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Program {
	id: number;
	name: string;
	code: string;
	department: {
		id: number;
		name: string;
	};
}

interface CourseOffering {
	id: string;
	course: {
		code: string;
		name: string;
		credits: number;
	};
}

interface StudentWithRegistration {
	id: string;
	studentId: string;
	user: {
		firstName: string;
		lastName: string;
		email: string;
	};
	program?: {
		id: string;
		name: string;
		code: string;
		department: {
			id: string;
			name: string;
		};
	};
	level: number;
	semester: number;
	hasRegistered?: boolean;
}

export default function BulkRegistrationPage() {
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
	const [selectedProgramId, setSelectedProgramId] = useState<string>('');
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Fetch current semester
	const { data: currentSemester } = useQuery({
		queryKey: ['currentSemester'],
		queryFn: async () => {
			const response = await academicService.getCurrentSemester();
			return response.data;
		},
	});

	// Auto-select current semester when loaded
	if (currentSemester && !selectedSemesterId) {
		setSelectedSemesterId(currentSemester.id.toString());
	}

	// Fetch programs for filter
	const { data: programs } = useQuery<Program[]>({
		queryKey: ['programs'],
		queryFn: async () => {
			const response = await studentService.getStudents({ limit: 1000 });
			// Extract unique programs from students
			const uniquePrograms = new Map<number, Program>();
			response.data.forEach((student) => {
				if (student.program) {
					uniquePrograms.set(student.program.id, student.program);
				}
			});
			return Array.from(uniquePrograms.values());
		},
	});

	// Fetch students by registration status
	const { data: studentsData } = useQuery({
		queryKey: ['studentsByRegistrationStatus', selectedSemesterId, selectedProgramId, selectedDepartmentId],
		queryFn: async () => {
			if (!selectedSemesterId) return null;

			// This endpoint should be added to the registration service
			const response = await fetch(
				`/api/registrations/students-by-status/${selectedSemesterId}?` +
				new URLSearchParams({
					...(selectedProgramId && { programId: selectedProgramId }),
					...(selectedDepartmentId && { departmentId: selectedDepartmentId }),
				})
			);

			if (!response.ok) {
				throw new Error('Failed to fetch students');
			}

			return await response.json();
		},
		enabled: !!selectedSemesterId,
	});

	// Fetch available course offerings for the semester
	const { data: courseOfferings } = useQuery<CourseOffering[]>({
		queryKey: ['courseOfferings', selectedSemesterId],
		queryFn: async () => {
			if (!selectedSemesterId) return [];

			// This should fetch course offerings for the semester
			const response = await fetch(
				`/api/course-offerings?semesterId=${selectedSemesterId}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch course offerings');
			}

			const data = await response.json();
			return data.data || [];
		},
		enabled: !!selectedSemesterId,
	});

	// Bulk registration mutation
	const bulkRegisterMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/registrations/bulk', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({
					studentIds: selectedStudentIds,
					semesterId: selectedSemesterId,
					courseOfferingIds: selectedCourseIds,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to register students');
			}

			return await response.json();
		},
		onSuccess: (data) => {
			toast.success('Bulk Registration Completed', {
				description: `Successfully registered ${data.data.succeeded.length} students. ${data.data.failed.length} failed.`,
			});

			// Reset selections
			setSelectedStudentIds([]);
			setSelectedCourseIds([]);

			// Refetch students data
			queryClient.invalidateQueries({ queryKey: ['studentsByRegistrationStatus'] });
		},
		onError: (error: Error) => {
			toast.error('Registration Failed', {
				description: error.message,
			});
		},
	});

	const handleSelectAll = (registered: boolean) => {
		const students = registered ? studentsData?.data.registered : studentsData?.data.notRegistered;
		if (students) {
			const ids = students.map((s: StudentWithRegistration) => s.id);
			setSelectedStudentIds(ids);
		}
	};

	const handleSelectStudent = (studentId: string) => {
		setSelectedStudentIds((prev) =>
			prev.includes(studentId)
				? prev.filter((id) => id !== studentId)
				: [...prev, studentId]
		);
	};

	const handleSelectCourse = (courseId: string) => {
		setSelectedCourseIds((prev) =>
			prev.includes(courseId)
				? prev.filter((id) => id !== courseId)
				: [...prev, courseId]
		);
	};

	const handleBulkRegister = () => {
		if (selectedStudentIds.length === 0) {
			toast.error('No Students Selected', {
				description: 'Please select at least one student.',
			});
			return;
		}

		if (selectedCourseIds.length === 0) {
			toast.error('No Courses Selected', {
				description: 'Please select at least one course.',
			});
			return;
		}

		bulkRegisterMutation.mutate();
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate('/institution-admin/students')}
						className="mb-2"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Students
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">Bulk Course Registration</h1>
					<p className="text-muted-foreground">
						Register multiple students for courses simultaneously
					</p>
				</div>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
					<CardDescription>
						Filter students by semester, program, and department
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label>Semester</Label>
							<Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
								<SelectTrigger>
									<SelectValue placeholder="Select semester" />
								</SelectTrigger>
							<SelectContent>
								{currentSemester && (
									<SelectItem value={String(currentSemester.id)}>
										{currentSemester.name} (Current)
									</SelectItem>
								)}
							</SelectContent>
							</Select>
						</div>

					<div>
						<Label>Program (Optional)</Label>
						<div className="flex gap-2">
							<Select value={selectedProgramId || undefined} onValueChange={(value) => setSelectedProgramId(value || '')}>
								<SelectTrigger>
									<SelectValue placeholder="All programs" />
								</SelectTrigger>
							<SelectContent>
								{programs?.map((program) => (
									<SelectItem key={program.id} value={String(program.id)}>
										{program.name}
									</SelectItem>
								))}
							</SelectContent>
							</Select>
							{selectedProgramId && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedProgramId('')}
								>
									Clear
								</Button>
							)}
						</div>
					</div>

						<div>
							<Label>Department (Optional)</Label>
							<div className="flex gap-2">
								<Select value={selectedDepartmentId || undefined} onValueChange={(value) => setSelectedDepartmentId(value || '')}>
									<SelectTrigger>
										<SelectValue placeholder="All departments" />
									</SelectTrigger>
								<SelectContent>
									{programs
										?.map((p) => p.department)
										.filter((d, i, arr) =>
											arr.findIndex((dept) => dept.id === d.id) === i
										)
										.map((dept) => (
											<SelectItem key={dept.id} value={String(dept.id)}>
												{dept.name}
											</SelectItem>
										))}
								</SelectContent>
								</Select>
								{selectedDepartmentId && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedDepartmentId('')}
									>
										Clear
									</Button>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Course Selection */}
			{courseOfferings && courseOfferings.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Select Courses
						</CardTitle>
						<CardDescription>
							Choose courses to register students for
						</CardDescription>
					</CardHeader>
					<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{courseOfferings.map((offering) => (
							<div
								key={offering.id}
								className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
									onClick={() => handleSelectCourse(offering.id)}
								>
									<Checkbox
										checked={selectedCourseIds.includes(offering.id)}
										onCheckedChange={() => handleSelectCourse(offering.id)}
									/>
									<div className="flex-1">
										<p className="font-medium">{offering.course.code}</p>
										<p className="text-sm text-muted-foreground">{offering.course.name}</p>
										<Badge variant="secondary" className="text-xs mt-1">
											{offering.course.credits} credits
										</Badge>
									</div>
								</div>
							))}
						</div>
						{selectedCourseIds.length > 0 && (
							<p className="text-sm text-muted-foreground mt-4">
								{selectedCourseIds.length} course(s) selected
							</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Students Lists */}
			{studentsData && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Not Registered Students */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Not Registered
								</span>
								<Badge variant="secondary">
									{studentsData.data.notRegistered.length}
								</Badge>
							</CardTitle>
							<CardDescription>
								Students who haven't registered for this semester
							</CardDescription>
						</CardHeader>
						<CardContent>
							{studentsData.data.notRegistered.length > 0 && (
								<div className="mb-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleSelectAll(false)}
									>
										Select All
									</Button>
								</div>
							)}

							<div className="space-y-2 max-h-[400px] overflow-y-auto">
								{studentsData.data.notRegistered.length === 0 ? (
									<Alert>
										<CheckCircle className="h-4 w-4" />
										<AlertDescription>
											All students have registered for this semester!
										</AlertDescription>
									</Alert>
								) : (
									studentsData.data.notRegistered.map((student: StudentWithRegistration) => (
										<div
											key={student.id}
											className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
											onClick={() => handleSelectStudent(student.id)}
										>
											<Checkbox
												checked={selectedStudentIds.includes(student.id)}
												onCheckedChange={() => handleSelectStudent(student.id)}
											/>
											<div className="flex-1">
												<p className="font-medium">
													{student.user.firstName} {student.user.lastName}
												</p>
												<p className="text-sm text-muted-foreground">
													{student.studentId} • {student.program?.name || 'No Program'}
												</p>
											</div>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* Registered Students */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<CheckCircle className="h-5 w-5" />
									Registered
								</span>
								<Badge variant="default">
									{studentsData.data.registered.length}
								</Badge>
							</CardTitle>
							<CardDescription>
								Students who have completed registration
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 max-h-[400px] overflow-y-auto">
								{studentsData.data.registered.length === 0 ? (
									<Alert>
										<AlertDescription>
											No students have registered yet.
										</AlertDescription>
									</Alert>
								) : (
									studentsData.data.registered.map((student: StudentWithRegistration) => (
										<div
											key={student.id}
											className="p-3 border rounded-lg bg-muted/30"
										>
											<p className="font-medium">
												{student.user.firstName} {student.user.lastName}
											</p>
											<p className="text-sm text-muted-foreground">
												{student.studentId} • {student.program?.name || 'No Program'}
											</p>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Action Button */}
			{selectedStudentIds.length > 0 && selectedCourseIds.length > 0 && (
				<Card className="border-primary">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-semibold">
									Register {selectedStudentIds.length} student(s) for {selectedCourseIds.length} course(s)
								</p>
								<p className="text-sm text-muted-foreground">
									This will create and auto-approve registrations for selected students
								</p>
							</div>
							<Button
								size="lg"
								onClick={handleBulkRegister}
								disabled={bulkRegisterMutation.isPending}
							>
								<Send className="h-4 w-4 mr-2" />
								{bulkRegisterMutation.isPending ? 'Processing...' : 'Bulk Register'}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
