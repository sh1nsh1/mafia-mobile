import { Column, Text } from "@components/ui";

export default function CreateGameScreen() {
  return (
    <Column
      gap={18}
      items="center"
      justify="center"
      style={{ padding: 12, flex: 1 }}
    >
      <Text size={64} style={{ letterSpacing: 3 }} header>
        Настройки
      </Text>
    </Column>
  );
}
