import { Button, Column, Separator, Text } from "@/components/ui";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { map, retry } from "rxjs/operators";
import { useRoomContext } from "./_layout";
import useActionSheet from "@/hooks/useActionSheet";
import { Message, messageSchema } from "@/schemas/message";
import { useLobbyStore } from "@/stores/lobby-store";
import { useAuthStore } from "@/stores/auth-store";

export default function Game() {
  const { socket } = useRoomContext();
  const currentLobby = useLobbyStore(s => s.currentLobby);
  const user = useAuthStore(s => s.user);
  const showActionSheetWithOptions = useActionSheet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [daytime, setDaytime] = useState<"day" | "night">("day");

  useEffect(() => {
    if (socket) {
      const subscribtion = socket.pipe(retry(3), map(String)).subscribe({
        next: message => {
          console.log(message);

          messageSchema
            .parseAsync(JSON.parse(message))
            .then(message => {
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

              return message;
            })
            .then(message => setMessages(oldMessages => [...oldMessages, message]))
            .catch(console.error);
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

      return () => subscribtion.unsubscribe();
    }
  }, [socket]);

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
              actorId: user?.id,
              targetId,
              roomId: currentLobby.lobbyId,
            },
          };

          if (socket) {
            console.log(command);
            socket.next(command);
          } else {
            console.error("УЖАС!!!");
          }
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
