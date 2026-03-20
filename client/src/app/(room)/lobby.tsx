import Button from "@/components/ui/Button";
import Column from "@/components/ui/Column";
import Text from "@/components/ui/Text";
import { useEffect, useMemo, useState } from "react";
import { retry } from "rxjs/operators";
import { useRoomContext } from "./_layout";
import { useLobbyStore } from "@/stores/lobby-store";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { Message, messageSchema, RoleSet } from "@/schemas/message";
import Ionicons from "@/components/ui/Ionicons";
import Row from "@/components/ui/Row";
import Switch from "@/components/ui/Switch";

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

  const [hasDoctor, setHasDoctor] = useState(false);
  const [hasProstitute, setHasProstitute] = useState(false);
  const [hasSheriff, setHasSheriff] = useState(false);
  const [hasDon, setHasDon] = useState(false);
  const [hasManiac, setHasManiac] = useState(false);

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
    const roleSet: RoleSet = ["MafiaMember", "Citizen"];

    hasDoctor && roleSet.push("Doctor");
    hasProstitute && roleSet.push("Prostitute");
    hasSheriff && roleSet.push("Sheriff");
    hasDon && roleSet.push("MafiaDon");
    hasManiac && roleSet.push("Maniac");

    const command: Message = {
      messageType: "Command",
      topic: "Lobby",
      timestamp: new Date().toISOString(),
      payload: {
        actionType: "Start",
        actorId: user?.id,
        targetId: null,
        roomId: currentLobby?.lobbyId,
        roleSet,
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

          {isHost && (
            <Column
              style={{
                borderWidth: 1,
                padding: 10,
                borderRadius: 6,
                marginHorizontal: 40,
                alignSelf: "stretch",
              }}
            >
              <Row items="center" gap={10}>
                <Text style={{ flex: 1 }} size={24}>
                  Доктор
                </Text>
                <Switch value={hasDoctor} onValueChange={setHasDoctor} />
              </Row>
              <Row items="center" gap={10}>
                <Text style={{ flex: 1 }} size={24}>
                  Проститутка
                </Text>
                <Switch value={hasProstitute} onValueChange={setHasProstitute} />
              </Row>
              <Row items="center" gap={10}>
                <Text style={{ flex: 1 }} size={24}>
                  Шериф
                </Text>
                <Switch value={hasSheriff} onValueChange={setHasSheriff} />
              </Row>
              <Row items="center" gap={10}>
                <Text style={{ flex: 1 }} size={24}>
                  Дон
                </Text>
                <Switch value={hasDon} onValueChange={setHasDon} />
              </Row>
              <Row items="center" gap={10}>
                <Text style={{ flex: 1 }} size={24}>
                  Маньяк
                </Text>
                <Switch value={hasManiac} onValueChange={setHasManiac} />
              </Row>
            </Column>
          )}

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
