import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, XStack, YStack, View, H1, Text, styled } from "tamagui";
import * as z from "zod";
import { router } from "expo-router";

export const loginSchema = z.object({
  name: z
    .string("Пиши сюда никнейм")
    .min(2, "Слишком короткое имя")
    .max(24, "Слишком длинное имя"),

  password: z
    .string("Напиши сюда пароль")
    .min(8, "Пароль слабоват")
    .max(128, "Слишком много букав"),
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
    if (data.name === "ivan" && data.password === "qwerty123") {
      router.push("/");
    }
  };

  return (
    <View flex={1} gap="$6" justify="center" items="center">
      <YStack gap="$2">
        <H1>Заходи давай</H1>

        <XStack items="center">
          <Text color="$color9">Еще не мафиозник? </Text>
          <Text
            color="$blue10"
            fontWeight="600"
            cursor="pointer"
            onPress={() => router.push("/register")}
            hoverStyle={{ color: "$blue11" }}
          >
            Присоединяйся
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
                  secureTextEntry
                />
              )}
              name="password"
            />
            <ErrorText>{errors.password?.message}</ErrorText>
          </YStack>
        </YStack>

        <Button onClick={handleSubmit(login)} mt="$4" size="$4" theme="dark">
          Login
        </Button>
      </View>
    </View>
  );
}

const ErrorText = styled(Text, { color: "red", fontWeight: 500, fontSize: 12 });
