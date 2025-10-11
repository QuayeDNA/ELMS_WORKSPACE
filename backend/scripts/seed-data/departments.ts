// Department seed data organized by faculty
export const departmentsData = [
  // Faculty of Engineering Departments
  {
    name: 'Computer Science and Engineering',
    code: 'CSE',
    type: 'department',
    description: 'Department of Computer Science and Software Engineering, offering programs in software development, artificial intelligence, and computer systems.',
    officeLocation: 'Engineering Block A, 2nd Floor',
    contactInfo: JSON.stringify({
      email: 'cse@git.edu.gh',
      phone: '+233-30-555-0201',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'ENG'
  },
  {
    name: 'Electrical and Electronics Engineering',
    code: 'EEE',
    type: 'department',
    description: 'Department of Electrical and Electronics Engineering, specializing in power systems, telecommunications, and electronics.',
    officeLocation: 'Engineering Block B, 1st Floor',
    contactInfo: JSON.stringify({
      email: 'eee@git.edu.gh',
      phone: '+233-30-555-0202',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'ENG'
  },
  {
    name: 'Civil and Environmental Engineering',
    code: 'CEE',
    type: 'department',
    description: 'Department of Civil and Environmental Engineering, covering structural, geotechnical, and environmental engineering.',
    officeLocation: 'Engineering Block C, Ground Floor',
    contactInfo: JSON.stringify({
      email: 'cee@git.edu.gh',
      phone: '+233-30-555-0203',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'ENG'
  },
  {
    name: 'Mechanical Engineering',
    code: 'MECH',
    type: 'department',
    description: 'Department of Mechanical Engineering, focusing on thermal systems, manufacturing, and automotive engineering.',
    officeLocation: 'Engineering Block D, 1st Floor',
    contactInfo: JSON.stringify({
      email: 'mech@git.edu.gh',
      phone: '+233-30-555-0204',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'ENG'
  },

  // Faculty of Science Departments
  {
    name: 'Mathematics and Statistics',
    code: 'MATH',
    type: 'department',
    description: 'Department of Mathematics and Statistics, offering pure and applied mathematics, statistics, and computational mathematics.',
    officeLocation: 'Science Block A, 3rd Floor',
    contactInfo: JSON.stringify({
      email: 'math@git.edu.gh',
      phone: '+233-30-555-0301',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'SCI'
  },
  {
    name: 'Physics and Applied Physics',
    code: 'PHYS',
    type: 'department',
    description: 'Department of Physics and Applied Physics, covering theoretical physics, electronics, and materials science.',
    officeLocation: 'Science Block B, 2nd Floor',
    contactInfo: JSON.stringify({
      email: 'physics@git.edu.gh',
      phone: '+233-30-555-0302',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'SCI'
  },
  {
    name: 'Chemistry and Chemical Engineering',
    code: 'CHEM',
    type: 'department',
    description: 'Department of Chemistry and Chemical Engineering, specializing in industrial chemistry and chemical processes.',
    officeLocation: 'Science Block C, 1st Floor',
    contactInfo: JSON.stringify({
      email: 'chemistry@git.edu.gh',
      phone: '+233-30-555-0303',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'SCI'
  },

  // Faculty of Business and Management Departments
  {
    name: 'Business Administration',
    code: 'BUS_ADMIN',
    type: 'department',
    description: 'Department of Business Administration, offering programs in management, marketing, and business strategy.',
    officeLocation: 'Business Block A, 2nd Floor',
    contactInfo: JSON.stringify({
      email: 'business@git.edu.gh',
      phone: '+233-30-555-0401',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'BUS'
  },
  {
    name: 'Economics and Finance',
    code: 'ECON',
    type: 'department',
    description: 'Department of Economics and Finance, covering microeconomics, macroeconomics, and financial management.',
    officeLocation: 'Business Block B, 1st Floor',
    contactInfo: JSON.stringify({
      email: 'economics@git.edu.gh',
      phone: '+233-30-555-0402',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'BUS'
  },

  // Faculty of Applied Arts Departments
  {
    name: 'Architecture and Planning',
    code: 'ARCH',
    type: 'department',
    description: 'Department of Architecture and Urban Planning, covering architectural design and city planning.',
    officeLocation: 'Arts Block A, Ground Floor',
    contactInfo: JSON.stringify({
      email: 'architecture@git.edu.gh',
      phone: '+233-30-555-0501',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'ART'
  },
  {
    name: 'Industrial Design',
    code: 'DESIGN',
    type: 'department',
    description: 'Department of Industrial Design, focusing on product design, graphic design, and design thinking.',
    officeLocation: 'Arts Block B, 1st Floor',
    contactInfo: JSON.stringify({
      email: 'design@git.edu.gh',
      phone: '+233-30-555-0502',
      officeHours: 'Mon-Fri 8:00-17:00'
    }),
    facultyCode: 'ART'
  }
];

export default departmentsData;
