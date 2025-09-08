import React from 'react';
import { StudentsList } from '@/components/students/StudentsList';

const StudentsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <StudentsList />
    </div>
  );
};

export default StudentsPage;
