import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Student } from '@/types/student';

interface DeleteStudentDialogProps {
  student: Student;
  onConfirm: () => void;
  isDeleting?: boolean;
  trigger?: React.ReactNode;
}

export const DeleteStudentDialog: React.FC<DeleteStudentDialogProps> = ({
  student,
  onConfirm,
  isDeleting = false,
  trigger
}) => {
  const defaultTrigger = (
    <Button variant="destructive" size="sm">
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this student record?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="my-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {student.user.firstName.charAt(0)}{student.user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {student.user.firstName} {student.user.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {student.studentId} • {student.program?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-medium text-red-600">This action cannot be undone. This will:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Permanently delete the student record</li>
            <li>Remove all associated academic data</li>
            <li>Remove enrollment and course history</li>
            <li>Delete associated grades and assessments</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Student
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};



