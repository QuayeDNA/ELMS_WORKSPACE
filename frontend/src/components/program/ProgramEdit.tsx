import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProgramForm from "./ProgramForm";
import { ProgramFormProps } from "@/types/shared";

interface ProgramEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramFormProps["program"];
  onSuccess: () => void;
}

const ProgramEdit: React.FC<ProgramEditProps> = ({
  open,
  onOpenChange,
  program,
  onSuccess,
}) => {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ProgramForm
          mode="edit"
          program={program}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProgramEdit;

