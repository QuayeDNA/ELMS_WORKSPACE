import { useState } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEVELS = [100, 200, 300, 400, 500, 600, 700, 800];

export const LevelSelectorEditor = (props: RenderEditCellProps<any>) => {
  const [value, setValue] = useState<string>(props.row[props.column.key]?.toString() || '');
  const [isOpen, setIsOpen] = useState(true);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    setIsOpen(false);
    props.onRowChange({
      ...props.row,
      [props.column.key]: parseInt(newValue)
    });
    props.onClose(true);
  };

  return (
    <div className="w-full h-full flex items-center px-2">
      <Select
        value={value}
        onValueChange={handleValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
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
