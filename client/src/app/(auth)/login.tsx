import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ErrorText } from "src/components/styled/ErrorText";
import { useAuthStore } from "src/stores/auth";
import {
  Button,
  Input,
  XStack,
  YStack,
  View,
  H2,
  Text,
  useToastController,
} from "tamagui";
import * as z from "zod";

const loginSchema = z.object({
  name: z
    .string("Имя сюда напиши")
    .min(2, "Имя должно быть минимум 2 символа")
    .max(24, "Имя слишком длинное"),
  password: z
    .string("Пароль сюда напиши")
    .min(8, "Пароль минимум 8 символов")
    .regex(
      /^(?=.*[a-zа-яё])(?=.*[A-ZА-ЯЁ])(?=.*\d)/,
      "Пароль должен содержать буквы разного регистра и цифры",
    )
    .max(128, "Слишком длинный пароль"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const resolver = zodResolver(loginSchema);
  const form = useForm({ resolver });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const authStore = useAuthStore();
  const router = useRouter();
  const toast = useToastController();
  const [disabled, setDisabled] = useState(false);

  function showToast(message: string) {
    toast.hide();
    setTimeout(
      () =>
        toast.show("Error", {
          message,
        }),
      150,
    );
  }

  async function login({ name, password }: LoginSchema) {
    setDisabled(true);
    try {
      await authStore.logIn(name, password, true);
    } catch (e) {
      if (e instanceof Error) {
        showToast(e.message);
      }
    } finally {
      setDisabled(false);
    }
  }

  return (
    <>
      <YStack gap="$2" items="center">
        <H2 text="center">Заходи давай</H2>

        <XStack items="center">
          <Text color="$color9">Еще не мафиозник? </Text>
          <Text
            color="$red10"
            fontWeight="600"
            cursor="pointer"
            onPress={() => router.push("/register")}
            hoverStyle={{ color: "$red11" }}
          >
            Присоединяйся!
          </Text>
        </XStack>
      </YStack>

      <View
        gap="$2"
        borderWidth={1}
        justify="center"
        items="center"
        rounded="$4"
        bg="$color2"
        borderColor="$borderColor"
        p="$4"
      >
        <YStack gap="$2" width="100%">
          <YStack gap="$1">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  $max-xs={{ minW: "80%" }}
                  placeholder="Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="name"
            />
            <ErrorText>{errors.name?.message}</ErrorText>
          </YStack>

          <YStack gap="$1">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  $max-xs={{ minW: "80%" }}
                  placeholder="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  type="password"
                  secureTextEntry
                />
              )}
              name="password"
            />
            <ErrorText>{errors.password?.message}</ErrorText>
          </YStack>
        </YStack>

        <Button onPress={handleSubmit(login)} mt="$4" size="$4" disabled={disabled}>
          Зайти
        </Button>
      </View>
    </>
  );
}
