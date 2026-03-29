import { FormField } from "@/components/FormField";
import { RegisterSchema, registerSchema } from "@/schemas/register";
import { useAuthStore } from "@/stores/auth-store";
import { Button, Column, Row, Text, View } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";

export default function RegisterPage() {
  const resolver = zodResolver(registerSchema);
  const formMethods = useForm({ resolver });
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

  return (
    <View flex={1} gap={18} justify="center" items="center">
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

      <View style={styles.formContainer}>
        <Column gap={6}>
          <FormProvider {...formMethods}>
            <FormField<RegisterSchema> name="email" placeholder="Почта" />
            <FormField<RegisterSchema> name="name" placeholder="Имя" />
            <FormField<RegisterSchema>
              name="password"
              placeholder="Пароль"
              secureTextEntry
            />
            <FormField<RegisterSchema>
              name="passwordRepeat"
              placeholder="Повтори пароль"
              secureTextEntry
            />
          </FormProvider>
        </Column>

        <Button onPress={formMethods.handleSubmit(register)} disabled={disabled}>
          Зарегистрироваться
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    gap: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    padding: 12,
  },
});
