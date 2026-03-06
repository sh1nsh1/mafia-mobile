import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
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
import { ErrorText } from "./login";
import { useAuthStore } from "src/stores/auth";
import { useState } from "react";

const registerSchema = z
  .object({
    email: z.email("Тут должна быть почта"),
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
    passwordRepeat: z.string("Повтори пароль"),
  })
  .refine(data => data.password === data.passwordRepeat, {
    message: "Пароли не совпадают",
    path: ["passwordRepeat"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const resolver = zodResolver(registerSchema);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver,
  });

  const authStore = useAuthStore();
  const toast = useToastController();
  const [disabled, setDisabled] = useState(false);

  const register = async ({ email, name, password }: RegisterSchema) => {
    try {
      await authStore.register(email, name, password);
      router.push("/");
    } catch (e) {
      if (e instanceof Error) {
        setDisabled(true);
        const message = e.message;
        toast.show("Ошибка", { message });

        setTimeout(() => setDisabled(false), 400);
      }
    }
  };

  return (
    <View flex={1} gap="$6" justify="center" items="center">
      <YStack gap="$2" items="center">
        <H2>Хочешь к нам? Представься</H2>

        <XStack items="center">
          <Text color="$color9">Уже мафиозник? </Text>
          <Text
            color="$blue10"
            fontWeight="600"
            cursor="pointer"
            onPress={() => router.push("/login")}
            hoverStyle={{ color: "$blue11" }}
          >
            Заходи!
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
                  placeholder="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="email"
            />
            <ErrorText>{errors.email?.message}</ErrorText>
          </YStack>

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

          <YStack gap="$1">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Password Repeat"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  type="password"
                  secureTextEntry
                />
              )}
              name="passwordRepeat"
            />
            <ErrorText>{errors.password?.message}</ErrorText>
          </YStack>
        </YStack>

        <Button
          onClick={handleSubmit(register)}
          mt="$4"
          size="$4"
          theme="dark"
          disabled={disabled}
        >
          Зарегистрироваться
        </Button>
      </View>
    </View>
  );
}
