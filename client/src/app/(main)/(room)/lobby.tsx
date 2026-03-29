import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Message, messageSchema, Role } from "@/schemas/message";
import { Row, Ionicons, Text, Button, Column } from "@/components/ui";
import { RolePicker } from "@/components/RolePicker";
import { useRoom } from "@/hooks/useRoom";
import { useUser } from "@/hooks/useUser";
import { useLobbyStore } from "@/stores/lobby-store";

export default function CurrentLobbyScreen() {
  const { user } = useUser();
  const { events, sendEvent } = useRoom();
  const router = useRouter();
  const currentLobby = useLobbyStore(s => s.currentLobby);

  const participantsWithoutMe = useMemo(
    () => currentLobby?.participants.filter(p => p.id !== user.id),
    [currentLobby, user],
  );

  const isHost = useMemo(
    () => currentLobby?.adminId === user?.id,
    [currentLobby, user],
  );

  const [roles, setRoles] = useState(new Set<Role>());

  useEffect(() => {
    const subscription = events.subscribe({
      next(x) {
        console.log(x);

        const result = messageSchema.safeParse(x);

        if (
          result.success &&
          result.data.messageType === "Command" &&
          result.data.payload?.actionType === "Start"
        ) {
          console.log("Игра началась");
          router.replace("/game");
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

    // return subscription.unsubscribe;
  }, []);

  const startGame = () => {
    const command: Message = {
      messageType: "Command",
      topic: "Lobby",
      timestamp: new Date().toISOString(),
      payload: {
        actionType: "Start",
        actorId: user?.id,
        targetId: null,
        roomId: currentLobby?.lobbyId,
        roleSet: [...roles],
      },
    };

    console.log(command);
    sendEvent(command);
    router.replace("/game");
  };

  return (
    <Column
      flex={1}
      justify="center"
      items="center"
      gap={12}
      style={{ padding: 12 }}
    >
      <Text size={64} header style={{ letterSpacing: 3 }}>
        Ты{currentLobby === null && " не"} в лобби
      </Text>

      <Text>{"lobby admin: " + currentLobby?.adminId}</Text>

      <Text>{"user: " + user?.id}</Text>

      {currentLobby !== null ? (
        <>
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
              {currentLobby.participants.length}/{currentLobby.maxPlayers}
            </Text>
          </Row>

          <Row gap={12}>
            {isHost && <Button onPress={startGame}>Начать игру</Button>}

            <Button onPress={useLobbyStore.getState().exitLobby}>Выйти</Button>
          </Row>
        </>
      ) : (
        <Button onPress={() => router.replace("/")}>На главную</Button>
      )}
    </Column>
  );
}
