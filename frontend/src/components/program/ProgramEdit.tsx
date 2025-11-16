import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProgramForm from "./ProgramForm";
import { Edit } from "lucide-react";
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Edit Program</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Update program information and settings
              </p>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="px-6 pb-6">
            <ProgramForm
              mode="edit"
              program={program}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramEdit;

