import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FAB } from './FAB';
import { Typography } from './Typography';

interface DevCredential {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface DevCredentialsFABProps {
  onSelectCredential: (username: string, password: string) => void;
}

// Development credentials grouped by role
const DEV_CREDENTIALS = [
  {
    role: 'Handler Accounts',
    users: [
      { id: 1, username: 'johndoe', email: 'john.doe@university.edu', firstName: 'John', lastName: 'Doe', role: 'INVIGILATOR' },
      { id: 2, username: 'janesmith', email: 'jane.smith@university.edu', firstName: 'Jane', lastName: 'Smith', role: 'LECTURER' },
      { id: 3, username: 'bobhod', email: 'bob.hod@university.edu', firstName: 'Bob', lastName: 'Wilson', role: 'HOD' },
      { id: 4, username: 'aliceadmin', email: 'alice.admin@university.edu', firstName: 'Alice', lastName: 'Johnson', role: 'ADMIN' },
      { id: 5, username: 'charlieofficer', email: 'charlie.officer@university.edu', firstName: 'Charlie', lastName: 'Brown', role: 'EXAMS_OFFICER' },
      { id: 6, username: 'superadmin', email: 'super.admin@university.edu', firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN' },
    ],
  },
  {
    role: 'Blocked Account',
    users: [
      { id: 7, username: 'student1', email: 'student1@university.edu', firstName: 'Student', lastName: 'One', role: 'STUDENT' },
    ],
  },
];

export const DevCredentialsFAB: React.FC<DevCredentialsFABProps> = ({ onSelectCredential }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleSelectCredential = (credential: DevCredential) => {
    onSelectCredential(credential.username, 'password');
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
                        {credential.firstName} {credential.lastName}
                      </Typography>
                      <Typography variant="bodySmall" color="secondary">
                        {credential.username} • {credential.role.toLowerCase().replace('_', ' ')}
                      </Typography>
                      <Typography variant="bodySmall" color="secondary">
                        {credential.email}
                      </Typography>
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
