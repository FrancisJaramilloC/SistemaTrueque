import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { AccessibilityProvider } from '../src/context/AccessibilityContext';
import AccessibilityPanel from '../src/components/AccessibilityPanel';

export default function RootLayout() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        {/* Panel de accesibilidad flotante disponible en toda la app */}
        <AccessibilityPanel />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
