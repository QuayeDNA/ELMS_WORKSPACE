import React, { useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { academicService } from '@/services/academic.service';
import { Semester } from '@/types/academic';
import { SemesterList } from '@/components/academic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const SemestersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ✅ Fetch all semesters
  const {
    data: semestersData,
    loading,
    error,
    execute: refetch,
  } = useApiRequest(
    () =>
      academicService.getSemesters({
        page,
        limit: 12,
        search: searchTerm,
        sortBy: 'semesterNumber',
        sortOrder,
      }),
    [page, searchTerm, sortOrder],
    { immediate: true }
  );

  // ✅ Fetch current semester
  const { data: currentSemesterData } = useApiRequest(
    () => academicService.getCurrentSemester(),
    [],
    { immediate: true }
  );

  // ⏳ TODO: Implement create semester
  const handleCreate = () => {
    toast.info('Create Semester functionality - Coming Soon!');
  };

  const handleSelectSemester = (semester: Semester) => {
    toast.info(`Selected: ${semester.name}`);
  };

  const semesters = semestersData?.data || [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Semesters</h1>
          <p className="text-muted-foreground">Manage semester periods and schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Semester
          </Button>
        </div>
      </div>

      {/* Current Semester */}
      {currentSemesterData && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Current Semester</CardTitle>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentSemesterData.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentSemesterData.academicYear?.yearCode}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>
                  {new Date(currentSemesterData.startDate).toLocaleDateString()} -{' '}
                  {new Date(currentSemesterData.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter semesters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search semesters..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Semester 1 First</SelectItem>
                <SelectItem value="desc">Semester 2 First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Semesters List */}
      {!loading && !error && (
        <>
          <SemesterList
            semesters={semesters}
            onSelectSemester={handleSelectSemester}
            emptyMessage="No semesters found."
          />

          {/* Pagination */}
          {/* TODO: Add pagination when backend supports it */}
        </>
      )}
    </div>
  );
};

export default SemestersPage;
