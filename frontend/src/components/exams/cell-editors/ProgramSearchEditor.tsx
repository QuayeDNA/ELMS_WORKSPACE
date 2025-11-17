import { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { programService } from '@/services/program.service';
import { Program } from '@/types/shared/program';
import { Loader2, X } from 'lucide-react';
import { ExamEntryRow } from '../ExamEntryExcelView';

export interface ProgramSearchEditorProps extends RenderEditCellProps<ExamEntryRow> {
  institutionId: number | string;
}

export const ProgramSearchEditor = (props: ProgramSearchEditorProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert institutionId to number
  const institutionIdNum = typeof props.institutionId === 'string'
    ? parseInt(props.institutionId)
    : props.institutionId;

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    // Initialize from existing programIds if present
    if (props.row.programIds) {
      const programIds = props.row.programIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (programIds.length > 0) {
        loadSelectedPrograms(programIds);
      }
    }

    // Load initial programs
    loadInitialPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialPrograms = async () => {
    if (!institutionIdNum) return;

    try {
      setLoading(true);
      const response = await programService.getPrograms({
        institutionId: institutionIdNum,
        limit: 50,
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedPrograms = async (programIds: number[]) => {
    if (!institutionIdNum) return;

    try {
      // Load all programs and filter by IDs
      const response = await programService.getPrograms({
        institutionId: institutionIdNum,
        limit: 200, // Load more to ensure we get selected ones
      });

      const selected = response.data.filter(p => programIds.includes(p.id));
      setSelectedPrograms(selected);
      updateDisplayValue(selected);
    } catch (error) {
      console.error('Error loading selected programs:', error);
    }
  };

  const updateDisplayValue = (programs: Program[]) => {
    if (programs.length === 0) {
      setDisplayValue('');
    } else if (programs.length === 1) {
      setDisplayValue(`${programs[0].code} - ${programs[0].name}`);
    } else {
      setDisplayValue(`${programs.length} programs selected`);
    }
  };

  const searchPrograms = async (searchTerm: string) => {
    if (!institutionIdNum) return;

    // If search term is empty or very short, load all programs
    if (searchTerm.length < 2) {
      loadInitialPrograms();
      return;
    }

    try {
      setLoading(true);
      const response = await programService.getPrograms({
        institutionId: institutionIdNum,
        search: searchTerm,
        limit: 20,
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error searching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (program: Program) => {
    const isAlreadySelected = selectedPrograms.some(p => p.id === program.id);

    let newSelectedPrograms: Program[];
    if (isAlreadySelected) {
      // Remove if already selected
      newSelectedPrograms = selectedPrograms.filter(p => p.id !== program.id);
    } else {
      // Add if not selected
      newSelectedPrograms = [...selectedPrograms, program];
    }

    setSelectedPrograms(newSelectedPrograms);
    updateDisplayValue(newSelectedPrograms);

    // Update the row data
    const updatedRow = {
      ...props.row,
      programIds: newSelectedPrograms.map(p => p.id).join(','),
      programNames: newSelectedPrograms.map(p => p.name).join(', '),
    };
    props.onRowChange(updatedRow, false); // Don't close yet, allow multiple selections
  };

  const handleRemoveProgram = (programId: number) => {
    const newSelectedPrograms = selectedPrograms.filter(p => p.id !== programId);
    setSelectedPrograms(newSelectedPrograms);
    updateDisplayValue(newSelectedPrograms);

    // Update the row data
    const updatedRow = {
      ...props.row,
      programIds: newSelectedPrograms.map(p => p.id).join(','),
      programNames: newSelectedPrograms.map(p => p.name).join(', '),
    };
    props.onRowChange(updatedRow, false);
  };

  const handleClose = () => {
    props.onClose(true);
  };

  return (
    <div className="w-full h-full">
      {/* Selected programs display */}
      {selectedPrograms.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1 p-1 bg-gray-50 rounded">
          {selectedPrograms.map((program) => (
            <div
              key={program.id}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
            >
              <span>{program.code}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveProgram(program.id);
                }}
                className="hover:bg-blue-200 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            value={displayValue}
            onChange={(e) => {
              setDisplayValue(e.target.value);
              searchPrograms(e.target.value);
            }}
            placeholder="Search and select programs..."
            className="border-none shadow-none p-0 px-2 h-full focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleClose();
              }
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by code or name..."
              onValueChange={searchPrograms}
            />
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loading && programs.length === 0 && (
              <CommandEmpty>No programs found.</CommandEmpty>
            )}
            <CommandGroup className="max-h-[300px] overflow-auto">
              {programs.map((program) => {
                const isSelected = selectedPrograms.some(p => p.id === program.id);
                return (
                  <CommandItem
                    key={program.id}
                    value={program.code}
                    onSelect={() => handleSelect(program)}
                    className={isSelected ? 'bg-blue-50' : ''}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <div className="flex flex-col flex-1">
                        <div className="font-medium">{program.code}</div>
                        <div className="text-sm text-muted-foreground">{program.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {program.level} • {program.type}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
          {selectedPrograms.length > 0 && (
            <div className="border-t p-2">
              <button
                onClick={handleClose}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Done ({selectedPrograms.length} selected)
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
