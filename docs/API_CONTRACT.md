Event - сообщение + отрисовка или изменение чего либо
Info - просто сообщение



То, что отправляет клиент серверу

## Веб-сокеты

### Лобби

Начать игру

```json
{
  "messageType":"Command",
  "topic": "Lobby",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Start",
    "actor_id": “user_Id”,
    "target_id": null,
    "room_id": “room_id",
    "role_set": ["MafiaMember", "Citizen", "Doctor"]
  }
}
```

Выпнуть участника

```json
{
  "messageType":"Command",
  "topic": "Lobby",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Kick",
    "actor_id": “user_Id”,
    "target_id": "target_id",
    "room_id": “room_id",
    "role_set": null
  }
}
```

Удалить лобби (хост)

```json
{
  "messageType":"Command",
  "topic": "Lobby",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Delete",
    "actor_id": “user_Id”,
    "target_id": null,
    "room_id": “room_id",
    "role_set": null
  }
}
```

### Игра

Сделать ночной ход

```json
{
  "messageType":"Command",
  "topic": "Game",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "RoleAction",
    "actor_id": <actor_id>,
    "target_id": <target_id>,
    "room_id": <room_id>
  }
}
```

Пропустить речь

```json
{
  "messageType":"Command",
  "topic": "Game",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "TalkEnd",
    "actor_id": <actor_id>,
    "target_id": null,
    "room_id": <room_id>
  }
}
```

Проголосовать

```json
{
  "messageType":"Command",
  "topic": "Game",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Vote",
    "actor_id": <actor_id>,
    "target_id": <target_id>,
    "room_id": <room_id>
  }
}
```

То, что отправляет сервер клиенту


Подключение/отключение от игры/лобби
```json
{
  "messageType": "Event",
  "topic": "Game" | "Lobby",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Connect" | "Leave",
    "actor_id": "<actor_id>",
  }
}
```

голосование за мафию
```json
{
  "messageType": "Event",
  "topic": "Game",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Vote",
  }
}
```

Начало игры
```json
{
  "messageType": "Event",
  "topic": "Game",
  "timestamp": "2026-03-18T14:18:57.306565",
  "payload": {
    "actionType": "Start",
  }
}
```
