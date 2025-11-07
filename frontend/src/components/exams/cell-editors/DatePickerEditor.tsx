import { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export interface DatePickerEditorProps extends RenderEditCellProps<any> {
  minDate?: Date;
  maxDate?: Date;
}

export const DatePickerEditor = (props: DatePickerEditorProps) => {
  const [value, setValue] = useState<Date | undefined>(
    props.row[props.column.key] ? new Date(props.row[props.column.key]) : undefined
  );
  const [isOpen, setIsOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-open the calendar when cell is focused
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    setValue(date);
    setIsOpen(false);
    // Update the row with the new value
    props.onRowChange({
      ...props.row,
      [props.column.key]: date ? format(date, 'yyyy-MM-dd') : ''
    });
    props.onClose(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <input
          ref={inputRef}
          type="text"
          value={value ? format(value, 'MMM dd, yyyy') : ''}
          readOnly
          className="w-full h-full px-2 border-none focus:outline-none"
          placeholder="Select date"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={(date) => {
            if (props.minDate && date < props.minDate) return true;
            if (props.maxDate && date > props.maxDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
