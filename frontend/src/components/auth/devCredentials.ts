export interface DevCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export const DEV_CREDENTIALS: { role: string; users: DevCredential[] }[] = [
  {
    role: 'Administrator',
    users: [
      {
        id: 'admin',
        name: 'John Administrator',
        email: 'admin@git.edu.gh',
        password: 'Password123!',
        role: 'Administrator'
      }
    ]
  },
  {
    role: 'Faculty Admins (Deans)',
    users: [
      {
        id: 'dean-engineering',
        name: 'Prof Mary Engineering-Dean',
        email: 'dean.engineering@git.edu.gh',
        password: 'Password123!',
        role: 'Faculty Admin'
      },
      {
        id: 'dean-science',
        name: 'Prof Robert Science-Dean',
        email: 'dean.science@git.edu.gh',
        password: 'Password123!',
        role: 'Faculty Admin'
      }
    ]
  },
  {
    role: 'Heads of Department',
    users: [
      {
        id: 'hod-cse',
        name: 'Dr Sarah CS-Head',
        email: 'hod.cse@git.edu.gh',
        password: 'Password123!',
        role: 'HOD'
      },
      {
        id: 'hod-math',
        name: 'Dr David Math-Head',
        email: 'hod.math@git.edu.gh',
        password: 'Password123!',
        role: 'HOD'
      }
    ]
  },
  {
    role: 'Exams Officers',
    users: [
      {
        id: 'exams-engineering',
        name: 'Mrs Grace Exams-Officer',
        email: 'exams.engineering@git.edu.gh',
        password: 'Password123!',
        role: 'Exams Officer'
      },
      {
        id: 'exams-science',
        name: 'Mr Michael Exams-Officer',
        email: 'exams.science@git.edu.gh',
        password: 'Password123!',
        role: 'Exams Officer'
      }
    ]
  },
  {
    role: 'Lecturers',
    users: [
      {
        id: 'james-lecturer',
        name: 'Dr James Mensah (CSE)',
        email: 'james.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'jennifer-lecturer',
        name: 'Dr Jennifer Asante (CSE)',
        email: 'jennifer.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'peter-lecturer',
        name: 'Dr Peter Osei (CSE)',
        email: 'peter.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'elizabeth-lecturer',
        name: 'Dr Elizabeth Opoku (Math)',
        email: 'elizabeth.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'samuel-lecturer',
        name: 'Dr Samuel Adjei (Math)',
        email: 'samuel.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'rachel-lecturer',
        name: 'Dr Rachel Boateng (Physics)',
        email: 'rachel.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      },
      {
        id: 'frank-lecturer',
        name: 'Dr Frank Amponsah (EEE)',
        email: 'frank.lecturer@git.edu.gh',
        password: 'Password123!',
        role: 'Lecturer'
      }
    ]
  },
  {
    role: 'Students',
    users: [
      {
        id: 'alice-student',
        name: 'Alice Owusu (CS - Level 200)',
        email: 'alice.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'bob-student',
        name: 'Bob Agyeman (CS - Level 200)',
        email: 'bob.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'clara-student',
        name: 'Clara Asiedu (SE - Level 100)',
        email: 'clara.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'daniel-student',
        name: 'Daniel Nkrumah (CS - Level 200)',
        email: 'daniel.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'emma-student',
        name: 'Emma Ofosu (SE - Level 100)',
        email: 'emma.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'frank-student',
        name: 'Frank Boakye (Math - Level 200)',
        email: 'frank.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'grace-student',
        name: 'Grace Appiah (Math - Level 200)',
        email: 'grace.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'henry-student',
        name: 'Henry Mensah (Math - Level 100)',
        email: 'henry.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'irene-student',
        name: 'Irene Agyei (Physics - Level 200)',
        email: 'irene.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      },
      {
        id: 'john-student',
        name: 'John Opoku (Physics - Level 100)',
        email: 'john.student@st.git.edu.gh',
        password: 'Password123!',
        role: 'Student'
      }
    ]
  }
];

export default DEV_CREDENTIALS;
