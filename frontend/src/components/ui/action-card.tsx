import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  badge?: string;
  className?: string;
  disabled?: boolean;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  href,
  badge,
  className,
  disabled = false,
}: ActionCardProps) {
  const content = (
    <CardContent className="p-6 h-full flex flex-col">
      {/* Icon and Badge Row */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'p-3 rounded-xl transition-all duration-300',
          disabled ? 'bg-gray-100' : 'bg-primary/10 group-hover:bg-primary group-hover:scale-110'
        )}>
          <Icon className={cn(
            'h-6 w-6 transition-colors duration-300',
            disabled ? 'text-gray-400' : 'text-primary group-hover:text-primary-foreground'
          )} />
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>

      {/* Title and Description */}
      <div className="flex-1 space-y-2">
        <h3 className="font-semibold text-base leading-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow Icon */}
      {!disabled && (
        <div className="mt-4 flex items-center text-primary text-sm font-medium">
          <span className="mr-2">View</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
        </div>
      )}
    </CardContent>
  );

  if (href && !disabled) {
    return (
      <Link to={href} className="block h-full">
        <Card
          className={cn(
            'group transition-all duration-300 h-full',
            'cursor-pointer hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/30',
            'bg-card hover:bg-accent/5',
            className
          )}
        >
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card
      className={cn(
        'group transition-all duration-300 h-full',
        !disabled && 'cursor-pointer hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-primary/30 bg-card hover:bg-accent/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {content}
    </Card>
  );
}
