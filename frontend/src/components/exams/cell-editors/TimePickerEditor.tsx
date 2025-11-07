import React, { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock } from 'lucide-react';

export const TimePickerEditor = (props: RenderEditCellProps<any>) => {
  const [value, setValue] = useState<string>(props.row[props.column.key] || '');
  const [isOpen, setIsOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    props.onRowChange({
      ...props.row,
      [props.column.key]: newValue
    });
  };

  const handlePresetTime = (time: string) => {
    setValue(time);
    setIsOpen(false);
    props.onRowChange({
      ...props.row,
      [props.column.key]: time
    });
    props.onClose(true);
  };

  const commonTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center w-full h-full px-2">
          <Input
            ref={inputRef}
            type="time"
            value={value}
            onChange={handleTimeChange}
            onBlur={() => props.onClose(true)}
            className="border-none shadow-none p-0 h-auto focus-visible:ring-0"
          />
          <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="text-sm font-medium mb-2">Common Times</div>
        <div className="grid grid-cols-2 gap-1">
          {commonTimes.map((time) => (
            <Button
              key={time}
              variant="outline"
              size="sm"
              onClick={() => handlePresetTime(time)}
              className="text-xs"
            >
              {time}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
