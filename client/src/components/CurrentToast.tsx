import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { Toast, useToastState } from "@tamagui/toast";
import { Button, YStack } from "tamagui";

export function CurrentToast() {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) return null;

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.6 }}
      exitStyle={{ opacity: 0, scale: 1 }}
      rounded="$6"
      transition="quick"
      boxShadow="0px 2px 4px rgba(0,0,0,0.12), 0px 8px 24px rgba(0,0,0,0.08)"
    >
      <YStack items="center" p="$2" gap="$2">
        <Toast.Title fontWeight="bold">{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description>{currentToast.message}</Toast.Description>
        )}
        <Toast.Action asChild altText="Dismiss toast">
          <Button size="$2">Dismiss</Button>
        </Toast.Action>
      </YStack>
    </Toast>
  );
}
