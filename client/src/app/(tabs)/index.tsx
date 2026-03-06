import { Button, H2, YStack } from "tamagui";

export default function MainScreen() {
  return (
    <YStack flex={1} items="center" gap="$8" px="$10" pt="$5" bg="$background">
      <H2>Мафия</H2>

      <Button>Играть</Button>
    </YStack>
  );
}
