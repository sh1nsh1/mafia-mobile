import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { pallete } from "@utils/palette";

export default function TabLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: pallete.red,
        tabBarStyle: {
          backgroundColor: pallete.black,
          borderTopColor: pallete.darkred,
        },
        tabBarLabelStyle: {
          fontSize: 18,
          fontFamily: "IosevkaCharon", // или твой кастомный шрифт
          fontWeight: "600",
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lobbies"
        options={{
          title: "Лобби",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Создать игру",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
