import React from 'react';
import { Department } from '@/types/department';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DepartmentEditProps {
  department: Department;
  onSuccess: () => void;
  onCancel: () => void;
}

const DepartmentEdit: React.FC<DepartmentEditProps> = ({ department, onSuccess, onCancel }) => {
  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>Edit Department: {department.name}</DialogTitle>
      </DialogHeader>

      <div className="mt-4">
        {/* This will be implemented similar to DepartmentCreate but with pre-filled values */}
        <p className="text-muted-foreground">Department edit form will be implemented here...</p>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSuccess}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default DepartmentEdit;
