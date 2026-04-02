import { asyncRoomMetaAtom } from "@/atoms/room-meta";
import { socketAtom } from "@/atoms/socket";
import { userAtom } from "@/atoms/user";
import { RolePicker } from "@/components/RolePicker";
import { SpinnerScreen } from "@/components/SpinnerScreen";
import { Button, Column, Ionicons, Row, Text } from "@/components/ui";
import { MessageFactory } from "@/core/message-factory";
import { Lobby } from "@/schemas/lobby";
import { Message, Role } from "@/schemas/message";
import { User } from "@/schemas/user";
import { api } from "@/utils/api";
import * as Notifications from "expo-notifications";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { map } from "rxjs";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function LobbyPage() {
  const socket = useAtomValue(socketAtom);
  const user = useAtomValue(userAtom) as User;
  const [roomMeta, setRoomMeta] = useAtom(asyncRoomMetaAtom);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [roles, setRoles] = useState(new Set<Role>());

  useEffect(() => {
    roomMeta &&
      api
        .get(`/lobbies/${roomMeta.roomId}`)
        .then(response => response.data)
        .then(setLobby)
        .catch(console.error);
  }, [roomMeta]);

  const sendEvent = (m: Message) => socket?.next(m as any);

  const participantsWithoutMe = useMemo(
    () => lobby?.participants.filter(p => p.id !== user?.id).map(p => p.name) ?? [],
    [lobby, user],
  );

  const isHost = lobby?.adminId === user?.id;

  useEffect(() => {
    if (socket) {
      const subscription = socket
        .pipe(
          map(input => console.log(input.slice(0, 30)) ?? input),
          map(input => JSON.parse(input)),
        )
        .subscribe({
          next(message) {
            if (!lobby) {
              console.log("no lobby");
              return;
            }

            if (message.messageType === "UserConnect") {
              console.log("Обработка UserConnect");
              const id = message.payload!.user.id;

              if (!lobby?.participants.some(p => p.id === id)) {
                const participants = [...lobby?.participants, message.payload!.user];
                setLobby({ ...lobby, participants });
              }
            }

            if (message.messageType === "UserLeave") {
              console.log("Обработка LeaveConnect");
              const id = message.payload!.user.id;
              const participants = lobby.participants.filter(p => p.id !== id);
              setLobby({ ...lobby, participants });
            }
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

      return () => subscription.unsubscribe();
    }
  }, [socket, lobby]);

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
    console.log("exit!!!");
    socket?.complete();
    setRoomMeta(null);
    api.post(`lobbies/${lobby!.id}/leave`).catch(console.error);
  }, [lobby]);

  async function sendPushNotification() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Игра началась",
        body: "🎩 Мафия ждет!",
      },
      trigger: null,
    });
  }

  if (lobby === null) {
    return <SpinnerScreen />;
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

      <Button onPress={sendPushNotification}>Уведомить</Button>
    </Column>
  );
}
