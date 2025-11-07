import { Calendar, MoreVertical, Edit, Trash2, Check, Eye } from 'lucide-react';
import { AcademicYear } from '@/types/academic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface AcademicYearTableProps {
  years: AcademicYear[];
  currentYearId?: number;
  onView: (yearId: number) => void;
  onEdit: (year: AcademicYear) => void;
  onDelete: (yearId: number) => void;
  onSetCurrent: (yearId: number) => void;
}

export function AcademicYearTable({
  years,
  currentYearId,
  onView,
  onEdit,
  onDelete,
  onSetCurrent,
}: AcademicYearTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year Code</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-center">Semesters</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {years.map((year) => {
            const isCurrent = year.id === currentYearId || year.isCurrent;
            const semesterCount = year.semesters?.length || 0;

            return (
              <TableRow
                key={year.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onView(year.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {year.yearCode}
                  </div>
                </TableCell>
                <TableCell>
                  {year.institution ? (
                    <div>
                      <div className="font-medium">{year.institution.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {year.institution.code}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(year.startDate)}</TableCell>
                <TableCell>{formatDate(year.endDate)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{semesterCount}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {isCurrent ? (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Current
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Past</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(year.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(year);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {!isCurrent && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetCurrent(year.id);
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Set as Current
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(year.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
