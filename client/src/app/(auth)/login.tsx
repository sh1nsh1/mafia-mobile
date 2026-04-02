import { Button, Column, Row, View, Text } from "@/components/ui";
import { Link } from "@/components/ui/Link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LoginSchema, loginSchema } from "@/schemas/login";
import { FormField } from "@/components/FormField";
import { StyleSheet } from "react-native";
import { tokensAtom } from "@/atoms/jwt-tokens";
import { useAtom } from "jotai";
import { api } from "@/utils/api";
import { jwtTokensSchema } from "@/schemas/jwt-tokens";

export default function LoginPage() {
  const resolver = zodResolver(loginSchema);
  const formMethods = useForm({ resolver });
  const [disabled, setDisabled] = useState(false);

  const [tokens, setTokens] = useAtom(tokensAtom);

  useEffect(() => console.log(tokens), [tokens]);

  async function login({ name, password }: LoginSchema) {
    setDisabled(true);

    api
      .postForm("/user/login", {
        username: name,
        password,
      })
      .then(response => jwtTokensSchema.parseAsync(response.data))
      .then(setTokens)
      .catch(console.error)
      .finally(() => setDisabled(false));
  }

  return (
    <View flex={1} gap={18} justify="center" items="center">
      <Column gap={2} items="center">
        <Text size={64} align="center" header>
          Заходи давай
        </Text>
        <Row items="center">
          <Text size={18} weight={500}>
            Еще не мафиозник?{" "}
          </Text>
          <Link href="/register">Присоединяйся!</Link>
        </Row>
      </Column>

      <View style={styles.formContainer}>
        <Column gap={6}>
          <FormProvider {...formMethods}>
            <FormField<LoginSchema> name="name" placeholder="Имя" />
            <FormField<LoginSchema>
              name="password"
              placeholder="Пароль"
              secureTextEntry
            />
          </FormProvider>
        </Column>

        <Button onPress={formMethods.handleSubmit(login)} disabled={disabled}>
          Зайти
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
