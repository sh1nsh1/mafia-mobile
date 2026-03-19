import View from "@/components/ui/View";
import { Slot } from "expo-router";
import Row from "@/components/ui/Row";
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
