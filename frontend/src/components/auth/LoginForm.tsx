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
import { toast } from "sonner";

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
  role: string;
}

const DEV_CREDENTIALS: { role: string; users: DevCredential[] }[] = [
  {
    role: 'Administrator',
    users: [
      {
        id: 'admin',
        name: 'John Administrator',
        email: 'admin@git.edu.gh',
        password: 'Password123!',
        role: 'Administrator'
      }
    ]
  },
  {
    role: 'Faculty Admins (Deans)',
    users: [
      {
        id: 'dean-engineering',
        name: 'Prof Mary Engineering-Dean',
        email: 'dean.engineering@git.edu.gh',
        password: 'Password123!',
        role: 'Faculty Admin'
      },
      {
        id: 'dean-science',
        name: 'Prof Robert Science-Dean',
        email: 'dean.science@git.edu.gh',
        password: 'Password123!',
        role: 'Faculty Admin'
      }
    ]
  },
  {
    role: 'Heads of Department',
    users: [
      {
        id: 'hod-cse',
        name: 'Dr Sarah CS-Head',
        email: 'hod.cse@git.edu.gh',
        password: 'Password123!',
        role: 'HOD'
      },
      {
        id: 'hod-math',
        name: 'Dr David Math-Head',
        email: 'hod.math@git.edu.gh',
        password: 'Password123!',
        role: 'HOD'
      }
    ]
  },
  {
    role: 'Exams Officers',
    users: [
      {
        id: 'exams-engineering',
        name: 'Mrs Grace Exams-Officer',
        email: 'exams.engineering@git.edu.gh',
        password: 'Password123!',
        role: 'Exams Officer'
      },
      {
        id: 'exams-science',
        name: 'Mr Michael Exams-Officer',
        email: 'exams.science@git.edu.gh',
        password: 'Password123!',
        role: 'Exams Officer'
      }
    ]
  },
  {
    role: 'Lecturers',
    users: [
      {
        id: 'james-lecturer',
        name: 'Dr James Mensah (CSE)',
        email: 'james.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'jennifer-lecturer',
        name: 'Dr Jennifer Asante (CSE)',
        email: 'jennifer.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'peter-lecturer',
        name: 'Dr Peter Osei (CSE)',
        email: 'peter.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'elizabeth-lecturer',
        name: 'Dr Elizabeth Opoku (Math)',
        email: 'elizabeth.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'samuel-lecturer',
        name: 'Dr Samuel Adjei (Math)',
        email: 'samuel.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'rachel-lecturer',
        name: 'Dr Rachel Boateng (Physics)',
        email: 'rachel.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'frank-lecturer',
        name: 'Dr Frank Amponsah (EEE)',
        email: 'frank.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      }
    ]
  },
  {
    role: 'Students',
    users: [
      {
        id: 'alice-student',
        name: 'Alice Owusu (CS - Level 200)',
        email: 'alice.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'bob-student',
        name: 'Bob Agyeman (CS - Level 200)',
        email: 'bob.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'clara-student',
        name: 'Clara Asiedu (SE - Level 100)',
        email: 'clara.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'daniel-student',
        name: 'Daniel Nkrumah (CS - Level 200)',
        email: 'daniel.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'emma-student',
        name: 'Emma Ofosu (SE - Level 100)',
        email: 'emma.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'frank-student',
        name: 'Frank Boakye (Math - Level 200)',
        email: 'frank.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'grace-student',
        name: 'Grace Appiah (Math - Level 200)',
        email: 'grace.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'henry-student',
        name: 'Henry Mensah (Math - Level 100)',
        email: 'henry.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'irene-student',
        name: 'Irene Agyei (Physics - Level 200)',
        email: 'irene.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'john-student',
        name: 'John Opoku (Physics - Level 100)',
        email: 'john.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      }
    ]
  }
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
      // Trim email and password to prevent whitespace issues
      const loginData = {
        ...data,
        email: data.email.trim(),
        password: data.password.trim(),
      };
      await login(loginData as LoginRequest);
      reset();
      toast.success("Login successful!");
      onSuccess?.();
    } catch (err) {
      // Error is already set in store by login action
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      console.error("Login failed:", err);
      toast.error(errorMessage);
      // Don't reset form on error so user can see what they entered
    }
  };

  const handleCredentialSelect = (credential: DevCredential) => {
    setValue("email", credential.email);
    setValue("password", credential.password);
    setIsDropdownOpen(false);
    toast.success(`Selected ${credential.role}: ${credential.name}`);
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-orange-200 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                    {DEV_CREDENTIALS.map((group, groupIndex) => (
                      <div key={groupIndex} className="border-b border-orange-100 last:border-b-0">
                        <div className="px-3 py-2 bg-orange-50 font-semibold text-xs text-orange-900 uppercase tracking-wide">
                          {group.role}
                        </div>
                        {group.users.map((credential) => (
                          <button
                            key={credential.id}
                            type="button"
                            onClick={() => handleCredentialSelect(credential)}
                            className="w-full px-3 py-2 text-left hover:bg-orange-50 border-b border-orange-50 last:border-b-0"
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
