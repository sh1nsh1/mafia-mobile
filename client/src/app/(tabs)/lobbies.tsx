import { ListItem, ScrollView, Text, View, YStack } from "tamagui";

export default function LobbiesScreen() {
  return (
    <View flex={1} items="center" justify="center" bg="$background">
      <Text fontSize={20} color="$color">
        Lobbies List here
      </Text>

      <ScrollView>
        <YStack>
          <ListItem>lobby 1</ListItem>
          <ListItem>2</ListItem>
          <ListItem>3</ListItem>
          <ListItem>4</ListItem>
        </YStack>
      </ScrollView>
    </View>
  );
}
