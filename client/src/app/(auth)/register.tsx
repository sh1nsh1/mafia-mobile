import { RegisterSchema, registerSchema } from "@/schemas/register";
import { useAuthStore } from "@/stores/auth-store";
import Button from "@components/ui/Button";
import Column from "@components/ui/Column";
import FormError from "@components/ui/FormError";
import Input from "@components/ui/Input";
import Row from "@components/ui/Row";
import Text from "@components/ui/Text";
import View from "@components/ui/View";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
    setDisabled(true);
    try {
      await authStore.register(email, name, password, true);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    } finally {
      setDisabled(false);
    }
  };

  useEffect(() => {
    if (authStore.isLoggedIn) {
      router.replace("/logout");
    }
  }, []);

  return (
    <>
      <Column gap={6} items="center">
        <Text size={64} align="center" header>
          Хочешь к нам? Представься
        </Text>

        <Row items="center">
          <Text size={18} weight={600}>
            Уже мафиозник?{" "}
          </Text>

          <Link
            href="/login"
            style={{
              fontFamily: "IosevkaCharon",
              fontSize: 18,
              color: "darkred",
              fontWeight: 600,
            }}
          >
            Заходи!
          </Link>
        </Row>
      </Column>

      <View
        gap={6}
        justify="center"
        items="center"
        style={{
          gap: 18,
          borderWidth: 1,
          borderRadius: 4,
          padding: 12,
        }}
      >
        <Column gap={6}>
          <Column gap={3}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Почта"
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

          <Column gap={3}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Повтори пароль"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value ?? ""}
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
