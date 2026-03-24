import { useEffect, useMemo, useState } from "react";
import { retry } from "rxjs/operators";
import { useRoomContext } from "./_layout";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { Message, messageSchema, Role } from "@/schemas/message";
import { Row, Ionicons, Text, Button, Column } from "@/components/ui";
import { RolePicker } from "@/components/RolePicker";

export default function CurrentLobbyScreen() {
  const { currentLobby, exitLobby } = useLobbyStore();
  const user = useAuthStore(s => s.user);
  const { socket } = useRoomContext();
  const router = useRouter();

  const participantsWithoutMe = useMemo(
    () => currentLobby?.participants.filter(p => p !== user?.id),
    [currentLobby, user],
  );

  const isHost = useMemo(() => {
    console.log("ishost", JSON.stringify(currentLobby));
    return currentLobby?.adminId === user?.id;
  }, [currentLobby, user]);

  const [roles, setRoles] = useState(new Set<Role>());

  useEffect(() => {
    if (socket) {
      const subscription = socket.pipe(retry(3)).subscribe({
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

      return () => subscription.unsubscribe();
    }
  }, [socket]);

  const exit = async () => {
    socket?.complete();
    await exitLobby();
    router.replace("/lobbies");
  };

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

    if (socket) {
      console.log(command);
      socket.next(command);
      router.replace("/game");
    } else {
      console.error("УЖАС!!!");
    }
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
            <Text>Участники: {participantsWithoutMe}</Text>
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

            <Button onPress={exit}>Выйти</Button>
          </Row>
        </>
      ) : (
        <Button onPress={() => router.replace("/")}>На главную</Button>
      )}
    </Column>
  );
}
