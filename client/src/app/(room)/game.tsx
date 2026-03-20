import Separator from "@/components/ui/Separator";
import { Message, messageSchema, useRoomContext } from "./_layout";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { retry } from "rxjs/operators";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import * as z from "zod";

export default function Game() {
  const { socket } = useRoomContext();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (socket) {
      const subscribtion = socket.pipe(retry(3)).subscribe({
        next: message => {
          console.log(message);
          if (typeof message === "string") {
            messageSchema
              .parseAsync(JSON.parse(message))
              .then(message => setMessages([...messages, message]))
              .catch(console.error);
          }
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

  return (
    <FlatList
      data={messages}
      keyExtractor={item => item.timestamp}
      renderItem={({ item }) => <ListItem message={item} />}
      ItemSeparatorComponent={() => <Separator />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const ListItem = ({ message }: { message: Message }) => (
  <Column flex={1} gap={3}>
    <Text>{message.payload}</Text>
  </Column>
);
