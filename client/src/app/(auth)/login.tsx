import "@tamagui/native/setup-zeego";
import "@tamagui/native/setup-teleport";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ErrorText } from "src/components/styled/ErrorText";
import { useAuthStore } from "src/stores/auth";
import { XStack, YStack } from "tamagui";
import { Text, View } from "react-native";
import * as z from "zod";
import { useDebouncedToast } from "src/hooks/useDebouncedToast";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";

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
  const showToast = useDebouncedToast();
  const [disabled, setDisabled] = useState(false);

  async function login({ name, password }: LoginSchema) {
    setDisabled(true);
    try {
      await authStore.logIn(name, password, true);
    } catch (e) {
      if (e instanceof Error) {
        showToast("Что-то пошло не так", e.message);
      }
    } finally {
      setDisabled(false);
    }
  }

  useEffect(() => {
    if (authStore.isLoggedIn) {
      router.replace("/logout");
    }
  }, [authStore.isLoggedIn]);

  if (authStore.isLoggedIn) {
    <Redirect href="/logout" />;
  }

  return (
    <>
      <YStack gap="$2" items="center">
        <Text style={{ fontFamily: "NozhikBold", fontSize: 64, color: "white" }}>
          Заходи давай
        </Text>

        <XStack items="center">
          <Text
            style={{ fontFamily: "IosevkaCharon", fontSize: 18, color: "white" }}
          >
            Еще не мафиозник?{" "}
          </Text>

          <Link
            href="/register"
            style={{
              fontFamily: "IosevkaCharon",
              fontSize: 18,
              color: "darkred",
              fontWeight: 600,
            }}
          >
            Присоединяйся!
          </Link>
        </XStack>
      </YStack>

      <View
        style={{
          gap: 18,
          borderWidth: 1,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 4,
          padding: 12,
        }}
      >
        <YStack gap="$2" width="100%">
          <YStack gap="$1">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
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
                  placeholder="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  secureTextEntry
                />
              )}
              name="password"
            />
            <ErrorText>{errors.password?.message}</ErrorText>
          </YStack>
        </YStack>

        <Button onPress={handleSubmit(login)} disabled={disabled}>
          Зайти
        </Button>
      </View>
    </>
  );
}
