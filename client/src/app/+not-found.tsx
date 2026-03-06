import { router } from "expo-router";
import { Image } from "react-native";
import { H1, YStack, Text } from "tamagui";

export default function NotFoundScreen() {
  return (
    <YStack justify="center" items="center" gap="$10" height="100%">
      <H1>Тут никого нету</H1>

      <Image source={require("@assets/images/cat_with_lamp.jpg")} />

      <Text
        color="$blue10"
        fontSize={20}
        fontWeight="600"
        cursor="pointer"
        onPress={() => router.push("/")}
        hoverStyle={{ color: "$blue11" }}
      >
        Обратно на главную
      </Text>
    </YStack>
  );
}
