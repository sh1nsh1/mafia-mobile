import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Separator from "@/components/ui/Separator";
import Text from "@/components/ui/Text";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { map, retry } from "rxjs/operators";
import { Message, messageSchema, useRoomContext } from "./_layout";
import useActionSheet from "@/hooks/useActionSheet";

export default function Game() {
  const { socket } = useRoomContext();
  const showActionSheetWithOptions = useActionSheet();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (socket) {
      const subscribtion = socket.pipe(retry(3), map(String)).subscribe({
        next: message => {
          console.log(message);
          messageSchema
            .parseAsync(JSON.parse(message))
            .then(message => setMessages([...messages, message]))
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

  const onPress = () => {
    const options = ["Вася", "Игрок 2", "Игрок 3"];

    showActionSheetWithOptions(
      {
        title: "Выбирай",
        message: "Кого бьём?",
        options,
      },
      i => {
        if (i) {
          console.log(options[i]);
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
      {messages.length > 0 ? (
        <FlatList
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={item => item.timestamp}
          renderItem={({ item }) => <ListItem message={item} />}
          ItemSeparatorComponent={() => <Separator />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text>Ждем игровых событий</Text>
      )}

      <Button onPress={onPress}>Действие</Button>
    </Column>
  );
}

const ListItem = ({ message }: { message: Message }) => (
  <Column flex={1} gap={3}>
    <Text>{message.payload.toString()}</Text>
  </Column>
);
