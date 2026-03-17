import asyncio
from datetime import datetime

from domain.enums import GameStageEnum, WebSocketTopicEnum, WebSocketMessageTypeEnum
from domain.entities.game import Game
from application.services.game_service import GameServiceDep
from application.services.notification_service import NotificationSeviceDep
from infrastructure.websocket.dtos.websocket_info import WebSocketInfo
from infrastructure.websocket.dtos.websocket_invite import WebSocketInvite
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage


class GameManager:
    """
    Менеджер по управлению активными играми и их хранению
    """

    def __init__(
        self, game_service: GameServiceDep, notification_service: NotificationSeviceDep
    ):
        self._game_service = game_service
        self._notifcation_service = notification_service

        self._acitve_game_loops: dict[str, asyncio.Task] = {}
        """game_id -> game_loop (Task)"""

        self._game_update_listeners: dict[str, asyncio.Event] = {}
        """game_id -> game_update_listener (Event)"""

        self._game_event_listeners: dict[str, asyncio.Queue] = {}

    async def start_game(self, game: Game):
        """
        Запускает Game и сохраняет её Game Loop в памяти
        """
        if game.id in self._acitve_game_loops:
            raise  # TODO

        self._game_update_listeners[game.id] = asyncio.Event()
        # создать Task с game loop
        task = asyncio.create_task(self._create_game_loop(game))
        self._acitve_game_loops[game.id] = task

        task.add_done_callback(lambda t: self._on_game_loop_done(t))

    async def emit_update_signal(self, game_id):
        update_listener = self._game_update_listeners.get(game_id)
        if update_listener:
            update_listener.set()
        else:
            raise  # TODO Exception

    async def set_event(self, game_id: str, event: str):
        update_listener = self._game_event_listeners.get(game_id)
        if update_listener:
            await update_listener.put(event)
        raise  # TODO Exception

    async def _create_game_loop(self, game: Game):
        """
        Создаёт Game Loop
        """
        try:
            # the game loop
            while not await game.check_finish_condition():
                update_listener = self._game_update_listeners[game.id]
                try:
                    await asyncio.wait_for(update_listener.wait(), timeout=120)
                    update_listener.clear()

                    match game.game_stage:
                        case GameStageEnum.DAY_INTRO:
                            await self.conduct_day_talk_stage(game.id, 30)

                        case GameStageEnum.NIGHT:
                            await self.conduct_night_stage(game.id)

                        case GameStageEnum.DAY_TALK:
                            await self.conduct_day_talk_stage(game.id)

                        case GameStageEnum.DAY_VOTE:
                            await self.conduct_day_vote_stage(game.id)

                except asyncio.TimeoutError:
                    pass

        except asyncio.CancelledError:
            pass  # TODO Exception
        except Exception as e:
            pass  # TODO Exception

    async def _on_game_loop_done(self, t):
        """
        Обрабатывает конец игры
        """
        # TODO сохранить все события игры в базу данных
        pass

    async def conduct_day_talk_stage(self, game_id: str, talk_timeout: int = 60):
        # получить свежее состояние игры
        game = await self._game_service.get_game_by_id(game_id)
        self._game_event_listeners[game_id] = asyncio.Queue()

        for player in game.players:
            if player.is_alive:
                talk_invite_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.INFO,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketInvite(text="Ваша очередь говорить", timeout=30),
                )
                # отправить приглашение игроку
                await self._notifcation_service.notify_one(
                    talk_invite_message,
                    game.id,
                    player.user.id,
                )
                event_listener = self._game_event_listeners[game.id]
                try:
                    await asyncio.wait_for(event_listener.get(), timeout=talk_timeout)
                except asyncio.TimeoutError:
                    pass
                finally:
                    event_listener.task_done()
                    talk_end_message = WebSocketMessage(
                        message_type=WebSocketMessageTypeEnum.INFO,
                        topic=WebSocketTopicEnum.GAME,
                        timestamp=datetime.now().isoformat(),
                        payload=WebSocketInfo(
                            text=f"Игрок {player.user.username} закончил говорить"
                        ),
                    )
                    await self._notifcation_service.notify_all(
                        talk_end_message, game.id
                    )
        else:
            next_stage = await game.proceed_next_stage()
            next_stage_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.INFO,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketInfo(text=f"{next_stage.value}"),
            )
            await self._notifcation_service.notify_all(next_stage_message, game_id)

    async def conduct_night_stage(self, game_id: str, timeout=30):
        game = await self._game_service.get_game_by_id(game_id)

    async def conduct_day_vote_stage(self, game_id: str, timeout=20):
        pass
