import { useState, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExamEntryRow } from '../ExamEntryExcelView';

const LEVELS = [100, 200, 300, 400, 500, 600, 700, 800];

export const LevelSelectorEditor = (props: RenderEditCellProps<ExamEntryRow>) => {
  const [value, setValue] = useState<string>(props.row[props.column.key]?.toString() || '');

  useEffect(() => {
    // Auto-focus the select when the editor opens
    const selectTrigger = document.querySelector('[data-radix-select-trigger]') as HTMLElement;
    if (selectTrigger) {
      selectTrigger.focus();
    }
  }, []);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    const updatedRow = {
      ...props.row,
      [props.column.key]: parseInt(newValue)
    };
    props.onRowChange(updatedRow, true);
  };

  return (
    <div className="w-full h-full flex items-center px-2">
      <Select
        value={value}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="border-none shadow-none p-0 h-auto focus:ring-0">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          {LEVELS.map((level) => (
            <SelectItem key={level} value={level.toString()}>
              Level {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
