import { StyleSheet, TextInput } from "react-native";
import { pallete } from "@utils/palette";

export default function Input(props: any) {
  return <TextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {
    color: "lightgray",
    fontSize: 18,
    fontFamily: "IosevkaCharon",
    backgroundColor: pallete.gray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
