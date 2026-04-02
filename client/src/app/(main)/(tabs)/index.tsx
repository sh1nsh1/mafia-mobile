import { tokensAtom } from "@/atoms/jwt-tokens";
import { userAtom } from "@/atoms/user";
import { Avatar, Button, Column, Row, Separator, Text } from "@/components/ui";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { StyleSheet } from "react-native";

export default function MainScreen() {
  const user = useAtomValue(userAtom);
  const setTokens = useSetAtom(tokensAtom);

  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  return (
    <>
      <Row gap={18} style={styles.row} items="center">
        <Avatar size={128} src={selectedImage as any} />
        <Column flex={1}>
          <Text size={24} weight={600}>
            {user?.name}
          </Text>
          <Text size={24}>Description</Text>
          <Text size={24}>Country: Russia</Text>
        </Column>
      </Row>
      <Separator />
      <Column flex={1} justify="center" items="center" gap={24}>
        <Button onPress={() => setTokens(RESET)}>Выйти</Button>
        <Button onPress={pickImageAsync}>Сменить аватар</Button>
      </Column>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
