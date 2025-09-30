import { Building2, MapPin, Phone, Mail, Globe, Calendar, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Institution, InstitutionStatus, INSTITUTION_STATUS_CONFIG } from '@/types/institution';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

interface InstitutionCardProps {
  institution: Institution;
  onView?: (institution: Institution) => void;
  onEdit?: (institution: Institution) => void;
  onDelete?: (institution: Institution) => void;
  onToggleStatus?: (institution: Institution) => void;
  compact?: boolean;
  showActions?: boolean;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

const getStatusBadge = (status: InstitutionStatus) => {
  const config = INSTITUTION_STATUS_CONFIG[status];
  return (
    <Badge 
      variant={config.variant as "default" | "secondary" | "destructive" | "outline"}
      className={`${config.className} text-xs`}
    >
      {config.label}
    </Badge>
  );
};

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ========================================
// MAIN COMPONENT
// ========================================

export const InstitutionCard = ({
  institution,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  compact = false,
  showActions = true,
}: InstitutionCardProps) => {
  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'view':
        onView?.(institution);
        break;
      case 'edit':
        onEdit?.(institution);
        break;
      case 'delete':
        onDelete?.(institution);
        break;
      case 'toggle-status':
        onToggleStatus?.(institution);
        break;
    }
  };

  const renderCompactCard = () => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{institution.name}</CardTitle>
              <p className="text-sm text-gray-500">{institution.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(institution.status)}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={(e) => handleAction('view', e)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => handleAction('edit', e)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <DropdownMenuItem onClick={(e) => handleAction('toggle-status', e)}>
                      <Settings className="h-4 w-4 mr-2" />
                      {institution.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={(e) => handleAction('delete', e)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-sm text-gray-700 line-clamp-2">{institution.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {institution.city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{institution.city}</span>
              </div>
            )}
            {institution.establishedYear && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{institution.establishedYear}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFullCard = () => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{institution.name}</CardTitle>
              <p className="text-gray-500">{institution.code} • {institution.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(institution.status)}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={(e) => handleAction('view', e)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => handleAction('edit', e)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <DropdownMenuItem onClick={(e) => handleAction('toggle-status', e)}>
                      <Settings className="h-4 w-4 mr-2" />
                      {institution.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={(e) => handleAction('delete', e)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          {institution.description && (
            <p className="text-gray-700 text-sm leading-relaxed">{institution.description}</p>
          )}
          
          {/* Location */}
          {(institution.address || institution.city || institution.state || institution.country) && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                {institution.address && <div>{institution.address}</div>}
                <div>
                  {[institution.city, institution.state, institution.country]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {institution.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a 
                  href={`mailto:${institution.contactEmail}`}
                  className="text-sm text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {institution.contactEmail}
                </a>
              </div>
            )}
            
            {institution.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a 
                  href={`tel:${institution.contactPhone}`}
                  className="text-sm text-gray-600 hover:text-blue-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {institution.contactPhone}
                </a>
              </div>
            )}
            
            {institution.website && (
              <div className="flex items-center gap-2 md:col-span-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <a 
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {institution.website}
                </a>
              </div>
            )}
          </div>
          
          {/* Additional Information */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-4">
              {institution.establishedYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Est. {institution.establishedYear}</span>
                </div>
              )}
            </div>
            <div>
              Updated {formatDate(institution.updatedAt)}
            </div>
          </div>
        </div>
      </CardContent>
      
      {showActions && (onView || onEdit) && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => handleAction('view', e)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => handleAction('edit', e)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );

  return compact ? renderCompactCard() : renderFullCard();
};

export default InstitutionCard;



