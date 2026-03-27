import { Button, Column, Row, Text, ThemeToggler } from "@components/ui";
import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export default function SettingsScreen() {
  const { width } = useWindowDimensions();

  const columnWidth = useMemo(() => {
    if (width < 768) return "90%";
    if (width >= 768 && width < 1200) return "75%";
    if (width >= 1200 && width < 1600) return "60%";
    return "45%";
  }, [width]);

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
      <Column
        gap={12}
        justify="center"
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 16,
          alignSelf: "center",
          width: columnWidth,
        }}
      >
        <Row items="center">
          <Text style={{ flex: 1 }}>Тема</Text>
          <ThemeToggler />
        </Row>
        <Row items="center">
          <Text style={{ flex: 1 }}>Что-то еще</Text>
          <Button>да</Button>
        </Row>
      </Column>
    </Column>
  );
}
