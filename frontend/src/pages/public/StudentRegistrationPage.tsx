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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
  registerStudent,
  getAvailablePrograms,
  getAvailableAcademicYears,
  getInstitutionDetails,
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

  // Fetch institution details
  const { data: institutionData, isLoading: loadingInstitution } = useQuery({
    queryKey: ['institution', instId],
    queryFn: () => getInstitutionDetails(instId),
    enabled: !!instId,
  });

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid institution ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadingInstitution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading institution details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0">
        {/* Institution Header */}
        {institutionData?.data && (
          <div className="bg-linear-to-r from-gray-50 to-gray-100 border-b p-6">
            <div className="flex items-start gap-4">
              {institutionData.data.logoUrl && (
                <img
                  src={institutionData.data.logoUrl}
                  alt={institutionData.data.name}
                  className="h-16 w-16 rounded-lg object-cover border-2 border-white shadow-md"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {institutionData.data.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {institutionData.data.type} • {institutionData.data.code}
                </p>
                {institutionData.data.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {institutionData.data.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                  {institutionData.data.contactEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{institutionData.data.contactEmail}</span>
                    </div>
                  )}
                  {institutionData.data.contactPhone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{institutionData.data.contactPhone}</span>
                    </div>
                  )}
                  {institutionData.data.city && institutionData.data.country && (
                    <div className="flex items-center gap-1">
                      <span>📍 {institutionData.data.city}, {institutionData.data.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <CardHeader className="space-y-4 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-xl p-8 mx-6 mt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">Student Registration</CardTitle>
              <CardDescription className="text-blue-100 text-base mt-1">
                Create your student account to get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 p-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      className="pl-9 h-10"
                      {...register('firstName', { required: 'First name is required' })}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName" className="text-sm font-medium">Middle Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="middleName"
                      className="pl-9 h-10"
                      {...register('middleName')}
                      placeholder="Michael"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      className="pl-9 h-10"
                      {...register('lastName', { required: 'Last name is required' })}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 h-10"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-9 h-10"
                      {...register('phone')}
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="pl-9 h-10"
                      {...register('dateOfBirth')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select onValueChange={(value) => setValue('gender', value)}>
                    <SelectTrigger className="h-10">
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
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Academic Information
                </h3>
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="programId" className="text-sm font-medium">
                    Program <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('programId', value)}
                    disabled={loadingPrograms}
                  >
                    <SelectTrigger className="h-10">
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
                  <Label htmlFor="academicYearId" className="text-sm font-medium">
                    Academic Year <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('academicYearId', value)}
                    disabled={loadingAcademicYears}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYearsData?.data.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.yearCode} ({new Date(year.startDate).getFullYear()} - {new Date(year.endDate).getFullYear()})
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
                <Label htmlFor="entryLevel" className="text-sm font-medium">Entry Level (Default: 100)</Label>
                <Select onValueChange={(value) => setValue('entryLevel', value)}>
                  <SelectTrigger className="h-10">
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
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Important:</strong> After registration, you will receive a student ID and
                password. Please save them securely as they will be needed to access your student
                dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 rounded-b-xl border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
              disabled={registrationMutation.isPending}
              className="flex-1 h-10"
            >
              Already have an account?
            </Button>
            <Button
              type="submit"
              disabled={registrationMutation.isPending}
              className="flex-1 h-10 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {registrationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Register
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Credentials Dialog */}
      <Dialog
        open={showCredentials}
        onOpenChange={(open) => {
          setShowCredentials(open);
          // Navigate to login if dialog is closed manually
          if (!open && credentials) {
            navigate('/login');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              Registration Successful! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Welcome, {credentials?.firstName} {credentials?.lastName}! Your account has been
              created successfully.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4 px-1">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <strong>⚠️ Save these credentials!</strong> You will need them to login to your
                  student dashboard.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 bg-gray-50 p-5 rounded-lg border">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 font-mono text-sm font-semibold text-gray-900">
                      {credentials?.studentId}
                    </code>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 font-mono text-sm font-semibold text-gray-900">
                      {credentials?.email}
                    </code>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-4 py-2.5 rounded-lg border-2 border-gray-200 font-mono text-sm font-semibold text-gray-900">
                      {showPassword ? credentials?.password : '••••••••'}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9"
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
                className="w-full h-10"
                onClick={handleCopyCredentials}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All Credentials
              </Button>
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={handleManualLogin}
              className="flex-1 h-10"
              disabled={loginMutation.isPending}
            >
              I'll Login Later
            </Button>
            <Button
              onClick={handleAutoLogin}
              className="flex-1 h-10 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Continue to Dashboard
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
