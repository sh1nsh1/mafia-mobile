import { View, StyleSheet, Text } from "react-native";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text>Работаем!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
});
