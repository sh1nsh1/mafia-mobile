import { ActivityIndicator } from "react-native";
import { pallete } from "@utils/palette";

export default function Spinner() {
  return <ActivityIndicator color={pallete.red} size="large" />;
}
