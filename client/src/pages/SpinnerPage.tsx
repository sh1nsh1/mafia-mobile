import { StyleSheet, View } from "react-native";
import Spinner from "@components/ui/Spinner";

export default function SpinnerPage() {
  return (
    <View style={styles.view}>
      <Spinner />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
