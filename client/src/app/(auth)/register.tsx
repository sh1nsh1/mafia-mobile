import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useAuthStore } from "src/stores/auth";
import { useState } from "react";
import FormError from "@components/ui/FormError";
import Column from "@components/ui/Column";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import View from "@components/ui/View";

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

  const [disabled, setDisabled] = useState(false);

  const register = async ({ email, name, password }: RegisterSchema) => {
    try {
      await authStore.register(email, name, password);
      router.push("/");
    } catch (e) {
      if (e instanceof Error) {
        setDisabled(true);

        console.error(e.message);

        setTimeout(() => setDisabled(false), 400);
      }
    }
  };

  if (authStore.isLoggedIn) {
    <Redirect href="/logout" />;
  }

  return (
    <>
      <Column gap={6} items="center">
        <H2 text="center">Хочешь к нам? Представься</H2>

        <XStack items="center">
          <Text color="$color9">Уже мафиозник? </Text>
          <Text
            color="$red10"
            fontWeight="600"
            cursor="pointer"
            onPress={() => router.push("/login")}
            hoverStyle={{ color: "$red11" }}
          >
            Заходи!
          </Text>
        </XStack>
      </Column>

      <View
        gap={6}
        borderWidth={1}
        justify="center"
        items="center"
        rounded="$4"
        bg="$color2"
        borderColor="$borderColor"
        p="$4"
      >
        <Column gap={6}>
          <Column gap={3}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  $max-xs={{ minW: "80%" }}
                  placeholder="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                />
              )}
              name="email"
            />
            <FormError>{errors.email?.message}</FormError>
          </Column>

          <Column gap={3}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  $max-xs={{ minW: "80%" }}
                  placeholder="Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                />
              )}
              name="name"
            />
            <FormError>{errors.name?.message}</FormError>
          </Column>

          <Column gap={3}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  $max-xs={{ minW: "80%" }}
                  placeholder="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  type="password"
                  secureTextEntry
                />
              )}
              name="password"
            />
            <FormError>{errors.password?.message}</FormError>
          </Column>

          <Column gap="$1">
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  $max-xs={{ minW: "80%" }}
                  placeholder="Password Repeat"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  type="password"
                  secureTextEntry
                />
              )}
              name="passwordRepeat"
            />
            <FormError>{errors.password?.message}</FormError>
          </Column>
        </Column>

        <Button onPress={handleSubmit(register)} disabled={disabled}>
          Зарегистрироваться
        </Button>
      </View>
    </>
  );
}
