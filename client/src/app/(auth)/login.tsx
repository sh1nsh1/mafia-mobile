import { useAuthStore } from "@/stores/auth-store";
import { Button, Column, FormError, Input, Row, View, Text } from "@components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoginSchema, loginSchema } from "@/schemas/login";

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
  const [disabled, setDisabled] = useState(false);

  async function login({ name, password }: LoginSchema) {
    setDisabled(true);
    try {
      await authStore.logIn(name, password, true);
    } catch (e) {
      if (e instanceof Error) {
        console.error("Что-то пошло не так", e.message);
      }
    } finally {
      setDisabled(false);
    }
  }

  useEffect(() => {
    if (authStore.isLoggedIn) {
      router.replace("/logout");
    }
  }, []);

  return (
    <>
      <Column gap={2} items="center">
        <Text size={64} align="center" header style={{ letterSpacing: 2 }}>
          Заходи давай
        </Text>

        <Row items="center">
          <Text size={18} weight={600}>
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
        </Row>
      </Column>

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
        <Column gap={6}>
          <Column gap={3}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input
                  placeholder="Имя"
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
                  placeholder="Пароль"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
                  secureTextEntry
                />
              )}
              name="password"
            />
            <FormError>{errors.password?.message}</FormError>
          </Column>
        </Column>

        <Button onPress={handleSubmit(login)} disabled={disabled}>
          Зайти
        </Button>
      </View>
    </>
  );
}
