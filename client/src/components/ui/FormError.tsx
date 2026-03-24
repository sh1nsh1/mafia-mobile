import { PARAGRAPH_FONT } from "@/utils/theme";
import { StyleSheet, Text } from "react-native";

export function FormError(props: any) {
  return <Text style={styles.text}>{props.children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: "red",
    fontWeight: 500,
    fontSize: 12,
    fontFamily: PARAGRAPH_FONT,
  },
});
