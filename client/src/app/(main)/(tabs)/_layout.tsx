import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PARAGRAPH_FONT } from "@/utils/theme";
import { useTheme } from "@/hooks/useTheme";
import { Platform } from "react-native";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarStyle: {
          backgroundColor: colors.backgroundPrimary,
          borderTopColor: colors.borderPrimary,
          ...(Platform.OS !== "web" && { height: 80 }),
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontFamily: PARAGRAPH_FONT,
          fontWeight: "500",
        },
        animation: "shift",
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
