import React from 'react';
import { InstructorsList } from '@/components/instructors/InstructorsList';

const InstructorsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <InstructorsList />
    </div>
  );
};

export default InstructorsPage;



