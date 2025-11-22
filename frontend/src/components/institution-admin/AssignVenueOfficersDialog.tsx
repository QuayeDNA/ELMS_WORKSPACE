import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, UserCheck, Trash2 } from 'lucide-react';
import { examLogisticsService } from '@/services/examLogistics.service';
import { userService } from '@/services/user.service';
import { VenueOfficerAssignment } from '@/types/examLogistics';
import { UserStatus } from '@/types/shared/user';
import { toast } from 'sonner';

interface AssignVenueOfficersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetableId: number;
  venueId: number;
  venueName: string;
  onAssignmentChanged?: () => void;
}

interface Officer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export const AssignVenueOfficersDialog: React.FC<AssignVenueOfficersDialogProps> = ({
  open,
  onOpenChange,
  timetableId,
  venueId,
  venueName,
  onAssignmentChanged,
}) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [assignments, setAssignments] = useState<VenueOfficerAssignment[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Load available officers
  useEffect(() => {
    const loadOfficers = async () => {
      try {
        setLoadingOfficers(true);
        const response = await userService.getUsers({
          limit: 1000, // Get all users
          status: UserStatus.ACTIVE,
        });

        if (response.success && response.data) {
          // Filter for exams officers and admins
          const examsOfficers = response.data.filter(
            (user) => user.role === 'EXAMS_OFFICER' || user.role === 'ADMIN'
          );
          setOfficers(examsOfficers);
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Failed to load officers');
      } finally {
        setLoadingOfficers(false);
      }
    };

    if (open) {
      loadOfficers();
    }
  }, [open]);

  // Load current assignments
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoadingAssignments(true);
        const response = await examLogisticsService.getVenueOfficers(timetableId, venueId);

        if (response.success && response.data) {
          setAssignments(response.data);
        }
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'Failed to load assignments');
      } finally {
        setLoadingAssignments(false);
      }
    };

    if (open) {
      loadAssignments();
    }
  }, [open, timetableId, venueId]);

  const handleAssignOfficer = async () => {
    if (!selectedOfficerId) {
      toast.error('Please select an officer to assign');
      return;
    }

    try {
      setLoading(true);
      const response = await examLogisticsService.assignOfficerToVenue({
        timetableId,
        venueId,
        officerId: parseInt(selectedOfficerId),
      });

      if (response.success && response.data) {
        toast.success('Officer assigned successfully');

        // Refresh assignments list
        const updatedResponse = await examLogisticsService.getVenueOfficers(timetableId, venueId);
        if (updatedResponse.success && updatedResponse.data) {
          setAssignments(updatedResponse.data);
        }

        setSelectedOfficerId('');
        onAssignmentChanged?.();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign officer');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      setLoading(true);
      const response = await examLogisticsService.removeOfficerAssignment(assignmentId);

      if (response.success) {
        toast.success('Officer assignment removed');

        // Refresh assignments list
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
        onAssignmentChanged?.();
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove assignment');
    } finally {
      setLoading(false);
    }
  };

  // Get officers not already assigned
  const availableOfficers = officers.filter(
    (officer) => !assignments.some((a) => a.officerId === officer.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Exams Officers</DialogTitle>
          <DialogDescription>
            Manage officer assignments for <strong>{venueName}</strong> in this timetable.
            Officers will only see venues they are assigned to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assign New Officer Section */}
          <div className="space-y-3">
            <Label htmlFor="officer-select">Add Officer</Label>
            <div className="flex gap-2">
              <Select
                value={selectedOfficerId}
                onValueChange={setSelectedOfficerId}
                disabled={loading || loadingOfficers}
              >
                <SelectTrigger id="officer-select" className="flex-1">
                  <SelectValue placeholder="Select an officer..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingOfficers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : availableOfficers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No available officers
                    </div>
                  ) : (
                    availableOfficers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.firstName} {officer.lastName} - {officer.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssignOfficer}
                disabled={!selectedOfficerId || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Assignments Section */}
          <div className="space-y-3">
            <Label>Assigned Officers ({assignments.length})</Label>
            {loadingAssignments ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No officers assigned to this venue yet
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {assignment.officer?.firstName} {assignment.officer?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.officer?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned by {assignment.assigner?.firstName}{' '}
                          {assignment.assigner?.lastName} on{' '}
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        disabled={loading}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
