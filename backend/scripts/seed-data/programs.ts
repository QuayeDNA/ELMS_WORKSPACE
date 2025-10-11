// Program seed data organized by department
export const programsData = [
  // Computer Science and Engineering Programs
  {
    name: 'Computer Science',
    code: 'BSC_CS',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 120,
    description: 'Bachelor of Science in Computer Science - A comprehensive program covering software development, algorithms, data structures, and computer systems.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, and any other science subject. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'CSE'
  },
  {
    name: 'Software Engineering',
    code: 'BSC_SE',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 120,
    description: 'Bachelor of Science in Software Engineering - Focused on large-scale software development, project management, and software architecture.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, and any other science subject. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'CSE'
  },
  {
    name: 'Computer Science',
    code: 'MSC_CS',
    type: 'MASTERS',
    level: 'POSTGRADUATE',
    durationYears: 2.0,
    creditHours: 60,
    description: 'Master of Science in Computer Science - Advanced study in computer science with research components.',
    admissionRequirements: 'Bachelor\'s degree in Computer Science or related field with minimum Second Class Lower division.',
    isActive: true,
    departmentCode: 'CSE'
  },

  // Electrical and Electronics Engineering Programs
  {
    name: 'Electrical Engineering',
    code: 'BENG_EE',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 128,
    description: 'Bachelor of Engineering in Electrical Engineering - Covering power systems, control systems, and electrical machines.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, Chemistry, and any other science subject. Minimum aggregate of 20.',
    isActive: true,
    departmentCode: 'EEE'
  },
  {
    name: 'Electronics Engineering',
    code: 'BENG_ECE',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 128,
    description: 'Bachelor of Engineering in Electronics Engineering - Focusing on electronic circuits, telecommunications, and digital systems.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, Chemistry, and any other science subject. Minimum aggregate of 20.',
    isActive: true,
    departmentCode: 'EEE'
  },

  // Civil and Environmental Engineering Programs
  {
    name: 'Civil Engineering',
    code: 'BENG_CE',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 132,
    description: 'Bachelor of Engineering in Civil Engineering - Comprehensive program in structural, geotechnical, and transportation engineering.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, Chemistry, and any other science subject. Minimum aggregate of 20.',
    isActive: true,
    departmentCode: 'CEE'
  },

  // Mechanical Engineering Programs
  {
    name: 'Mechanical Engineering',
    code: 'BENG_ME',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 130,
    description: 'Bachelor of Engineering in Mechanical Engineering - Covering thermodynamics, mechanics, and manufacturing processes.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, Chemistry, and any other science subject. Minimum aggregate of 20.',
    isActive: true,
    departmentCode: 'MECH'
  },

  // Mathematics and Statistics Programs
  {
    name: 'Mathematics',
    code: 'BSC_MATH',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 3.0,
    creditHours: 90,
    description: 'Bachelor of Science in Mathematics - Pure and applied mathematics with strong analytical foundation.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, and two science subjects. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'MATH'
  },
  {
    name: 'Statistics',
    code: 'BSC_STAT',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 3.0,
    creditHours: 90,
    description: 'Bachelor of Science in Statistics - Statistical methods, data analysis, and statistical computing.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, and two science subjects. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'MATH'
  },

  // Physics Programs
  {
    name: 'Physics',
    code: 'BSC_PHYS',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 3.0,
    creditHours: 96,
    description: 'Bachelor of Science in Physics - Theoretical and experimental physics with applications.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Physics, Chemistry, and any other science subject. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'PHYS'
  },

  // Chemistry Programs
  {
    name: 'Industrial Chemistry',
    code: 'BSC_ICHEM',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 120,
    description: 'Bachelor of Science in Industrial Chemistry - Chemistry with industrial applications and chemical processes.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, Chemistry, Physics, and any other science subject. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'CHEM'
  },

  // Business Administration Programs
  {
    name: 'Business Administration',
    code: 'BBA',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 120,
    description: 'Bachelor of Business Administration - Comprehensive business education covering management, marketing, and operations.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, and three other subjects including Social Studies. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'BUS_ADMIN'
  },
  {
    name: 'Business Administration',
    code: 'MBA',
    type: 'MASTERS',
    level: 'POSTGRADUATE',
    durationYears: 2.0,
    creditHours: 60,
    description: 'Master of Business Administration - Advanced business leadership and management program.',
    admissionRequirements: 'Bachelor\'s degree in any field with minimum Second Class Lower division and 2 years work experience.',
    isActive: true,
    departmentCode: 'BUS_ADMIN'
  },

  // Economics Programs
  {
    name: 'Economics',
    code: 'BSC_ECON',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 3.0,
    creditHours: 90,
    description: 'Bachelor of Science in Economics - Economic theory, policy analysis, and quantitative methods.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, and three other subjects including Social Studies. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'ECON'
  },

  // Architecture Programs
  {
    name: 'Architecture',
    code: 'BARCH',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 5.0,
    creditHours: 150,
    description: 'Bachelor of Architecture - Professional architectural education covering design, construction, and planning.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, and three other subjects. Portfolio submission required. Minimum aggregate of 20.',
    isActive: true,
    departmentCode: 'ARCH'
  },

  // Industrial Design Programs
  {
    name: 'Industrial Design',
    code: 'BFA_ID',
    type: 'BACHELOR',
    level: 'UNDERGRADUATE',
    durationYears: 4.0,
    creditHours: 120,
    description: 'Bachelor of Fine Arts in Industrial Design - Product design, design thinking, and creative problem solving.',
    admissionRequirements: 'WASSCE with credits in Mathematics, English, and three other subjects. Portfolio submission required. Minimum aggregate of 24.',
    isActive: true,
    departmentCode: 'DESIGN'
  }
];

export default programsData;
