import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	Users,
	CheckCircle,
	XCircle,
	BookOpen,
	UserCheck,
	UserX
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchAndFilter, FilterGroup } from '@/components/shared/SearchAndFilter';

import { registrationService } from '@/services/registration.service';
import { academicService } from '@/services/academic.service';
import { studentService } from '@/services/student.service';

import { Program } from '@/types/program';
import { Student } from '@/types/student';

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
}

export default function BulkRegistrationPage() {
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
	const [selectedProgramId, setSelectedProgramId] = useState<string>('');
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');

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
	React.useEffect(() => {
		if (currentSemester && !selectedSemesterId) {
			setSelectedSemesterId(currentSemester.id.toString());
		}
	}, [currentSemester, selectedSemesterId]);

	// Fetch programs for filter
	const { data: programs } = useQuery<Program[]>({
		queryKey: ['programs'],
		queryFn: async () => {
			const response = await studentService.getStudents({ limit: 1000 });
			// Extract unique programs from students
			const uniquePrograms = new Map<number, Program>();
			response.data.forEach((student: Student) => {
				if (student.program) {
					uniquePrograms.set(student.program.id, student.program);
				}
			});
			return Array.from(uniquePrograms.values());
		},
	});

	// Fetch students by registration status
	const { data: studentsData, isLoading, error } = useQuery({
		queryKey: ['studentsByRegistrationStatus', selectedSemesterId, selectedProgramId, selectedDepartmentId],
		queryFn: async () => {
			if (!selectedSemesterId) return null;

			const filters: { programId?: string; departmentId?: string } = {};
			if (selectedProgramId) filters.programId = selectedProgramId;
			if (selectedDepartmentId) filters.departmentId = selectedDepartmentId;

			return await registrationService.getStudentsByRegistrationStatus(
				parseInt(selectedSemesterId),
				filters
			);
		},
		enabled: !!selectedSemesterId,
	});

	const totalStudents = studentsData ? studentsData.registered.length + studentsData.notRegistered.length : 0;
	const registeredCount = studentsData?.registered.length || 0;
	const notRegisteredCount = studentsData?.notRegistered.length || 0;
	const registrationRate = totalStudents > 0 ? Math.round((registeredCount / totalStudents) * 100) : 0;

	// Configure filter groups for SearchAndFilter
	const filterGroups: FilterGroup[] = [
		{
			id: 'semester',
			label: 'Semester',
			type: 'select',
			options: currentSemester ? [{
				label: `${currentSemester.name} (Current)`,
				value: currentSemester.id.toString()
			}] : [],
			value: selectedSemesterId,
			onChange: (value) => setSelectedSemesterId(value as string)
		},
		{
			id: 'program',
			label: 'Program',
			type: 'select',
			options: [
				{ label: 'All programs', value: 'all' },
				...(programs?.map((program: Program) => ({
					label: `${program.code} - ${program.name}`,
					value: program.id.toString()
				})) || [])
			],
			value: selectedProgramId || 'all',
			onChange: (value) => setSelectedProgramId((value as string) === 'all' ? '' : (value as string))
		},
		{
			id: 'department',
			label: 'Department',
			type: 'select',
			options: [
				{ label: 'All departments', value: 'all' },
				...(programs?.reduce((depts: { label: string; value: string }[], program: Program) => {
					if (!depts.find(d => d.value === program.department.id.toString())) {
						depts.push({
							label: program.department.name,
							value: program.department.id.toString()
						});
					}
					return depts;
				}, []) || [])
			],
			value: selectedDepartmentId || 'all',
			onChange: (value) => setSelectedDepartmentId((value as string) === 'all' ? '' : (value as string))
		}
	];

	return (
		<div className="space-y-6">
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
					<h1 className="text-3xl font-bold tracking-tight">Course Registration Status</h1>
					<p className="text-muted-foreground">
						Monitor student course registration progress
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			{studentsData && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<Users className="h-5 w-5 text-blue-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Total Students</p>
									<p className="text-2xl font-bold">{totalStudents}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<UserCheck className="h-5 w-5 text-green-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Registered</p>
									<p className="text-2xl font-bold text-green-600">{registeredCount}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<UserX className="h-5 w-5 text-red-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Not Registered</p>
									<p className="text-2xl font-bold text-red-600">{notRegisteredCount}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center space-x-2">
								<BookOpen className="h-5 w-5 text-purple-600" />
								<div>
									<p className="text-sm font-medium text-muted-foreground">Registration Rate</p>
									<p className="text-2xl font-bold text-purple-600">{registrationRate}%</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters */}
			<SearchAndFilter
				showSearch={false}
				showSort={false}
				filterGroups={filterGroups}
				showFilters={true}
				filterLabel="Filters"
				className="mb-6"
			/>

			{/* Loading State */}
			{isLoading && (
				<div className="space-y-4">
					{[1, 2].map((i) => (
						<Card key={i}>
							<CardContent className="pt-6">
								<div className="animate-pulse space-y-4">
									<div className="h-4 bg-gray-200 rounded w-1/4"></div>
									<div className="space-y-2">
										<div className="h-3 bg-gray-200 rounded"></div>
										<div className="h-3 bg-gray-200 rounded w-5/6"></div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Error State */}
			{error && (
				<Alert variant="destructive">
					<AlertDescription>
						Failed to load student registration data. Please try again.
					</AlertDescription>
				</Alert>
			)}

			{/* Students Lists */}
			{studentsData && !isLoading && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Registered Students */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<CheckCircle className="h-5 w-5 text-green-600" />
									Registered Students
								</span>
								<Badge variant="default" className="bg-green-100 text-green-800">
									{registeredCount}
								</Badge>
							</CardTitle>
							<CardDescription>
								Students who have completed course registration
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 max-h-[600px] overflow-y-auto">
								{studentsData.registered.length === 0 ? (
									<Alert>
										<AlertDescription>
											No students have registered for courses yet.
										</AlertDescription>
									</Alert>
								) : (
									studentsData.registered.map((student: StudentWithRegistration) => (
										<div
											key={student.id}
											className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
										>
											<div className="flex-1">
												<div className="font-medium">
													{student.user.firstName} {student.user.lastName}
												</div>
												<div className="text-sm text-muted-foreground">
													{student.studentId}
													{student.program && ` • ${student.program.code}`}
												</div>
												<div className="text-xs text-muted-foreground">
													Level {student.level}, Semester {student.semester}
												</div>
											</div>
											<Badge variant="secondary" className="bg-green-100 text-green-800">
												<CheckCircle className="h-3 w-3 mr-1" />
												Registered
											</Badge>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>

					{/* Not Registered Students */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<XCircle className="h-5 w-5 text-red-600" />
									Not Registered
								</span>
								<Badge variant="destructive">
									{notRegisteredCount}
								</Badge>
							</CardTitle>
							<CardDescription>
								Students who haven't registered for courses yet
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2 max-h-[600px] overflow-y-auto">
								{studentsData.notRegistered.length === 0 ? (
									<Alert>
										<AlertDescription>
											All students have completed course registration.
										</AlertDescription>
									</Alert>
								) : (
									studentsData.notRegistered.map((student: StudentWithRegistration) => (
										<div
											key={student.id}
											className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
										>
											<div className="flex-1">
												<div className="font-medium">
													{student.user.firstName} {student.user.lastName}
												</div>
												<div className="text-sm text-muted-foreground">
													{student.studentId}
													{student.program && ` • ${student.program.code}`}
												</div>
												<div className="text-xs text-muted-foreground">
													Level {student.level}, Semester {student.semester}
												</div>
											</div>
											<Badge variant="destructive">
												<XCircle className="h-3 w-3 mr-1" />
												Not Registered
											</Badge>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
