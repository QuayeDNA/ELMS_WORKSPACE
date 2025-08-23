import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading ELMS...' 
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={styles.spinner}
      />
      <Text 
        variant="bodyLarge" 
        style={[styles.message, { color: theme.colors.onBackground }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
  },
});

export default LoadingScreen;
