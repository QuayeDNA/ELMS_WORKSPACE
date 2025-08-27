import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Lock, GraduationCap, Shield, Users, BarChart3 } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Multi-role authentication with enterprise-grade security",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Comprehensive user and institution management system",
    },
    {
      icon: GraduationCap,
      title: "Exam Management",
      description: "Complete exam lifecycle management and scheduling",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Real-time insights and comprehensive reporting tools",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Content */}
      <div className="relative min-h-screen flex justify-center items-center z-10">
        <Card className="w-full max-w-7xl shadow-xl z-20 bg-surface dark:bg-surface rounded-xl overflow-hidden">
          <CardBody className="flex flex-row p-0">
            {/* Left Side - Branding & Features */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-10 bg-primary/5 rounded-l-xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Lock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">ELMS</h1>
                    <p className="text-sm text-foreground/70">
                      Exams Logistics Management
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col justify-center max-w-lg">
                <div className="mb-12">
                  <h2 className="text-4xl font-bold text-foreground mb-4">
                    Streamline Your
                    <span className="text-primary block">
                      {" "}
                      Academic Operations
                    </span>
                  </h2>
                  <p className="text-lg text-foreground/70 leading-relaxed">
                    Comprehensive examination management system designed for
                    educational institutions of all sizes.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-6">
                  {features.map((feature) => (
                    <Card
                      key={feature.title}
                      className="bg-background/60 backdrop-blur-sm border-divider hover:bg-background/80 transition-all duration-200"
                    >
                      <CardBody className="flex flex-row items-start gap-4 p-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-foreground/70">
                            {feature.description}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-foreground/60">
                <p>© 2025 ELMS. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <button className="hover:text-foreground transition-colors">
                    Privacy
                  </button>
                  <button className="hover:text-foreground transition-colors">
                    Terms
                  </button>
                  <button className="hover:text-foreground transition-colors">
                    Support
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 lg:w-1/2 flex flex-col">
              {/* Mobile Header */}
              <div className="lg:hidden flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">ELMS</h1>
                    <p className="text-xs text-foreground/70">
                      Exams Management
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              {/* Form Container */}
              <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
                <div className="w-full max-w-sm">{children}</div>
              </div>

              {/* Mobile Footer */}
              <div className="lg:hidden p-6 text-center">
                <p className="text-xs text-foreground/60">
                  Need help? Contact{" "}
                  <button className="text-primary hover:underline">
                    support@elms.local
                  </button>
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
