import { useState, useEffect, useCallback } from 'react';
import { examLogisticsService } from '@/services/examLogistics.service';
import { InvigilatorRole } from '@/types/examLogistics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface ExamSession {
  id: number;
  courseCode: string;
  courseName: string;
  level: number;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  venue: {
    id: number;
    name: string;
    location: string;
    capacity: number;
  };
  studentCount: number;
  registeredCount: number;
  verifiedCount: number;
  status: string;
  assignments: Assignment[];
}

interface Assignment {
  id: number;
  invigilator: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  role: string;
  status: string;
  checkedInAt: string | null;
  assignedAt: string;
}

interface AvailableInvigilator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  departmentCode: string;
  isAvailable: boolean;
  conflict: {
    courseCode: string;
    courseName: string;
    startTime: string;
    endTime: string;
  } | null;
}

interface InvigilatorAssignmentPanelProps {
  timetableId: number;
  onAssignmentChange?: () => void;
}

export default function InvigilatorAssignmentPanel({ timetableId, onAssignmentChange }: InvigilatorAssignmentPanelProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [availableInvigilators, setAvailableInvigilators] = useState<AvailableInvigilator[]>([]);
  const [loadingInvigilators, setLoadingInvigilators] = useState(false);
  const [selectedInvigilatorId, setSelectedInvigilatorId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('INVIGILATOR');
  const [duties, setDuties] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examLogisticsService.getSessionsForAssignment(timetableId);
      if (response.success && response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load exam sessions');
    } finally {
      setLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    if (timetableId) {
      loadSessions();
    }
  }, [timetableId, loadSessions]);

  const loadAvailableInvigilators = async (session: ExamSession) => {
    try {
      setLoadingInvigilators(true);
      const response = await examLogisticsService.getAvailableInvigilators({
        examDate: session.examDate,
        startTime: session.startTime,
        endTime: session.endTime
      });
      if (response.success && response.data) {
        setAvailableInvigilators(response.data);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load available invigilators');
    } finally {
      setLoadingInvigilators(false);
    }
  };

  const handleOpenAssignModal = (session: ExamSession) => {
    setSelectedSession(session);
    setSelectedInvigilatorId('');
    setSelectedRole('INVIGILATOR');
    setDuties('');
    setSearchTerm('');
    setAssignModalOpen(true);
    loadAvailableInvigilators(session);
  };

  const handleAssignInvigilator = async () => {
    if (!selectedSession || !selectedInvigilatorId || !user) {
      toast.error('Please select an invigilator');
      return;
    }

    try {
      setSubmitting(true);
      const response = await examLogisticsService.assignInvigilator({
        examEntryId: selectedSession.id,
        invigilatorId: parseInt(selectedInvigilatorId),
        role: InvigilatorRole[selectedRole as keyof typeof InvigilatorRole],
        venueId: selectedSession.venue.id,
        assignedBy: user.id,
        duties: duties || undefined
      });

      if (response.success) {
        toast.success('Invigilator assigned successfully');
        setAssignModalOpen(false);
        loadSessions();
        onAssignmentChange?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign invigilator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this invigilator assignment?')) {
      return;
    }

    try {
      const response = await examLogisticsService.removeInvigilatorAssignment(assignmentId);
      if (response.success) {
        toast.success('Invigilator assignment removed');
        loadSessions();
        onAssignmentChange?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove assignment');
    }
  };

  const filteredInvigilators = availableInvigilators.filter(inv =>
    inv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'default';
      case 'IN_PROGRESS': return 'secondary';
      case 'COMPLETED': return 'outline';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CHIEF_INVIGILATOR': return 'bg-purple-100 text-purple-800';
      case 'INVIGILATOR': return 'bg-blue-100 text-blue-800';
      case 'RELIEF_INVIGILATOR': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invigilator Assignment</CardTitle>
          <CardDescription>
            Assign invigilators to exam sessions. {sessions.length} sessions found.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {session.courseCode} - {session.courseName}
                  </CardTitle>
                  <CardDescription>Level {session.level}</CardDescription>
                </div>
                <Badge variant={getStatusColor(session.status)}>
                  {session.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(session.examDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{session.venue.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{session.studentCount} students</span>
                </div>
              </div>

              <Separator />

              {/* Assigned Invigilators */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">
                    Assigned Invigilators ({session.assignments.length})
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAssignModal(session)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Invigilator
                  </Button>
                </div>

                {session.assignments.length > 0 ? (
                  <div className="space-y-2">
                    {session.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">
                              {assignment.invigilator.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {assignment.invigilator.email}
                            </div>
                          </div>
                          <Badge className={getRoleColor(assignment.role)}>
                            {assignment.role.replace('_', ' ')}
                          </Badge>
                          {assignment.checkedInAt && (
                            <Badge variant="outline" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Checked In
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-lg">
                    No invigilators assigned yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign Invigilator</DialogTitle>
            <DialogDescription>
              {selectedSession && (
                <>
                  {selectedSession.courseCode} - {format(new Date(selectedSession.examDate), 'MMM dd, yyyy')} at{' '}
                  {format(new Date(selectedSession.startTime), 'HH:mm')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHIEF_INVIGILATOR">Chief Invigilator</SelectItem>
                  <SelectItem value="INVIGILATOR">Invigilator</SelectItem>
                  <SelectItem value="RELIEF_INVIGILATOR">Relief Invigilator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duties (Optional) */}
            <div className="space-y-2">
              <Label>Duties (Optional)</Label>
              <Input
                placeholder="e.g., Main hall supervision, attendance verification"
                value={duties}
                onChange={(e) => setDuties(e.target.value)}
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search Invigilators</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Invigilator List */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <Label className="mb-2">
                Available Invigilators ({filteredInvigilators.length})
              </Label>
              {loadingInvigilators ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="flex-1 border rounded-md">
                  <div className="p-2 space-y-2">
                    {filteredInvigilators.map((invigilator) => (
                      <div
                        key={invigilator.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedInvigilatorId === String(invigilator.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-secondary/50'
                        } ${!invigilator.isAvailable ? 'opacity-60' : ''}`}
                        onClick={() => {
                          if (invigilator.isAvailable) {
                            setSelectedInvigilatorId(String(invigilator.id));
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{invigilator.fullName}</span>
                              {invigilator.isAvailable ? (
                                <Badge variant="outline" className="gap-1 text-green-600">
                                  <UserCheck className="h-3 w-3" />
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 text-red-600">
                                  <UserX className="h-3 w-3" />
                                  Busy
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {invigilator.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {invigilator.department} • {invigilator.role}
                            </div>
                            {invigilator.conflict && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 text-amber-600 mt-0.5" />
                                <div>
                                  <div className="font-medium text-amber-800">
                                    Conflicting Assignment
                                  </div>
                                  <div className="text-amber-700">
                                    {invigilator.conflict.courseCode} - {invigilator.conflict.courseName}
                                  </div>
                                  <div className="text-amber-600">
                                    {format(new Date(invigilator.conflict.startTime), 'HH:mm')} -{' '}
                                    {format(new Date(invigilator.conflict.endTime), 'HH:mm')}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {selectedInvigilatorId === String(invigilator.id) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignInvigilator}
              disabled={!selectedInvigilatorId || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Invigilator'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
