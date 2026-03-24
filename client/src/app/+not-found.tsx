import { View } from "@/components/ui";
import { router } from "expo-router";
import { Image, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <View justify="center" items="center" gap={30}>
      <Text>Тут никого нету</Text>

      <Image source={require("@/assets/images/cat_with_lamp.jpg")} />

      <Text style={{ fontSize: 20 }} onPress={() => router.push("/")}>
        Обратно на главную
      </Text>
    </View>
  );
}
