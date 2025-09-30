import React from "react";
import DepartmentForm from "./DepartmentForm";
import { DepartmentFormProps } from "@/types/shared";

const DepartmentEdit: React.FC<DepartmentFormProps> = ({
  department,
  onSuccess,
  onCancel,
}) => {
  return (
    <DepartmentForm
      mode="edit"
      department={department}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default DepartmentEdit;
