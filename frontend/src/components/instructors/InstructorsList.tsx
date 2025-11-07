import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { instructorService } from "@/services/instructor.service";
import { Instructor, InstructorFilters } from "@/types/instructor";
import {
  Search,
  Plus,
  BarChart3,
  Users,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InstructorsListProps {
  initialFilters?: InstructorFilters;
}

export const InstructorsList: React.FC<InstructorsListProps> = ({
  initialFilters = {},
}) => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InstructorFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch instructors function
  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await instructorService.getInstructors(filters);

      setInstructors(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch instructors");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  // Fetch when filters change
  useEffect(() => {
    if (filters.page !== 1 || Object.keys(filters).length > 2) {
      fetchInstructors();
    }
  }, [filters, fetchInstructors]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchQuery.trim() || undefined,
          page: 1
        }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.search]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSearchQuery("");
  };

  const formatAcademicRank = (rank: string | null) => {
    if (!rank) return "Not specified";
    return rank
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatEmploymentType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "ON_LEAVE":
        return "secondary";
      case "RETIRED":
        return "outline";
      default:
        return "destructive";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading instructors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchInstructors} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Instructors</h1>
          <p className="text-muted-foreground">
            {pagination.total} instructor{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/admin/instructors/stats")}
            variant="outline"
            size="sm"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </Button>
          <Button
            onClick={() => navigate("/admin/instructors/new")}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instructors by name, staff ID, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.sortBy || "id"}
                onValueChange={(value) => handleSortChange(value, filters.sortOrder || "desc")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Created Date</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="academicRank">Academic Rank</SelectItem>
                  <SelectItem value="hireDate">Hire Date</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) => handleSortChange(filters.sortBy || "id", value as "asc" | "desc")}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
              {(filters.search || filters.sortBy !== "id" || filters.sortOrder !== "desc") && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {instructors.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No instructors found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first instructor"
                }
              </p>
              <Button onClick={() => navigate("/admin/instructors/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Instructor
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Instructors Grid */}
          <div className="grid gap-4">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {instructor.user.firstName[0]}{instructor.user.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {instructor.user.title} {instructor.user.firstName} {instructor.user.lastName}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(instructor.employmentStatus)}>
                            {formatEmploymentType(instructor.employmentStatus)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Staff ID: {instructor.staffId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {instructor.user.email}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            {formatAcademicRank(instructor.academicRank)}
                          </Badge>
                          <Badge variant="outline">
                            {formatEmploymentType(instructor.employmentType)}
                          </Badge>
                          {instructor.specialization && (
                            <Badge variant="outline">
                              {instructor.specialization}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {instructor.user.department?.name} • {instructor.user.department?.faculty?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => navigate(`/admin/instructors/${instructor.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} instructors
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={pagination.limit.toString()}
                      onValueChange={(value) => handleLimitChange(parseInt(value))}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
