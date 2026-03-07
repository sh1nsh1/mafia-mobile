import { Spinner, View } from "tamagui";

export default function SpinnerPage() {
  return (
    <View flex={1} justify="center" items="center" background="$background">
      <Spinner size="large" color="$red10" />
    </View>
  );
}
