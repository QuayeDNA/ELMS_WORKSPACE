import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FAB } from './FAB';
import { Typography } from './Typography';

interface DevCredential {
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

interface DevCredentialsFABProps {
  onSelectCredential: (email: string, password: string) => void;
}

// Development credentials grouped by role
const DEV_CREDENTIALS = [
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
    role: 'Students (Blocked)',
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
      }
    ]
  }
];

export const DevCredentialsFAB: React.FC<DevCredentialsFABProps> = ({ onSelectCredential }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleSelectCredential = (credential: DevCredential) => {
    onSelectCredential(credential.email, credential.password);
    setIsModalVisible(false);
  };

  return (
    <>
      <FAB
        icon="person"
        onPress={() => setIsModalVisible(true)}
        variant="secondary"
        className="absolute bottom-6 right-6"
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center p-6"
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-lg max-h-4/5 w-full max-w-sm"
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside
          >
            <View className="p-4 border-b border-gray-200">
              <Typography variant="titleMedium" className="text-center">
                Development Credentials
              </Typography>
              <Typography variant="bodySmall" color="secondary" className="text-center mt-1">
                Select a user to auto-fill login
              </Typography>
            </View>

            <ScrollView className="max-h-96">
              {DEV_CREDENTIALS.map((group, groupIndex) => (
                <View key={groupIndex}>
                  <View className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                    <Typography variant="labelMedium" className="text-orange-900 font-semibold">
                      {group.role}
                    </Typography>
                  </View>

                  {group.users.map((credential) => (
                    <TouchableOpacity
                      key={credential.id}
                      className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                      onPress={() => handleSelectCredential(credential)}
                    >
                      <Typography variant="bodyMedium" className="font-medium">
                        {credential.name}
                      </Typography>
                      <Typography variant="bodySmall" color="secondary">
                        {credential.email} • {credential.role}
                      </Typography>
                      {(credential as any).staffId && (
                        <Typography variant="bodySmall" color="secondary">
                          {(credential as any).staffId}
                          {(credential as any).department && ` • ${(credential as any).department}`}
                        </Typography>
                      )}
                      {(credential as any).program && (
                        <Typography variant="bodySmall" color="secondary">
                          {(credential as any).program}
                          {(credential as any).level ? ` • Level ${(credential as any).level}` : ''}
                        </Typography>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>

            <View className="p-4 border-t border-gray-200">
              <TouchableOpacity
                className="bg-gray-100 py-2 px-4 rounded-md"
                onPress={() => setIsModalVisible(false)}
              >
                <Typography variant="labelMedium" className="text-center text-gray-700">
                  Close
                </Typography>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
