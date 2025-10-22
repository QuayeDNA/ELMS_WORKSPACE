import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

const roleStyles: Record<UserRole, { bg: string; text: string; label: string }> = {
  [UserRole.SUPER_ADMIN]: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-200',
    label: 'Super Admin',
  },
  [UserRole.ADMIN]: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    label: 'Admin',
  },
  [UserRole.DEAN]: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-200',
    label: 'Dean',
  },
  [UserRole.HOD]: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-800 dark:text-cyan-200',
    label: 'HOD',
  },
  [UserRole.FACULTY_ADMIN]: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-800 dark:text-teal-200',
    label: 'Faculty Admin',
  },
  [UserRole.EXAMS_OFFICER]: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-800 dark:text-emerald-200',
    label: 'Exams Officer',
  },
  [UserRole.SCRIPT_HANDLER]: {
    bg: 'bg-lime-100 dark:bg-lime-900/30',
    text: 'text-lime-800 dark:text-lime-200',
    label: 'Script Handler',
  },
  [UserRole.INVIGILATOR]: {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    text: 'text-sky-800 dark:text-sky-200',
    label: 'Invigilator',
  },
  [UserRole.LECTURER]: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    label: 'Lecturer',
  },
  [UserRole.STUDENT]: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-200',
    label: 'Student',
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const style = roleStyles[role];

  if (!style) {
    return <Badge className={className}>{role}</Badge>;
  }

  return (
    <Badge
      className={cn(
        style.bg,
        style.text,
        'font-medium border-0',
        className
      )}
    >
      {style.label}
    </Badge>
  );
}
