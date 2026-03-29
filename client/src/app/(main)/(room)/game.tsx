import { Button, Column, Separator, Text } from "@/components/ui";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import useActionSheet from "@/hooks/useActionSheet";
import { Message } from "@/schemas/message";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRoom } from "@/hooks/useRoom";
import { useUser } from "@/hooks/useUser";

export default function Game() {
  const { events, sendEvent } = useRoom();
  const currentLobby = useLobbyStore(s => s.currentLobby);
  const { user } = useUser();
  const showActionSheetWithOptions = useActionSheet();

  const [messages, setMessages] = useState<Message[]>([]);
  const [daytime, setDaytime] = useState<"day" | "night">("day");

  useEffect(() => {
    const subscribtion = events.subscribe({
      next: message => {
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
      },
      error: e => {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
      },
      complete: () => console.log("Соединение закрыто"),
    });

    return subscribtion.unsubscribe;
  });

  const startVoting = () => {
    const options = currentLobby?.participants;
    if (!options) return;

    showActionSheetWithOptions(
      {
        title: "Выбирай",
        message: "Кого ты считаешь мафией?",
        options,
      },
      i => {
        if (i) {
          const targetId = options[i];

          const command: Message = {
            messageType: "Command",
            topic: "Game",
            timestamp: new Date().toISOString(),
            payload: {
              actionType: "Vote",
              actorId: user.id,
              targetId,
              roomId: currentLobby.lobbyId,
            },
          };

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
