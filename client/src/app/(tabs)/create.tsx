import { useState } from "react";
import { Button, H2, Slider, View } from "tamagui";

export default function CreateGameScreen() {
  const [value, setValue] = useState([7]);

  return (
    <View flex={1} gap="$6" items="center" justify="center" bg="$background" p="$4">
      <H2>Создай лобби</H2>

      <H2>{value}</H2>

      <Slider
        min={7}
        max={24}
        step={1}
        width={200}
        value={value}
        onValueChange={setValue}
      >
        <Slider.Track>
          <Slider.TrackActive />
        </Slider.Track>
        <Slider.Thumb theme="accent" size={18} circular />
      </Slider>

      <Button>Создать</Button>
    </View>
  );
}
