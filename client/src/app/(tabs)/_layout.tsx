import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Home, User, Settings } from "@tamagui/lucide-icons";
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "src/stores/auth";
import { useTheme } from "tamagui";

export default function TabLayout() {
  const theme = useTheme();
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.color.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        // tabBarActiveTintColor: theme.color10.val,
        // tabBarInactiveBackgroundColor: theme.background.val,
        // tabBarInactiveTintColor: theme.color6.val,
        // tabBarActiveBackgroundColor: theme.background.val,
      }}
    >
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <Home color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="lobbies"
        options={{
          title: "Лобби",
          tabBarIcon: ({ color }) => <User color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="create_game"
        options={{
          title: "Создать игру",
          tabBarIcon: ({ color }) => <Settings color={color as any} />,
        }}
      />
    </Tabs>
  );
}
