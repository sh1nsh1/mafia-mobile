import { GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  children?: any;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <Pressable style={styles.pressable} {...props}>
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "darkgrey",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 18,
    fontFamily: "IosevkaCharon",
    color: "white",
  },
});
