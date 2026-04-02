import { FC } from "react";
import { Spinner, View } from "./ui";
import { StyleSheet } from "react-native";

export const SpinnerScreen: FC = () => (
  <View style={styles.view}>
    <Spinner size="large" />
  </View>
);

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
