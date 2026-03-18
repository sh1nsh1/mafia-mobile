import Separator from "@/components/ui/Separator";
import View from "@/components/ui/View";
import { Slot } from "expo-router";
import Text from "@/components/ui/Text";
import Row from "@/components/ui/Row";
import { ThemeToggler } from "@/components/ui/ThemeToggler";

export default function AuthPage() {
  return (
    <>
      <Row
        flex={1}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 20,
        }}
      >
        <Text size={72} header style={{ flex: 1 }}>
          Мафия
        </Text>
        <ThemeToggler />
      </Row>
      <Separator />
      <View
        flex={14}
        gap={18}
        justify="center"
        items="center"
        style={{ marginBottom: 80 }}
      >
        <Slot />
      </View>
    </>
  );
}
