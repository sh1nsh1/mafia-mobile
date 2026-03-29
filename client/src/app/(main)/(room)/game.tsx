import { Button, Column, Separator, Text } from "@/components/ui";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import useActionSheet from "@/hooks/useActionSheet";
import { Message } from "@/schemas/message";
import { useRoom } from "@/hooks/useRoom";
import { useUser } from "@/hooks/useUser";
import { MessageFactory } from "@/core/message-factory";
import { MessageHandler } from "@/core/message-handler";

export default function Game() {
  const showActionSheetWithOptions = useActionSheet();
  const { events, sendEvent, room } = useRoom();
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [daytime, setDaytime] = useState<"day" | "night">("day");

  useEffect(() => {
    const messageHandler = new MessageHandler(message => {
      console.log(message);

      if (
        message.messageType === "Event" &&
        message.payload?.text?.includes("DayVote")
      ) {
        startVoting();
      }

      if (
        message.messageType === "Event" &&
        message.payload?.text?.includes("Night")
      ) {
        setDaytime("night");
      }

      setMessages(oldMessages => [...oldMessages, message]);
    });

    const subscribtion = events.subscribe(messageHandler);

    return subscribtion.unsubscribe;
  });

  const startVoting = () => {
    const options = room.participants;

    showActionSheetWithOptions(
      {
        title: "Выбирай",
        message: "Кого ты считаешь мафией?",
        options,
      },
      i => {
        if (i) {
          const targetId = options[i];

          const command = MessageFactory.command("Game", {
            actionType: "Vote",
            actorId: user.id,
            targetId,
            roomId: room.lobbyId,
          });

          console.log(command);
          sendEvent(command);
        }
      },
    );
  };

  return (
    <Column
      flex={1}
      justify="center"
      items="center"
      gap={12}
      style={{ padding: 12 }}
    >
      <Text>{daytime === "day" ? "День" : "Ночь"}</Text>

      {messages.length > 0 ? (
        <FlatList
          style={{ flex: 1, alignSelf: "stretch" }}
          data={messages}
          keyExtractor={item => item.timestamp}
          renderItem={({ item }) => <ListItem message={item} />}
          ItemSeparatorComponent={() => <Separator />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text>Ждем игровых событий</Text>
      )}

      <Button onPress={startVoting}>Пример события</Button>
    </Column>
  );
}

const ListItem = ({ message }: { message: Message }) => (
  <Column
    flex={1}
    gap={3}
    style={{
      padding: 8,
    }}
  >
    <Text>{message.payload?.text ?? JSON.stringify(message)}</Text>
  </Column>
);
