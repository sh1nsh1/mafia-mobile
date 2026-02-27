import { defaultConfig } from "@tamagui/config/v5";
import { createAnimations } from "@tamagui/animations-react-native";
import { createTamagui } from "tamagui";

export const config = createTamagui({
  animations: createAnimations({
    bouncy: {
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    lazy: {
      damping: 18,
      stiffness: 50,
    },
    quick: {
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
  }),
  ...defaultConfig,
});

export default config;

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
