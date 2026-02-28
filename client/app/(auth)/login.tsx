import { Text, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Button, Input, YStack, View } from "tamagui";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(2).max(24),
  password: z.string().min(8).max(128),
});

type Schema = z.infer<typeof schema>;

export default function AuthPage() {
  const resolver = zodResolver(schema);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver,
  });

  const login = (data: Schema) => console.log(data);

  return (
    <View flex={1} justify="center" items="center">
      <Form
        gap="$2"
        onSubmit={() => handleSubmit(login)}
        borderWidth={1}
        items="center"
        justify="center"
        rounded="$4"
        bg="$color2"
        borderColor="$borderColor"
        p="$6"
        m="$6"
      >
        <YStack gap={"$2"}>
          <YStack>
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
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </YStack>

          <YStack>
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
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </YStack>
        </YStack>

        <Form.Trigger asChild>
          <Button>Login</Button>
        </Form.Trigger>
      </Form>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontWeight: 500,
    fontSize: 12,
  },
});
