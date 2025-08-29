import React from "react";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-700 p-4">

        {/* Left hero panel - large colorful image/gradient */}
        <div className="hidden lg:block relative bg-transparent text-white">
          <div className="absolute inset-6 rounded-xl border-4 border-white/30 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.04)_0%,transparent_20%),radial-gradient(circle_at_90%_80%,rgba(255,255,255,0.03)_0%,transparent_25%)]" />
            <div className="absolute inset-0 bg-[url('https://www.istockphoto.com/photos/classroom-teenage-boys-student-exam')] bg-cover bg-center opacity-30" />

            <div className="relative z-10 h-full flex flex-col justify-between p-10">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/70 mb-6">A wise quote</div>
              </div>

              <div className="max-w-sm">
                <h1 className="text-5xl font-serif leading-tight mb-4">Get Everything
                  <br />You Want</h1>
                <p className="text-sm text-white/80">You can get everything you want if you work hard, trust the process, and stick to the plan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right auth panel - contrasting background for testing (white) */}
        <div className="flex items-center justify-center p-8 bg-white rounded shadow-glow">
          <div className="relative z-10 w-full max-w-md">
            {/* Theme toggle top-right */}
            <div className="absolute top-6 right-6">
              <ThemeToggle />
            </div>

            {/* Logo / Heading */}
            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-foreground">Welcome Back</h2>
              <p className="mt-2 text-sm text-muted-foreground">Enter your email and password to access your account</p>
            </div>

            {/* children (login/register form) */}
            <div className="mt-6">
              {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-muted-foreground">
              © 2025 ELMS. All rights reserved. • Secure • Reliable • Efficient
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}