import React from "react";
import { Button, Toast, YStack } from "tamagui";

export default function CreateGameScreen() {
  const [savedCount, setSavedCount] = React.useState(0);

  return (
    <YStack items="center">
      <Button
        onPress={() => {
          setSavedCount(old => old + 1);
        }}
      >
        Show toast
      </Button>
      {[...Array(savedCount)].map((_, index) => (
        <Toast
          key={index}
          enterStyle={{ x: -20, opacity: 0 }}
          exitStyle={{ x: -20, opacity: 0 }}
          opacity={1}
          x={0}
        >
          <Toast.Title>Subscribed!</Toast.Title>
          <Toast.Description>We'll be in touch.</Toast.Description>
        </Toast>
      ))}
    </YStack>
  );
}
