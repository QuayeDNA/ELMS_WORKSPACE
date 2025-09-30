import { MoreHorizontal, Edit, Trash2, Users, MapPin, Mail, Phone, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Institution,
  InstitutionStatus,
  InstitutionType,
  INSTITUTION_STATUS_OPTIONS,
} from '@/types/institution';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

interface InstitutionTableProps {
  institutions: Institution[];
  loading?: boolean;
  onEdit: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
  onView: (institution: Institution) => void;
  onManageAdmins?: (institution: Institution) => void;
  onActivate?: (id: number) => void;
  onDeactivate?: (id: number) => void;
  actionLoading?: {[key: number]: boolean};
}

interface TableActionMenuProps {
  institution: Institution;
  onEdit: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
  onView: (institution: Institution) => void;
  onManageAdmins?: (institution: Institution) => void;
  onActivate?: (id: number) => void;
  onDeactivate?: (id: number) => void;
  isActionLoading?: boolean;
}

// ========================================
// HELPER COMPONENTS
// ========================================

const StatusBadge = ({ status }: { status: InstitutionStatus }) => {
  const statusOption = INSTITUTION_STATUS_OPTIONS.find(opt => opt.value === status);
  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Badge 
      variant="outline" 
      className={colorMap[statusOption?.color || 'gray']}
    >
      {statusOption?.label || status}
    </Badge>
  );
};

const TypeBadge = ({ type }: { type: InstitutionType }) => {
  const typeMap = {
    [InstitutionType.UNIVERSITY]: 'University',
    [InstitutionType.TECHNICAL_UNIVERSITY]: 'Tech University',
    [InstitutionType.POLYTECHNIC]: 'Polytechnic',
    [InstitutionType.COLLEGE]: 'College',
    [InstitutionType.INSTITUTE]: 'Institute',
    [InstitutionType.OTHER]: 'Other',
  };

  return (
    <Badge variant="secondary">
      {typeMap[type]}
    </Badge>
  );
};

const TableActionMenu = ({ 
  institution, 
  onEdit, 
  onDelete, 
  onView, 
  onManageAdmins,
  onActivate,
  onDeactivate,
  isActionLoading = false
}: TableActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onView(institution)} disabled={isActionLoading}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(institution)} disabled={isActionLoading}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Institution
        </DropdownMenuItem>
        {onManageAdmins && (
          <DropdownMenuItem onClick={() => onManageAdmins(institution)} disabled={isActionLoading}>
            <Users className="mr-2 h-4 w-4" />
            Manage Admins
          </DropdownMenuItem>
        )}
        {onActivate && institution.status !== InstitutionStatus.ACTIVE && (
          <DropdownMenuItem onClick={() => onActivate(institution.id)} disabled={isActionLoading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isActionLoading ? 'Activating...' : 'Activate'}
          </DropdownMenuItem>
        )}
        {onDeactivate && institution.status === InstitutionStatus.ACTIVE && (
          <DropdownMenuItem onClick={() => onDeactivate(institution.id)} disabled={isActionLoading}>
            <XCircle className="mr-2 h-4 w-4" />
            {isActionLoading ? 'Deactivating...' : 'Deactivate'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => onDelete(institution)}
          className="text-red-600 focus:text-red-600"
          disabled={isActionLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export const InstitutionTable = ({
  institutions,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onManageAdmins,
  onActivate,
  onDeactivate,
  actionLoading = {},
}: InstitutionTableProps) => {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Institution Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[70px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, index) => `loading-${Date.now()}-${index}`).map((key) => (
              <tr key={key} className="border-t">
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Institution Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[70px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                No institutions found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Institution Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[70px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((institution) => (
            <tr key={institution.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{institution.name}</div>
                  {institution.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {institution.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {institution.code}
                </code>
              </td>
              <td className="px-4 py-3">
                <TypeBadge type={institution.type} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={institution.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  {institution.city ? 
                    institution.state ? 
                      `${institution.city}, ${institution.state}` : 
                      institution.city :
                    'Not specified'
                  }
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  {institution.contactEmail && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-[120px]">{institution.contactEmail}</span>
                    </div>
                  )}
                  {institution.contactPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{institution.contactPhone}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-gray-600">
                  {formatDate(institution.createdAt)}
                </span>
              </td>
              <td className="px-4 py-3">
                <TableActionMenu
                  institution={institution}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  onManageAdmins={onManageAdmins}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  isActionLoading={actionLoading[institution.id] || false}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InstitutionTable;



