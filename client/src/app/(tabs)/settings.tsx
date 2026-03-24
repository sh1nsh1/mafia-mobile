import { useState } from "react";
import Column from "@components/ui/Column";
import Text from "@/components/ui/Text";

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
