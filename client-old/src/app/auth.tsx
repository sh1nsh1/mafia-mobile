import { View, Text, TextInput, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
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
  const register = (data: Schema) => console.log(data);

  return (
    <View style={styles.view}>
      <>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
      </>

      <>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textInput}
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
      </>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
        <Button title="Login" size="lg" onPress={handleSubmit(login)} />
        <Button title="Register" size="sm" onPress={handleSubmit(register)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    gap: 10,
    backgroundColor: "whitesmoke",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    fontSize: 15,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  errorText: {
    color: "red",
    fontWeight: 500,
    fontSize: 12,
  },
});
