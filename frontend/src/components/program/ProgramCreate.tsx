import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProgramForm from "./ProgramForm";

interface ProgramCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ProgramCreate: React.FC<ProgramCreateProps> = ({
  open,
  onOpenChange,
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
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProgramCreate;

