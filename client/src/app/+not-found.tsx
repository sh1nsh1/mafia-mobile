import { router } from "expo-router";
import { Image } from "react-native";
import { H1, YStack, Text, View } from "tamagui";

export default function NotFoundScreen() {
  return (
    <View flex={1} justify="center" items="center" gap="$10">
      <H1>Тут никого нету</H1>

      <Image source={require("assets/images/cat_with_lamp.jpg")} />

      <Text
        fontSize={20}
        fontWeight="600"
        cursor="pointer"
        onPress={() => router.push("/")}
        hoverStyle={{ color: "$blue11" }}
      >
        Обратно на главную
      </Text>
    </View>
  );
}
