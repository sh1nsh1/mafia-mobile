import { Spinner, View } from "tamagui";

export default function SpinnerPage() {
  return (
    <View flex={1} justify="center" items="center" bg="$background">
      <Spinner size="large" color="$red10" />
    </View>
  );
}
