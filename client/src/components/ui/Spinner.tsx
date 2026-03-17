import Svg, { Circle, Image } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function App() {
  const r = useSharedValue(10);
  r.value = withRepeat(withTiming(30, { duration: 1000 }), -1, true);

  const animatedProps = useAnimatedProps(() => ({
    r: r.value,
  }));

  return <Image href="assets/icons/revolver-cylinder.svg" />;
}
