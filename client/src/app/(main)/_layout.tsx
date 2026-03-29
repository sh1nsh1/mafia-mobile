import { View, Button, Text } from "@/components/ui";
import { UserProvider } from "@/providers/auth-provider";
import { Slot } from "expo-router";
import { type ErrorBoundaryProps } from "expo-router";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>{error.message}</Text>
      <Button onPress={retry}>Try Again?</Button>
    </View>
  );
}

export default function MainLayout() {
  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}
