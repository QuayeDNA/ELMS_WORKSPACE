import React from "react";
import { Lock, GraduationCap, Shield, Users, BarChart3 } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Multi-role authentication with enterprise-grade security",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Comprehensive user and institution management system",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: GraduationCap,
      title: "Exam Management",
      description: "Complete exam lifecycle management and scheduling",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Real-time insights and comprehensive reporting tools",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Side - Form Panel */}
        <div className="flex-1 lg:w-1/2 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-6 bg-card border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">ELMS</h1>
                <p className="text-xs text-muted-foreground">
                  Exams Management
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>

        {/* Right Side - Branding Panel (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-visible bg-transparent">
          {/* Keep the gradient overlay confined to the right side so the main page background shows around the rounded corner */}
          <div className="absolute top-0 bottom-0 right-0 w-full bg-gradient-to-br from-surface to-surface-variant border-l border-border/20 rounded-l-[70px]"></div>
          <div className="relative z-10 flex flex-col w-full p-8 xl:p-12">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-on-surface rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Lock className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    ELMS
                  </h1>
                  <p className="text-sm text-on-surface-variant font-medium">
                    Exams Logistics Management
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* Main Content Section */}
            <div className="flex-1 flex flex-col justify-center items-center max-w-lg mx-auto">
              {/* Hero Text */}
              <div className="mb-12 text-center">
                <h2 className="text-4xl xl:text-5xl font-bold text-card-foreground leading-tight mb-6">
                  Streamline Your{" "}
                  <span className="bg-gradient-to-r from-primary-600 to-primary-300 bg-clip-text text-transparent">
                    Academic Operations
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Comprehensive examination management system designed for
                  educational institutions of all sizes with modern security and
                  user experience.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-4">
                {features.map((feature) => (
                  <Card
                    key={feature.title}
                    className="bg-card/80 backdrop-blur-sm border-border hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <CardContent className="flex flex-row items-start gap-4 p-5">
                      <div
                        className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-border/20`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-semibold mb-2 text-base text-card-foreground">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at Bottom */}
      <div className="flex items-center justify-between text-sm text-muted-foreground p-6 bg-card border-t border-border">
        <p className="text-muted-foreground">
          © 2025 ELMS. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-card-foreground hover:bg-card/50"
          >
            Privacy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-card-foreground hover:bg-card/50"
          >
            Terms
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-card-foreground hover:bg-card/50"
          >
            Support
          </Button>
        </div>
      </div>
    </div>
  );
};
