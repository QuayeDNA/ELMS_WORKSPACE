import React from "react";
import DepartmentForm from "./DepartmentForm";
import { DepartmentFormProps } from "@/types/shared";

const DepartmentCreate: React.FC<DepartmentFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  return (
    <DepartmentForm mode="create" onSuccess={onSuccess} onCancel={onCancel} />
  );
};

export default DepartmentCreate;



