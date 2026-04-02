import { Button, Column, Separator, Text } from "@/components/ui";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import useActionSheet from "@/hooks/useActionSheet";
import { Message, messageSchema } from "@/schemas/message";
import { MessageFactory } from "@/core/message-factory";
import { MessageHandler } from "@/core/message-handler";
import { useAtom, useAtomValue } from "jotai";
import { userAtom } from "@/atoms/user";
import { socketAtom } from "@/atoms/socket";
import { map } from "rxjs";
import { WebSocketSubject } from "rxjs/webSocket";
import { User } from "@/schemas/user";
import { Game } from "@/schemas/game";
import { asyncRoomMetaAtom } from "@/atoms/room-meta";

export default function GamePage() {
  const showActionSheetWithOptions = useActionSheet();

  const socket = useAtomValue(socketAtom) as WebSocketSubject<string>;
  const user = useAtomValue(userAtom) as User;

  const [roomMeta, setRoomMeta] = useAtom(asyncRoomMetaAtom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [daytime, setDaytime] = useState<"day" | "night">("day");
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const messageHandler = new MessageHandler(message => {
      console.log(message);

      // if (
      //   message.messageType === "Event" &&
      //   message.payload?.text?.includes("DayVote")
      // ) {
      //   startVoting();
      // }

      // if (
      //   message.messageType === "Event" &&
      //   message.payload?.text?.includes("Night")
      // ) {
      //   setDaytime("night");
      // }

      setMessages(oldMessages => [...oldMessages, message]);
    });

    const subscribtion = socket
      .pipe(
        map(input => JSON.parse(input)),
        map(o => messageSchema.parse(o)),
      )
      .subscribe(messageHandler);

    return () => subscribtion.unsubscribe();
  }, []);

  const startVoting = () => {
    const options = game?.players.map(p => p.name)!;

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
            roomId: roomMeta!.roomId,
          });

          console.log(command);
          socket.next(command as any);
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

      <Button onPress={() => {}}>Пример события</Button>
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
