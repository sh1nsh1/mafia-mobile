import { View, Row } from "@/components/ui";
import { Slot } from "expo-router";
import { ThemeToggler } from "@/components/ui/ThemeToggler";

export default function AuthPage() {
  return (
    <>
      <Row
        style={{
          padding: 12,
        }}
        justify="flex-end"
      >
        <ThemeToggler />
      </Row>

      <View flex={1} gap={18} justify="center" items="center">
        <Slot />
      </View>
    </>
  );
}
