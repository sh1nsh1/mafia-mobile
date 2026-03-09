import { Avatar, H2, Paragraph, Separator, XStack, YStack } from "tamagui";

export default function ProfileHeader() {
  return (
    <>
      <XStack p="$4" gap="$2" bg="$background">
        <Avatar circular size="$8">
          <Avatar.Image
            aria-label="Cam"
            src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
          />
          <Avatar.Fallback bg="$red10" />
        </Avatar>
        <YStack>
          <H2>Username</H2>
          <Paragraph size="$2" fontWeight="800">
            Description
          </Paragraph>
          <Paragraph size="$2" fontWeight="800">
            Country: Russia
          </Paragraph>
        </YStack>
      </XStack>
      <Separator borderColor="$borderColor" />
    </>
  );
}
