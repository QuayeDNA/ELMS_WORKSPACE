/**
 * Component Showcase Page
 * Simple, developer-friendly component showcase
 * View at: /showcase (development only)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RoleBadge } from '@/components/ui/role-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/ui/stat-card';
import { ActionCard } from '@/components/ui/action-card';
import { UserRole } from '@/types/auth';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Copy,
  Check,
  Users,
  BookOpen,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react';

export function ComponentShowcase() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyCode(code, id)}
        className="absolute top-2 right-2 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
      >
        {copiedCode === id ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-neutral-400" />
        )}
      </button>
    </div>
  );

  const ComponentSection = ({
    title,
    description,
    children
  }: {
    title: string;
    description: string;
    children: React.ReactNode
  }) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        {children}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ELMS Design System</h1>
        <p className="text-lg text-muted-foreground">
          Component showcase and usage examples
        </p>
        <Badge className="mt-2 bg-primary text-primary-foreground">
          Academic Blue Theme
        </Badge>
      </div>

      <Tabs defaultValue="colors" className="space-y-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-8">
          <ComponentSection
            title="Primary Colors"
            description="Academic Blue - Main brand colors used for primary actions and navigation"
          >
            <div className="grid grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold">
                  600
                </div>
                <p className="text-xs text-center font-mono">#2563eb</p>
                <p className="text-xs text-center text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-blue-300 flex items-center justify-center text-neutral-900 font-semibold">
                  300
                </div>
                <p className="text-xs text-center font-mono">#93c5fd</p>
                <p className="text-xs text-center text-muted-foreground">Light</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-blue-700 flex items-center justify-center text-white font-semibold">
                  700
                </div>
                <p className="text-xs text-center font-mono">#1d4ed8</p>
                <p className="text-xs text-center text-muted-foreground">Dark</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-blue-100 flex items-center justify-center text-neutral-900 font-semibold">
                  100
                </div>
                <p className="text-xs text-center font-mono">#dbeafe</p>
                <p className="text-xs text-center text-muted-foreground">Container</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-blue-900 flex items-center justify-center text-white font-semibold">
                  900
                </div>
                <p className="text-xs text-center font-mono">#1e3a8a</p>
                <p className="text-xs text-center text-muted-foreground">Deep</p>
              </div>
            </div>
          </ComponentSection>

          <ComponentSection
            title="Semantic Colors"
            description="Colors used to convey meaning and status"
          >
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-green-600 flex items-center justify-center text-white font-semibold">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-xs text-center font-mono">#059669</p>
                <p className="text-xs text-center text-muted-foreground">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-amber-500 flex items-center justify-center text-white font-semibold">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <p className="text-xs text-center font-mono">#f59e0b</p>
                <p className="text-xs text-center text-muted-foreground">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-red-600 flex items-center justify-center text-white font-semibold">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <p className="text-xs text-center font-mono">#dc2626</p>
                <p className="text-xs text-center text-muted-foreground">Error</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-sky-600 flex items-center justify-center text-white font-semibold">
                  <Info className="h-8 w-8" />
                </div>
                <p className="text-xs text-center font-mono">#0284c7</p>
                <p className="text-xs text-center text-muted-foreground">Info</p>
              </div>
            </div>
          </ComponentSection>

          <ComponentSection
            title="Role Colors"
            description="Color coding for different user roles in the system"
          >
            <div className="grid grid-cols-4 gap-4">
              {[
                { role: 'Super Admin', color: 'purple' },
                { role: 'Admin', color: 'blue' },
                { role: 'Dean', color: 'indigo' },
                { role: 'HOD', color: 'cyan' },
                { role: 'Faculty Admin', color: 'teal' },
                { role: 'Instructor', color: 'green' },
                { role: 'Student', color: 'amber' },
              ].map((item) => (
                <Badge
                  key={item.role}
                  className={`bg-${item.color}-100 text-${item.color}-800 border-0`}
                >
                  {item.role}
                </Badge>
              ))}
            </div>
          </ComponentSection>
        </TabsContent>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-8">
          <ComponentSection
            title="Button Variants"
            description="Different button styles for various use cases"
          >
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </ComponentSection>

          <ComponentSection
            title="Button Sizes"
            description="Available button sizes"
          >
            <div className="flex items-center flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </ComponentSection>

          <ComponentSection
            title="Button States"
            description="Interactive states"
          >
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button className="hover:shadow-lg">Hover Me</Button>
            </div>
          </ComponentSection>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Usage Example:</p>
            <CodeBlock
              id="button-code"
              code={`<Button variant="default" size="default">
  Click Me
</Button>

<Button variant="outline" size="sm">
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>`}
            />
          </div>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-8">
          <ComponentSection
            title="Input Fields"
            description="Standard form input components"
          >
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input
                  id="disabled"
                  placeholder="Disabled"
                  disabled
                />
              </div>
            </div>
          </ComponentSection>

          <ComponentSection
            title="Badges"
            description="Status and label indicators"
          >
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge className="bg-green-100 text-green-800">Custom</Badge>
            </div>
          </ComponentSection>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-8">
          <ComponentSection
            title="Alert Messages"
            description="User feedback and notification components"
          >
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Info</AlertTitle>
                <AlertDescription>
                  This is an informational message.
                </AlertDescription>
              </Alert>

              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">Success</AlertTitle>
                <AlertDescription className="text-green-800">
                  Your changes have been saved successfully.
                </AlertDescription>
              </Alert>

              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Warning</AlertTitle>
                <AlertDescription className="text-amber-800">
                  Please review the following before proceeding.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  An error occurred. Please try again.
                </AlertDescription>
              </Alert>
            </div>
          </ComponentSection>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-8">
          <ComponentSection
            title="Card Components"
            description="Container components for grouping content"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>
                    A simple card with title and description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Card content goes here. Use cards to group related information.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>
                    Hover to see the effect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cards can be interactive with hover effects.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ComponentSection>

          <ComponentSection
            title="Stat Cards"
            description="Cards for displaying statistics and metrics"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,234</div>
                  <p className="text-xs text-green-600 mt-2">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground mt-2">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">98.5%</div>
                  <p className="text-xs text-green-600 mt-2">+2.3% from last semester</p>
                </CardContent>
              </Card>
            </div>
          </ComponentSection>
        </TabsContent>

        {/* Custom Components Tab */}
        <TabsContent value="custom" className="space-y-8">
          <ComponentSection
            title="Role Badges"
            description="Badges for displaying user roles with consistent colors"
          >
            <div className="flex flex-wrap gap-2">
              <RoleBadge role={UserRole.SUPER_ADMIN} />
              <RoleBadge role={UserRole.ADMIN} />
              <RoleBadge role={UserRole.DEAN} />
              <RoleBadge role={UserRole.HOD} />
              <RoleBadge role={UserRole.FACULTY_ADMIN} />
              <RoleBadge role={UserRole.EXAMS_OFFICER} />
              <RoleBadge role={UserRole.SCRIPT_HANDLER} />
              <RoleBadge role={UserRole.INVIGILATOR} />
              <RoleBadge role={UserRole.LECTURER} />
              <RoleBadge role={UserRole.STUDENT} />
            </div>
          </ComponentSection>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Usage Example:</p>
            <CodeBlock
              id="role-badge-code"
              code={`import { RoleBadge } from '@/components/ui/role-badge';
import { UserRole } from '@/types/auth';

<RoleBadge role={UserRole.ADMIN} />
<RoleBadge role={user.role} className="ml-2" />`}
            />
          </div>

          <ComponentSection
            title="Status Badges"
            description="Badges for displaying entity status with icons"
          >
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
              <StatusBadge status="inactive" />
              <StatusBadge status="error" />
              <StatusBadge status="loading" />
              <StatusBadge status="active" label="Verified" />
              <StatusBadge status="error" label="Failed" showIcon={false} />
            </div>
          </ComponentSection>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Usage Example:</p>
            <CodeBlock
              id="status-badge-code"
              code={`import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="active" />
<StatusBadge status="pending" label="Awaiting Approval" />
<StatusBadge status="error" showIcon={false} />`}
            />
          </div>

          <ComponentSection
            title="Stat Cards"
            description="Cards for displaying statistics with optional trends"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Students"
                value="1,234"
                description="from last month"
                icon={Users}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Active Courses"
                value="42"
                description="this semester"
                icon={BookOpen}
              />
              <StatCard
                title="Completion Rate"
                value="98.5%"
                icon={TrendingUp}
                trend={{ value: 2.3, isPositive: true }}
              />
            </div>
          </ComponentSection>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Usage Example:</p>
            <CodeBlock
              id="stat-card-code"
              code={`import { StatCard } from '@/components/ui/stat-card';
import { Users } from 'lucide-react';

<StatCard
  title="Total Students"
  value="1,234"
  description="from last month"
  icon={Users}
  trend={{ value: 12, isPositive: true }}
/>`}
            />
          </div>

          <ComponentSection
            title="Action Cards"
            description="Interactive cards for navigation and actions"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                title="Manage Students"
                description="View, add, and manage student records"
                icon={Users}
                onClick={() => alert('Navigate to students')}
              />
              <ActionCard
                title="Exam Schedule"
                description="Create and manage exam timetables"
                icon={Calendar}
                onClick={() => alert('Navigate to exams')}
                badge={<Badge variant="destructive">3 Pending</Badge>}
              />
              <ActionCard
                title="Course Management"
                description="Add courses and assign instructors"
                icon={BookOpen}
                onClick={() => alert('Navigate to courses')}
              />
              <ActionCard
                title="Generate Reports"
                description="Export exam and student reports"
                icon={FileText}
                onClick={() => alert('Navigate to reports')}
                disabled
              />
            </div>
          </ComponentSection>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Usage Example:</p>
            <CodeBlock
              id="action-card-code"
              code={`import { ActionCard } from '@/components/ui/action-card';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<ActionCard
  title="Manage Students"
  description="View, add, and manage student records"
  icon={Users}
  onClick={() => navigate('/students')}
  badge={<Badge>25 New</Badge>}
/>`}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Design Tokens Reference */}
      <Separator className="my-8" />

      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold">Design Tokens</h2>
        <p className="text-muted-foreground">
          Import design tokens from <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm">@/lib/design-tokens</code>
        </p>

        <CodeBlock
          id="tokens-import"
          code={`import { colors, spacing, typography } from '@/lib/design-tokens';

// Use in components
const primaryColor = colors.primary[600];
const cardPadding = spacing.lg;
const headingFont = typography.fontSize['2xl'];`}
        />
      </div>

      {/* Footer Note */}
      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Development Only
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          This showcase page is for development reference. Remove or protect this route in production.
        </p>
      </div>
    </div>
  );
}
