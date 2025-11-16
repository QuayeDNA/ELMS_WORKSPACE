// Program Course mappings - defines which courses each program offers per level and semester
export const programCoursesData = [
  // ============================================
  // COMPUTER SCIENCE PROGRAM (BSC_CS)
  // ============================================

  // LEVEL 100 - SEMESTER 1
  {
    programCode: 'BSC_CS',
    courseCode: 'CSE101', // Introduction to Programming
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'MATH101', // Calculus I
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'PHYS101', // General Physics I
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'GEN101', // Technical Writing and Communication
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'GEN102', // Critical Thinking and Problem Solving
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  },

  // LEVEL 100 - SEMESTER 2
  {
    programCode: 'BSC_CS',
    courseCode: 'MATH102', // Calculus II
    level: 100,
    semester: 2,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'PHYS102', // General Physics II
    level: 100,
    semester: 2,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },

  // LEVEL 200 - SEMESTER 1
  {
    programCode: 'BSC_CS',
    courseCode: 'CSE201', // Data Structures and Algorithms
    level: 200,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 2
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'CSE202', // Object-Oriented Programming
    level: 200,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 2
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'MATH201', // Discrete Mathematics
    level: 200,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 2
  },

  // LEVEL 300 - SEMESTER 1
  {
    programCode: 'BSC_CS',
    courseCode: 'CSE301', // Database Systems
    level: 300,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 3
  },
  {
    programCode: 'BSC_CS',
    courseCode: 'CSE302', // Software Engineering
    level: 300,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 3
  },

  // ============================================
  // SOFTWARE ENGINEERING PROGRAM (BSC_SE)
  // ============================================

  // LEVEL 100 - SEMESTER 1
  {
    programCode: 'BSC_SE',
    courseCode: 'CSE101', // Introduction to Programming
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_SE',
    courseCode: 'MATH101', // Calculus I
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_SE',
    courseCode: 'GEN101', // Technical Writing and Communication
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  },
  {
    programCode: 'BSC_SE',
    courseCode: 'GEN102', // Critical Thinking and Problem Solving
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  },

  // LEVEL 200 - SEMESTER 1
  {
    programCode: 'BSC_SE',
    courseCode: 'CSE201', // Data Structures and Algorithms
    level: 200,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 2
  },
  {
    programCode: 'BSC_SE',
    courseCode: 'CSE202', // Object-Oriented Programming
    level: 200,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 2
  },

  // ============================================
  // ELECTRICAL ENGINEERING PROGRAM (BENG_EE)
  // ============================================

  // LEVEL 100 - SEMESTER 1
  {
    programCode: 'BENG_EE',
    courseCode: 'MATH101', // Calculus I
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BENG_EE',
    courseCode: 'PHYS101', // General Physics I
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BENG_EE',
    courseCode: 'GEN101', // Technical Writing and Communication
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  },

  // LEVEL 200 - SEMESTER 1
  {
    programCode: 'BENG_EE',
    courseCode: 'EEE201', // Circuit Analysis I
    level: 200,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 2
  },

  // ============================================
  // BUSINESS ADMINISTRATION PROGRAM (BBA)
  // ============================================

  // LEVEL 100 - SEMESTER 1
  {
    programCode: 'BBA',
    courseCode: 'BUS101', // Principles of Management
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BBA',
    courseCode: 'ECON101', // Microeconomics
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: true,
    yearInProgram: 1
  },
  {
    programCode: 'BBA',
    courseCode: 'GEN101', // Technical Writing and Communication
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  },
  {
    programCode: 'BBA',
    courseCode: 'GEN102', // Critical Thinking and Problem Solving
    level: 100,
    semester: 1,
    isRequired: true,
    isCore: false,
    yearInProgram: 1
  }
];

export default programCoursesData;
