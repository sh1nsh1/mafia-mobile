import asyncio
import logging
from datetime import datetime

from domain.enums import GameStageEnum, WebSocketTopicEnum, WebSocketMessageTypeEnum
from domain.entities.game import Game
from application.services.game_service import GameServiceDep
from application.services.notification_service import NotificationSeviceDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_game_info import WebSocketGameInfo
from infrastructure.websocket.dtos.websocket_game_invite import WebSocketGameInvite


class GameManager:
    """
    Менеджер по управлению активными играми и их хранению
    """

    def __init__(
        self, game_service: GameServiceDep, notification_service: NotificationSeviceDep
    ):
        self._logger = logging.getLogger(self.__class__.__name__)
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
        self._logger.debug(f"start_game {game.id}")
        if game.id in self._acitve_game_loops:
            raise  # TODO

        self._game_update_listeners[game.id] = asyncio.Event()
        self._game_event_listeners[game.id] = asyncio.Queue()

        self._game_update_listeners[game.id].set()

        # создать Task с game loop
        task = asyncio.create_task(self._create_game_loop(game))
        self._acitve_game_loops[game.id] = task

        task.add_done_callback(
            lambda task: asyncio.create_task(self._on_game_loop_done(game.id, task))
        )

    async def emit_update_signal(self, game_id):
        self._logger.debug(f"emit_update_signal {game_id}")
        update_listener = self._game_update_listeners.get(game_id)
        if update_listener:
            update_listener.set()
        else:
            raise  # TODO Exception

    async def set_event(self, game_id: str, event: str):
        self._logger.debug(f"set_event {event} in {game_id}")
        event_listener = self._game_event_listeners.get(game_id)
        self._logger.debug(f"listeners {event_listener} {event}")
        if event_listener:
            await event_listener.put(event)
        else:
            raise Exception(f"can't create event {event}")

    async def _create_game_loop(self, game: Game):
        self._logger.debug(f"_create_game_loop {game.id}")

        """
        Создаёт Game Loop
        """
        try:
            # the game loop
            while not await game.check_finish_condition():
                self._logger.debug(f"game stage: {game.game_stage}")
                update_listener = self._game_update_listeners[game.id]
                try:
                    await asyncio.wait_for(update_listener.wait(), timeout=120)
                    self._logger.debug("update catch")
                    update_listener.clear()

                    game = await self._game_service.get_game_by_id(game.id)
                    match game.game_stage:
                        case GameStageEnum.DAY_INTRO:
                            self._logger.debug(f"case {game.game_stage}")
                            await self.conduct_day_talk_stage(game.id, 15)

                        case GameStageEnum.NIGHT:
                            await self.conduct_night_stage(game.id)

                        case GameStageEnum.DAY_TALK:
                            await self.conduct_day_talk_stage(game.id)

                        case GameStageEnum.DAY_VOTE:
                            await self.conduct_day_vote_stage(game.id)

                except asyncio.TimeoutError as e:
                    self._logger.error(e)

        except asyncio.CancelledError as e:
            self._logger.error(e)
        except Exception as e:
            self._logger.error(e)

    async def _on_game_loop_done(self, game_id: str, task: asyncio.Task):
        """
        Обрабатывает конец игры
        """
        self._logger.debug("_on_game_loop_done")
        try:
            # Проверяем не было ли исключения
            if exc := task.exception():
                self._logger.error(f"Game loop for {game_id} crashed: {exc}")

            # Удаляем из активных игр
            self._acitve_game_loops.pop(game_id, None)
            self._game_update_listeners.pop(game_id, None)
            self._game_event_listeners.pop(game_id, None)

            self._logger.debug(f"Game {game_id} loop finished and cleaned up")
        except Exception as e:
            self._logger.error(f"Error in game cleanup for {game_id}: {e}")

    async def conduct_day_talk_stage(self, game_id: str, talk_timeout: int = 60):
        self._logger.debug(f"conduct_day_talk_stage {game_id}")

        # получить свежее состояние игры
        game = await self._game_service.get_game_by_id(game_id)
        self._logger.debug(game)
        for player in game.players:
            if not player.is_alive:
                continue

            talk_invite_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.INFO,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInvite(
                    text="Ваша очередь говорить", timeout=talk_timeout
                ),
            )
            # отправить приглашение игроку
            await self._notifcation_service.notify_one(
                talk_invite_message,
                game.id,
                player.user.id,
            )
            self._logger.debug(f"invite sent to {player.user.id}")
            event_listener = self._game_event_listeners[game.id]
            try:
                await asyncio.wait_for(event_listener.get(), timeout=talk_timeout)
            except asyncio.TimeoutError:
                self._logger.error("Timeout")
            finally:
                if not event_listener.empty():
                    event_listener.task_done()
                talk_end_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.INFO,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameInfo(
                        text=f"Игрок {player.user.username} закончил говорить"
                    ),
                )
                await self._notifcation_service.notify_all(talk_end_message, game.id)

        next_stage = await game.proceed_next_stage()
        next_stage_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.INFO,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text=f"{next_stage.value}"),
        )
        await self._notifcation_service.notify_all(next_stage_message, game_id)

    async def conduct_night_stage(self, game_id: str, timeout=30):
        self._logger.debug(f"conduct_night_stage {game_id}")
        game = await self._game_service.get_game_by_id(game_id)

    async def conduct_day_vote_stage(self, game_id: str, timeout=20):
        self._logger.debug(f"conduct_day_vote_stage {game_id}")
        pass
