import { useCallback, useEffect, useMemo, useState } from "react";
import { Message, Role } from "@/schemas/message";
import { Row, Ionicons, Text, Button, Column } from "@/components/ui";
import { RolePicker } from "@/components/RolePicker";
import { useAtom, useAtomValue } from "jotai";
import { userAtom } from "@/atoms/user";
import { asyncLobbyAtom } from "@/atoms/lobby";
import { api } from "@/utils/api";
import { socketAtom } from "@/atoms/socket";
import { MessageFactory } from "@/core/message-factory";

export default function CurrentLobbyScreen() {
  const user = useAtomValue(userAtom);
  const [currentLobby, setLobby] = useAtom(asyncLobbyAtom);

  const socket = useAtomValue(socketAtom);

  const sendEvent = (m: Message) => socket?.next(m as any);

  const participantsWithoutMe = useMemo(
    () => currentLobby?.participants.filter(p => p.id !== user?.id),
    [currentLobby, user],
  );

  const isHost = currentLobby?.adminId === user?.id;

  const [roles, setRoles] = useState(new Set<Role>());

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

  const startGame = () => {
    if (currentLobby?.maxPlayers === currentLobby?.participants.length) {
      const command = MessageFactory.command("Lobby", {
        actionType: "Start",
        actorId: user?.id,
        targetId: null,
        roomId: currentLobby?.lobbyId,
        roleSet: [...roles],
      });

      console.log(command);
      sendEvent(command);
    } else {
      console.error("Заполните лобби прежде чем начать игру");
    }
  };

  const exitLobby = useCallback(() => {
    const id = currentLobby?.lobbyId;
    api
      .post(`lobbies/${id}/leave`)
      .then(console.log)
      .then(() => setLobby(null));
  }, [currentLobby, setLobby]);

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

      <Text>{"lobby admin: " + currentLobby?.adminId}</Text>
      <Text>{"user: " + user?.id}</Text>

      {isHost && <Text>Вы являетесь владельцем лобби</Text>}

      {participantsWithoutMe && participantsWithoutMe.length > 0 ? (
        <Text>Участники: {participantsWithoutMe.map(p => p.name)}</Text>
      ) : (
        <Text>Кроме тебя никого нету</Text>
      )}

      {isHost && <RolePicker roles={roles} setRoles={setRoles} />}

      <Row justify="center" items="center" gap={8}>
        <Ionicons name="people" size={24} />
        <Text>
          {currentLobby?.participants.length}/{currentLobby?.maxPlayers}
        </Text>
      </Row>

      <Row gap={12}>
        {isHost && <Button onPress={startGame}>Начать игру</Button>}

        <Button onPress={exitLobby}>Выйти</Button>
      </Row>
    </Column>
  );
}
