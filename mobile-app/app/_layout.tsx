import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '../hooks/use-color-scheme';
import { store, persistor } from '../stores/store';
import { AuthGuard } from '../components/AuthGuard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AuthGuard>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="session-details" options={{ title: 'Session Details' }} />
                  <Stack.Screen name="student-list" options={{ title: 'Student List' }} />
                  <Stack.Screen name="bulk-submission" options={{ title: 'Bulk Submission' }} />
                  <Stack.Screen name="batch-details" options={{ title: 'Batch Details' }} />
                  <Stack.Screen name="batch-history" options={{ title: 'Batch History' }} />
                  <Stack.Screen name="transfer-batch" options={{ title: 'Transfer Batch' }} />
                </Stack>
              </AuthGuard>
              <StatusBar style="auto" />
            </ThemeProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
