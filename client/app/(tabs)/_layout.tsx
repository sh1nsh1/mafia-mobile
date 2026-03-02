import { Home, User, Settings } from "@tamagui/lucide-icons";
import { Tabs } from "expo-router";
import { useTheme } from "tamagui";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.red10.val,
      }}
    >
      <Tabs.Screen
        name="main"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => <Home color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <User color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Настройки",
          tabBarIcon: ({ color }) => <Settings color={color as any} />,
        }}
      />
    </Tabs>
  );
}
