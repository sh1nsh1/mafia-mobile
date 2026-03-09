import type { SliderProps } from "tamagui";
import { Button, H2, Slider, View } from "tamagui";

export default function CreateGameScreen() {
  return (
    <View flex={1} gap="$6" items="center" justify="center" bg="$background" p="$4">
      <H2>Создай лобби</H2>

      <Slider defaultValue={[1]} min={2} max={24} step={1} width={200}>
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        <Slider.Thumb theme="accent" size={20} circular />
      </Slider>

      <Button>Создать</Button>
    </View>
  );
}
