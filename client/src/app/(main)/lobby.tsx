import { useCallback, useEffect, useMemo, useState } from "react";
import { Message, Role } from "@/schemas/message";
import { Row, Ionicons, Text, Button, Column, Spinner } from "@/components/ui";
import { RolePicker } from "@/components/RolePicker";
import { api } from "@/utils/api";
import { MessageFactory } from "@/core/message-factory";
import { useLobby } from "@/providers/lobby-provider";
import { Lobby } from "@/schemas/lobby";
import * as Notifications from "expo-notifications";

export default function LobbyScreen() {
  const { socket, user } = useLobby();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [roles, setRoles] = useState(new Set<Role>());

  const sendEvent = (m: Message) => socket?.next(m as any);

  const participantsWithoutMe = useMemo(
    () => lobby?.participants.filter(p => p.id !== user?.id).map(p => p.name) ?? [],
    [lobby, user],
  );

  const isHost = lobby?.adminId === user?.id;

  useEffect(() => {
    if (!socket) {
      console.error("no socket");
      return;
    }

    const subscription = socket.subscribe({
      next(x) {
        console.log(x);
      },
      error(e) {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error(e);
        }
      },
      complete: () => console.log("Подключение закрыто"),
    });

    return subscription.unsubscribe;
  }, [socket]);

  const startGame = useCallback(() => {
    if (lobby?.maxPlayers === lobby?.participants.length) {
      const command = MessageFactory.command("Lobby", {
        actionType: "Start",
        actorId: user?.id,
        targetId: null,
        roomId: lobby?.id,
        roleSet: [...roles],
      });

      console.log(command);
      sendEvent(command);
    } else {
      console.error("Заполните лобби прежде чем начать игру");
    }
  }, [roles, lobby]);

  const exitLobby = useCallback(() => {
    api
      .post(`lobbies/${lobby?.id}/leave`)
      .then(console.log)
      .then(() => setLobby(null));
  }, [lobby, setLobby]);

  const sendGameStart = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Игра началась!",
        body: "Присоединяйся к мафии.",
        sound: true,
      },
      trigger: null,
    });
  };

  if (lobby === null) {
    return <Spinner />;
  }

  return (
    <Column
      flex={1}
      justify="center"
      items="center"
      gap={12}
      style={{ padding: 12 }}
    >
      <Text size={64} header>
        Ты в лобби
      </Text>

      {participantsWithoutMe.length > 0 ? (
        <Text>Участники: {participantsWithoutMe}</Text>
      ) : (
        <Text>Кроме тебя никого нету</Text>
      )}

      {isHost && <RolePicker roles={roles} setRoles={setRoles} />}

      <Row justify="center" items="center" gap={8}>
        <Ionicons name="people" size={24} />
        <Text>
          {lobby?.participants.length}/{lobby?.maxPlayers}
        </Text>
      </Row>

      <Row gap={12}>
        {isHost && <Button onPress={startGame}>Начать игру</Button>}

        <Button onPress={exitLobby}>Выйти</Button>
      </Row>

      <Button onPress={sendGameStart}>Уведомить</Button>
    </Column>
  );
}
