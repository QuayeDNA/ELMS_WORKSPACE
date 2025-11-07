import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest } from "@/types/auth";
import { useState, useEffect, useRef } from "react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface DevCredential {
  id: string;
  name: string;
  email: string;
  password: string;
}

const DEV_CREDENTIALS: DevCredential[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    email: "admin@elms.com",
    password: "Admin@123",
  },
  {
    id: "institution_admin",
    name: "Institution Admin (John Administrator)",
    email: "admin@git.edu.gh",
    password: "password123",
  },
  {
    id: "dean_engineering",
    name: "Dean of Engineering (Mary Engineering-Dean)",
    email: "dean.engineering@git.edu.gh",
    password: "password123",
  },
  {
    id: "dean_science",
    name: "Dean of Science (Robert Science-Dean)",
    email: "dean.science@git.edu.gh",
    password: "password123",
  },
  {
    id: "hod_cse",
    name: "HOD Computer Science (Sarah CS-Head)",
    email: "hod.cse@git.edu.gh",
    password: "password123",
  },
  {
    id: "hod_math",
    name: "HOD Mathematics (David Math-Head)",
    email: "hod.math@git.edu.gh",
    password: "password123",
  },
  {
    id: "exams_engineering",
    name: "Exams Officer Engineering (Grace Exams-Officer)",
    email: "exams.engineering@git.edu.gh",
    password: "password123",
  },
  {
    id: "exams_science",
    name: "Exams Officer Science (Michael Exams-Officer)",
    email: "exams.science@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_james",
    name: "Lecturer (James Mensah)",
    email: "james.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_jennifer",
    name: "Lecturer (Jennifer Asante)",
    email: "jennifer.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_peter",
    name: "Lecturer (Peter Osei)",
    email: "peter.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_elizabeth",
    name: "Lecturer (Elizabeth Opoku)",
    email: "elizabeth.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_samuel",
    name: "Lecturer (Samuel Adjei)",
    email: "samuel.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_rachel",
    name: "Lecturer (Rachel Boateng)",
    email: "rachel.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "lecturer_frank",
    name: "Lecturer (Frank Amponsah)",
    email: "frank.lecturer@git.edu.gh",
    password: "password123",
  },
  {
    id: "student_alice",
    name: "Student (Alice Owusu)",
    email: "alice.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_bob",
    name: "Student (Bob Agyeman)",
    email: "bob.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_clara",
    name: "Student (Clara Asiedu)",
    email: "clara.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_daniel",
    name: "Student (Daniel Nkrumah)",
    email: "daniel.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_emma",
    name: "Student (Emma Ofosu)",
    email: "emma.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_frank",
    name: "Student (Frank Boakye)",
    email: "frank.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_grace",
    name: "Student (Grace Appiah)",
    email: "grace.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_henry",
    name: "Student (Henry Mensah)",
    email: "henry.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_irene",
    name: "Student (Irene Agyei)",
    email: "irene.student@st.git.edu.gh",
    password: "password123",
  },
  {
    id: "student_john",
    name: "Student (John Opoku)",
    email: "john.student@st.git.edu.gh",
    password: "password123",
  },
];

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: Readonly<LoginFormProps>) {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data as LoginRequest);
      reset();
      onSuccess?.();
    } catch (err) {
      // Error is handled by the store
      console.error("Login failed:", err);
    }
  };

  const handleCredentialSelect = (credential: DevCredential) => {
    setValue("email", credential.email);
    setValue("password", credential.password);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access ELMS
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10"
                {...register("password")}
                disabled={isLoading}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="rounded border-gray-300"
              {...register("rememberMe")}
              disabled={isLoading}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me
            </Label>
          </div>

          {/* Development Helper - Credentials Dropdown */}
          {process.env.NODE_ENV === "development" && (
            <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
              <p className="text-xs text-orange-600 mb-2">Development Helper</p>
              <div className="relative" ref={dropdownRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading}
                  className="w-full text-orange-700 border-orange-300 hover:bg-orange-100 justify-between"
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Select Credentials
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-md shadow-lg z-10">
                    {DEV_CREDENTIALS.map((credential) => (
                      <button
                        key={credential.id}
                        type="button"
                        onClick={() => handleCredentialSelect(credential)}
                        className="w-full px-3 py-2 text-left hover:bg-orange-50 first:rounded-t-md last:rounded-b-md border-b border-orange-100 last:border-b-0"
                        disabled={isLoading}
                      >
                        <div className="font-medium text-sm">
                          {credential.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {credential.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-orange-500 mt-2">
                Click to auto-fill login credentials
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
    </div>
  );
}
