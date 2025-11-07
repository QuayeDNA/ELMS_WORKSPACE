import { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { courseService } from '@/services/course.service';
import { Course } from '@/types/course';
import { Loader2 } from 'lucide-react';

export interface CourseSearchEditorProps extends RenderEditCellProps<any> {
  institutionId: number | string;
}

export const CourseSearchEditor = (props: CourseSearchEditorProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert institutionId to number
  const institutionIdNum = typeof props.institutionId === 'string'
    ? parseInt(props.institutionId)
    : props.institutionId;

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    if (props.row.courseCode) {
      // Find the course by ID or code
      fetchInitialCourse(props.row.courseCode);
    } else {
      // Load initial courses even for new rows
      loadInitialCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialCourses = async () => {
    if (!institutionIdNum) return;

    try {
      setLoading(true);
      const response = await courseService.getCourses({
        institutionId: institutionIdNum,
        limit: 50,
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialCourse = async (courseIdOrCode: string) => {
    if (!institutionIdNum) return;

    try {
      setLoading(true);
      const response = await courseService.getCourses({
        institutionId: institutionIdNum,
        limit: 50,
      });
      setCourses(response.data);

      const found = response.data.find(
        c => c.id.toString() === courseIdOrCode || c.code === courseIdOrCode
      );
      if (found) {
        setDisplayValue(`${found.code} - ${found.name}`);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCourses = async (searchTerm: string) => {
    if (!institutionIdNum) return;

    // If search term is empty or very short, load all courses
    if (searchTerm.length < 2) {
      loadInitialCourses();
      return;
    }

    try {
      setLoading(true);
      const response = await courseService.getCourses({
        institutionId: institutionIdNum,
        search: searchTerm,
        limit: 20,
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (course: Course) => {
    setDisplayValue(`${course.code} - ${course.name}`);
    setIsOpen(false);
    // Update all course-related fields in the row
    props.onRowChange({
      ...props.row,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      level: course.level,
    });
    props.onClose(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => {
            setDisplayValue(e.target.value);
            searchCourses(e.target.value);
          }}
          placeholder="Search course..."
          className="border-none shadow-none p-0 px-2 h-full focus-visible:ring-0"
        />
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by code or name..."
            onValueChange={searchCourses}
          />
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!loading && courses.length === 0 && (
            <CommandEmpty>No courses found.</CommandEmpty>
          )}
          <CommandGroup className="max-h-[300px] overflow-auto">
            {courses.map((course) => (
              <CommandItem
                key={course.id}
                value={course.code}
                onSelect={() => handleSelect(course)}
              >
                <div className="flex flex-col">
                  <div className="font-medium">{course.code}</div>
                  <div className="text-sm text-muted-foreground">{course.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Level {course.level} • {course.creditHours} credits
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
