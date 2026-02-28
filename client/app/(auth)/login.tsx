import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, XStack, YStack, View, H2, Text, styled } from "tamagui";
import * as z from "zod";
import { router } from "expo-router";

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

export default function AuthPage() {
  const resolver = zodResolver(loginSchema);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver,
  });

  const login = (data: LoginSchema) => {
    console.log(data);
    if (data.name === "ivan" && data.password === "Qwerty123") {
      router.push("/");
    }
  };

  return (
    <View flex={1} gap="$6" justify="center" items="center">
      <YStack gap="$2" items="center">
        <H2>Заходи давай</H2>

        <XStack items="center">
          <Text color="$color9">Еще не мафиозник? </Text>
          <Text
            color="$blue10"
            fontWeight="600"
            cursor="pointer"
            onPress={() => router.push("/register")}
            hoverStyle={{ color: "$blue11" }}
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

        <Button onClick={handleSubmit(login)} mt="$4" size="$4" theme="dark">
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
