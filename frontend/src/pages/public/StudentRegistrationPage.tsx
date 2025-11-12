import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  registerStudent,
  getAvailablePrograms,
  getAvailableAcademicYears,
} from '@/services/publicRegistration.service';
import { PublicRegistrationRequest } from '@/types/registration';
import { useAuthStore } from '@/stores/auth.store';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  programId: string;
  academicYearId: string;
  entryLevel?: string;
}

interface RegistrationCredentials {
  studentId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function StudentRegistrationPage() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<RegistrationCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>();

  // Get institution ID as number
  const instId = institutionId ? parseInt(institutionId) : 0;

  // Fetch available programs
  const { data: programsData, isLoading: loadingPrograms } = useQuery({
    queryKey: ['programs', instId],
    queryFn: () => getAvailablePrograms(instId),
    enabled: !!instId,
  });

  // Fetch available academic years
  const { data: academicYearsData, isLoading: loadingAcademicYears } = useQuery({
    queryKey: ['academicYears', instId],
    queryFn: () => getAvailableAcademicYears(instId),
    enabled: !!instId,
  });

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: registerStudent,
    onSuccess: (data) => {
      setCredentials({
        studentId: data.data.studentId,
        email: data.data.email,
        password: data.data.password,
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
      });
      setShowCredentials(true);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Registration failed');
    },
  });

  // Auto-login mutation
  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      await login({ email: creds.email, password: creds.password, rememberMe: true });
    },
    onSuccess: () => {
      toast.success('Logged in successfully!');
      navigate('/student');
    },
    onError: () => {
      toast.error('Login failed. Please try logging in manually.');
      navigate('/login');
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    const registrationData: PublicRegistrationRequest = {
      institutionId: instId,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      programId: parseInt(data.programId),
      academicYearId: parseInt(data.academicYearId),
      entryLevel: data.entryLevel ? parseInt(data.entryLevel) : 100,
    };

    registrationMutation.mutate(registrationData);
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;

    const text = `Student ID: ${credentials.studentId}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied to clipboard!');
  };

  const handleAutoLogin = () => {
    if (!credentials) return;
    loginMutation.mutate({
      email: credentials.email,
      password: credentials.password,
    });
  };

  const handleManualLogin = () => {
    setShowCredentials(false);
    navigate('/login');
  };

  if (!instId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Alert variant="destructive">
          <AlertDescription>Invalid institution ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold">Student Registration</CardTitle>
          <CardDescription className="text-blue-100">
            Create your student account to get started
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName', { required: 'First name is required' })}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register('middleName')} placeholder="Michael" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName', { required: 'Last name is required' })}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programId">
                    Program <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('programId', value)}
                    disabled={loadingPrograms}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programsData?.data.map((program) => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {program.name} ({program.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.programId && (
                    <p className="text-sm text-red-500">Program is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYearId">
                    Academic Year <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('academicYearId', value)}
                    disabled={loadingAcademicYears}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYearsData?.data.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.name} ({year.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.academicYearId && (
                    <p className="text-sm text-red-500">Academic year is required</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryLevel">Entry Level (Default: 100)</Label>
                <Select onValueChange={(value) => setValue('entryLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Level 100</SelectItem>
                    <SelectItem value="200">Level 200</SelectItem>
                    <SelectItem value="300">Level 300</SelectItem>
                    <SelectItem value="400">Level 400</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Important Notice */}
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> After registration, you will receive a student ID and
                password. Please save them securely as they will be needed to access your student
                dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
              disabled={registrationMutation.isPending}
            >
              Already have an account?
            </Button>
            <Button
              type="submit"
              disabled={registrationMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {registrationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Registration Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Welcome, {credentials?.firstName} {credentials?.lastName}! Your account has been
              created successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-900">
                <strong>⚠️ Save these credentials!</strong> You will need them to login to your
                student dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Student ID</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                    {credentials?.studentId}
                  </code>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Email</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                    {credentials?.email}
                  </code>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                    {showPassword ? credentials?.password : '••••••••'}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopyCredentials}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy All Credentials
            </Button>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleManualLogin}
              className="flex-1"
              disabled={loginMutation.isPending}
            >
              I'll Login Later
            </Button>
            <Button
              onClick={handleAutoLogin}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
