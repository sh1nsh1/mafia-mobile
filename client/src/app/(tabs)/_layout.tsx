import { Tabs, useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { PARAGRAPH_FONT } from "@/utils/theme";
import { useThemeStore } from "@/stores/theme-store";
import { useEffect } from "react";

export default function TabLayout() {
  const colors = useThemeStore(theme => theme.colors);
  const router = useRouter();

  useEffect(() => {
    if (!useAuthStore.getState().isLoggedIn) {
      router.replace("/login");
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarStyle: {
          backgroundColor: colors.backgroundPrimary,
          borderTopColor: colors.borderPrimary,
        },
        tabBarLabelStyle: {
          fontSize: 18,
          fontFamily: PARAGRAPH_FONT,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
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
        name="settings"
        options={{
          title: "Настройки",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
