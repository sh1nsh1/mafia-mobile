import { tokensAtom } from "@/atoms/jwt-tokens";
import { userAtom } from "@/atoms/user";
import { Avatar, Button, Column, Row, Separator, Text } from "@/components/ui";
import { useAtomValue, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { StyleSheet } from "react-native";
import { api } from "@/utils/api";

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
      const image = result.assets[0];
      const formData = new FormData();
      formData.append("avatar", {
        uri: image.uri,
        name: image.fileName ?? "image.jpg",
        type: image.mimeType ?? "image/jpeg",
      } as any);

      try {
        const response = await api.post("/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Успех:", response.data);
      } catch (error) {
        console.error("Ошибка:", error);
      }
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
    } else {
      alert("You did not select any image.");
    }
  };

  return (
    <>
      <Row gap={18} style={styles.row} items="center">
        <Avatar size={128} src={selectedImage} />
        <Text size={24} weight={600}>
          {user?.name}
        </Text>
      </Row>
      <Separator />
      <Column flex={1} justify="center" items="center" gap={24}>
        <Button onPress={pickImageAsync}>Сменить аватар</Button>
        <Button onPress={() => setTokens(RESET)}>Выйти</Button>
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
