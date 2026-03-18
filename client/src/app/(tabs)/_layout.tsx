import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/stores/auth";
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
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color as any} />,
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
        name="create"
        options={{
          title: "Создать игру",
          tabBarIcon: ({ color }) => <Settings color={color as any} />,
        }}
      />
    </Tabs>
  );
}
