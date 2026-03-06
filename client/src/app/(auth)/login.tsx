import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuthStore } from "stores/auth";
import {
  Button,
  Input,
  XStack,
  YStack,
  View,
  H2,
  Text,
  styled,
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
  const toast = useToastController();
  const [disabled, setDisabled] = useState(false);

  async function login({ name, password }: LoginSchema) {
    try {
      await authStore.login(name, password);
      router.push("/main");
    } catch (e) {
      if (e instanceof Error) {
        setDisabled(true);
        const message = e.message;
        toast.show("Ошибка", { message, duration: 2000 });

        setTimeout(() => setDisabled(false), 400);
      }
    }
  }

  return (
    <View flex={1} gap="$6" justify="center" items="center">
      <YStack gap="$2" items="center">
        <H2>Заходи давай</H2>

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
        <YStack gap="$2">
          <YStack gap="$1">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
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

        <Button
          onClick={handleSubmit(login)}
          mt="$4"
          size="$4"
          theme="dark"
          disabled={disabled}
        >
          Зайти
        </Button>
      </View>
    </View>
  );
}

export const ErrorText = styled(Text, {
  color: "red",
  fontWeight: 500,
  fontSize: 12,
});
