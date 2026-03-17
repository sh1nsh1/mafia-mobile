import { StyleSheet, TextInput } from "react-native";

export default function Input(props: any) {
  return <TextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    color: "lightgray",
    fontSize: 18,
    fontFamily: "IosevkaCharon",
    backgroundColor: "black",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
