import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Users,
  Building,
  GraduationCap,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { facultyService } from "@/services/faculty.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { Faculty, FacultyQuery } from "@/types/faculty";
import { FacultyCreate } from "@/components/faculty/FacultyCreate";
import { FacultyEdit } from "@/components/faculty/FacultyEdit";
import { FacultyView } from "@/components/faculty/FacultyView";

export function FacultyPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDeanDialogOpen, setIsAssignDeanDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  // Build query parameters
  const query: FacultyQuery = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    institutionId: user?.institutionId,
  };

  // Fetch faculties
  const {
    data: facultyResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["faculties", query],
    queryFn: () => facultyService.getFaculties(query),
    retry: 3,
  });

  // Fetch users for dean selection
  const { data: users } = useQuery({
    queryKey: ["users", "dean-candidates", user?.institutionId],
    queryFn: () => userService.getUsers({ institutionId: user?.institutionId }),
    enabled: !!user?.institutionId,
  });

  // Delete faculty mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => facultyService.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });

  // Assign dean mutation
  const assignDeanMutation = useMutation({
    mutationFn: ({
      facultyId,
      deanId,
    }: {
      facultyId: number;
      deanId: number;
    }) => facultyService.assignDean(facultyId, deanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setIsAssignDeanDialogOpen(false);
      setSelectedFaculty(null);
    },
  });

  // Remove dean mutation
  const removeDeanMutation = useMutation({
    mutationFn: (facultyId: number) => facultyService.removeDean(facultyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting faculty:", error);
    }
  };

  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsEditDialogOpen(true);
  };

  const handleView = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsViewDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["faculties"] });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedFaculty(null);
    queryClient.invalidateQueries({ queryKey: ["faculties"] });
  };

  const handleAssignDean = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsAssignDeanDialogOpen(true);
  };

  const handleRemoveDean = async (facultyId: number) => {
    if (
      window.confirm(
        "Are you sure you want to remove the dean from this faculty?"
      )
    ) {
      removeDeanMutation.mutate(facultyId);
    }
  };

  const handleConfirmAssignDean = (deanId: number) => {
    if (selectedFaculty) {
      assignDeanMutation.mutate({ facultyId: selectedFaculty.id, deanId });
    }
  };

  const faculties = facultyResponse?.data?.faculties || [];
  const totalCount = facultyResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Faculty Management
          </h1>
          <p className="text-gray-600">
            Manage academic faculties and their departments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Faculty</DialogTitle>
            </DialogHeader>
            <FacultyCreate
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Faculties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : "Active faculties"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faculties.reduce(
                (acc, faculty) => acc + (faculty._count?.departments || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faculty Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faculties.reduce(
                (acc, faculty) => acc + (faculty._count?.users || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total faculty members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {faculties.length > 0
                ? Math.round(
                    faculties.reduce(
                      (acc, faculty) => acc + (faculty._count?.users || 0),
                      0
                    ) / faculties.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Members per faculty</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search faculties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading faculties...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Error loading faculties: {error.message}
            </div>
          ) : faculties.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No faculties found.{" "}
              {searchTerm && "Try adjusting your search criteria."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Dean</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {faculty.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {faculty.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Est. {faculty.establishedYear || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{faculty.code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={faculty.description}>
                        {faculty.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        {faculty._count?.departments || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        {faculty._count?.users || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {faculty.dean ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {faculty.dean.firstName} {faculty.dean.lastName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No dean assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(faculty)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(faculty)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssignDean(faculty)}
                          className="h-8 w-8 p-0"
                          title="Assign Dean"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        {faculty.dean && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDean(faculty.id)}
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                            title="Remove Dean"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the faculty "{faculty.name}"
                                and all its associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(faculty.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
            faculties
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
          </DialogHeader>
          {selectedFaculty && (
            <FacultyEdit
              faculty={selectedFaculty}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Faculty Details</DialogTitle>
          </DialogHeader>
          {selectedFaculty && (
            <FacultyView
              faculty={selectedFaculty}
              onClose={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dean Dialog */}
      <Dialog
        open={isAssignDeanDialogOpen}
        onOpenChange={setIsAssignDeanDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Dean to {selectedFaculty?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Dean</label>
              <Select
                onValueChange={(value) =>
                  handleConfirmAssignDean(parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dean..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.data?.users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
