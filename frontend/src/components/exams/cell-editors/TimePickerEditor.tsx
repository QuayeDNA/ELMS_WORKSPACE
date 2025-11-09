import React, { useState, useRef, useEffect } from 'react';
import { RenderEditCellProps } from 'react-data-grid';
import { ExamEntryRow } from '../ExamEntryExcelView';

export const TimePickerEditor = (props: RenderEditCellProps<ExamEntryRow>) => {
  const [value, setValue] = useState<string>((props.row[props.column.key] as string) || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    const updatedRow = {
      ...props.row,
      [props.column.key]: newValue
    };
    props.onRowChange(updatedRow, true);
  };

  return (
    <input
      ref={inputRef}
      type="time"
      value={value}
      onChange={handleTimeChange}
      onBlur={() => setTimeout(() => props.onClose(true), 0)}
      className="w-full h-full px-2 border-none focus:outline-none bg-transparent"
    />
  );
};
