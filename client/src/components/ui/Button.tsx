import { ReactNode } from "react";
import { GestureResponderEvent, Pressable, StyleSheet, Text } from "react-native";
import Row from "./Row";

interface ButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function Button({ children, icon, ...props }: ButtonProps) {
  return (
    <Pressable style={styles.pressable} {...props}>
      <Row items="center" justify="center" gap={3}>
        {icon}
        <Text style={styles.text}>{children}</Text>
      </Row>
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
