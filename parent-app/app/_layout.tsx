import { Slot } from 'expo-router';
import { AuthProvider } from '../components/AuthProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
