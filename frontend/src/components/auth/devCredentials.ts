export interface DevCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  staffId?: string;
  department?: string;
  program?: string;
  level?: number;
}

export const DEV_CREDENTIALS: { role: string; users: DevCredential[] }[] = [
  {
    role: 'Administrator',
    users: [
      {
        id: 'admin',
        name: 'David Mensah',
        email: 'admin@tughana.edu.gh',
        password: 'Password123!',
        role: 'Admin',
        staffId: 'TU-ADM-001'
      }
    ]
  },
  {
    role: 'Exams Officers',
    users: [
      {
        id: 'exam-001',
        name: 'Exams Officer',
        email: 'exams.officer@tughana.edu.gh',
        password: 'password123',
        role: 'Exams Officer',
        staffId: 'TU-EXAM-001'
      }
    ]
  },
  {
    role: 'Lecturers',
    users: [
      {
        id: 'lec-001',
        name: 'Dr Kwame Asante',
        email: 'k.asante@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-001',
        department: 'Computer Engineering'
      },
      {
        id: 'lec-002',
        name: 'Dr Akua Owusu',
        email: 'a.owusu@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-002',
        department: 'Electrical Engineering'
      },
      {
        id: 'lec-003',
        name: 'Dr Kofi Mensah',
        email: 'k.mensah@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-003',
        department: 'Mechanical Engineering'
      },
      {
        id: 'lec-004',
        name: 'Dr Ama Boateng',
        email: 'a.boateng@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-004',
        department: 'Computer Science'
      },
      {
        id: 'lec-005',
        name: 'Dr Yaw Agyeman',
        email: 'y.agyeman@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-005',
        department: 'Information Technology'
      },
      {
        id: 'lec-006',
        name: 'Dr Efua Anane',
        email: 'e.anane@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-006',
        department: 'Mathematics'
      },
      {
        id: 'lec-007',
        name: 'Dr Kwesi Darko',
        email: 'k.darko@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-007',
        department: 'Business Administration'
      },
      {
        id: 'lec-008',
        name: 'Dr Abena Frimpong',
        email: 'a.frimpong@tughana.edu.gh',
        password: 'Password123!',
        role: 'Lecturer',
        staffId: 'TU-LEC-008',
        department: 'Accounting'
      }
    ]
  },
  {
    role: 'Students',
    users: [
      {
        id: 'stu-001',
        name: 'Kwabena Osei',
        email: 'kwabena.osei@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Computer Engineering',
        level: 100
      },
      {
        id: 'stu-002',
        name: 'Akosua Adjei',
        email: 'akosua.adjei@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Computer Engineering',
        level: 100
      },
      {
        id: 'stu-003',
        name: 'Yaw Mensah',
        email: 'yaw.mensah@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Computer Engineering',
        level: 200
      },
      {
        id: 'stu-004',
        name: 'Esi Agyemang',
        email: 'esi.agyemang@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Computer Science',
        level: 100
      },
      {
        id: 'stu-005',
        name: 'Kojo Boakye',
        email: 'kojo.boakye@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Computer Science',
        level: 100
      },
      {
        id: 'stu-006',
        name: 'Afia Appiah',
        email: 'afia.appiah@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Computer Science',
        level: 200
      },
      {
        id: 'stu-007',
        name: 'Kofi Antwi',
        email: 'kofi.antwi@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Information Technology',
        level: 100
      },
      {
        id: 'stu-008',
        name: 'Adwoa Nyarko',
        email: 'adwoa.nyarko@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Information Technology',
        level: 100
      },
      {
        id: 'stu-009',
        name: 'Kwame Owusu',
        email: 'kwame.owusu@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Information Technology',
        level: 200
      },
      {
        id: 'stu-010',
        name: 'Ama Serwaa',
        email: 'ama.serwaa@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Business Administration',
        level: 100
      },
      {
        id: 'stu-011',
        name: 'Kwesi Tawiah',
        email: 'kwesi.tawiah@student.tughana.edu.gh',
        password: 'Password123!',
        role: 'Student',
        program: 'Business Administration',
        level: 100
      }
    ]
  }
];

export default DEV_CREDENTIALS;
