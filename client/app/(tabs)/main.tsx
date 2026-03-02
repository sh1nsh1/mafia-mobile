import { ToastControl } from "components/CurrentToast";
import { Button, H2, YStack } from "tamagui";

export default function MainScreen() {
  return (
    <YStack flex={1} items="center" gap="$8" px="$10" pt="$5" bg="$background">
      <H2>Игра будет тут</H2>

      <Button>Играть</Button>

      <ToastControl />
    </YStack>
  );
}
