import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const RegisterScreen: React.FC = () => {
  const theme = useTheme();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
          Register Screen
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginVertical: 16 }}>
          Registration functionality coming soon...
        </Text>
        <Button mode="outlined" onPress={handleLogin}>
          Back to Login
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default RegisterScreen;
