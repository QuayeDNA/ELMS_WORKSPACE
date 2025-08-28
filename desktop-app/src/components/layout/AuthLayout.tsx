import React from "react";
import { Shield, Users, BarChart3, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Theme Toggle Component (simplified for demo)
const ThemeToggle = () => (
  <Button
    variant="outline"
    size="sm"
    className="h-9 w-9 p-0 border-outline/30 hover:bg-accent/50 transition-all duration-200"
  >
    <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-primary to-secondary" />
  </Button>
);

export default function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Enterprise-grade security with multi-role access control",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Streamlined user and institution administration",
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: GraduationCap,
      title: "Exam Management",
      description: "Complete examination lifecycle and scheduling",
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Real-time insights and comprehensive analytics",
      gradient: "from-orange-500 to-amber-600",
      iconBg: "bg-orange-50 dark:bg-orange-950/30",
      iconColor: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-6 border-b border-outline/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">ELMS</h1>
              <p className="text-xs text-muted-foreground">Exam Management System</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">
        {/* Left Panel - Authentication Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Right Panel - Branding & Features */}
        <div className="hidden lg:flex lg:flex-col relative bg-gradient-to-br from-surface-container/30 via-surface-container/50 to-surface-container-high/30 border-l border-outline/20">
          {/* Header */}
          <div className="flex items-center justify-between p-8 xl:p-12">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">ELMS</h1>
                <p className="text-sm text-muted-foreground font-medium">Exam Management System</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center px-8 xl:px-12 pb-8">
            <div className="max-w-xl">
              {/* Hero Section */}
              <div className="mb-12">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary uppercase tracking-wide">
                    Modern Education Platform
                  </span>
                </div>
                
                <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-[1.1] mb-6">
                  Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent">
                    Academic Operations
                  </span>
                </h2>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Streamline examinations, manage users, and gain insights with our 
                  comprehensive education management platform built for modern institutions.
                </p>

                {/* CTA Button */}
                <Button 
                  variant="outline" 
                  className="group border-outline/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>

              {/* Features Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Powerful Features
                </h3>
                
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <Card 
                      key={feature.title}
                      className="group border-outline/20 bg-card/50 hover:bg-card hover:border-outline/40 transition-all duration-300 hover:shadow-sm"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <CardContent className="flex items-start space-x-4 p-5">
                        <div className={`w-10 h-10 ${feature.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 border border-outline/20`}>
                          <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Stats or Social Proof */}
          <div className="px-8 xl:px-12 pb-8">
            <div className="grid grid-cols-3 gap-8 py-6 border-t border-outline/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">500+</div>
                <div className="text-xs text-muted-foreground">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">50K+</div>
                <div className="text-xs text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-outline/20 bg-surface-container/30">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 ELMS. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            {['Privacy', 'Terms', 'Support'].map((link) => (
              <Button
                key={link}
                variant="link"
                className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto transition-colors duration-200"
              >
                {link}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}