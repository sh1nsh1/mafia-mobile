import asyncio
import logging
from datetime import datetime

from domain.enums import (
    RoleEnum,
    GameStageEnum,
    WebSocketTopicEnum,
    WebSocketMessageTypeEnum,
)
from domain.entities.game import Game
from application.services.game_service import GameServiceDep
from application.services.notification_service import NotificationSeviceDep
from infrastructure.websocket.dtos.websocket_message import WebSocketMessage
from infrastructure.websocket.dtos.websocket_game_info import WebSocketGameInfo
from infrastructure.websocket.dtos.websocket_game_invite import (
    WebSocketGameActionRequest,
)


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
        """game_id -> game_event_listener (Queue)"""

        self._game_night_role_aciton_orders: dict[str, list[RoleEnum]] = {}
        """game_id -> game_night_role_aciton_order (list[RoleEnum])"""

    async def start_game(self, game: Game):
        """
        Запускает Game и сохраняет её Game Loop в памяти
        """
        self._logger.debug(f"start_game {game.id}")
        if game.id in self._acitve_game_loops:
            raise  # TODO

        self._game_update_listeners[game.id] = asyncio.Event()
        self._game_event_listeners[game.id] = asyncio.Queue()
        self._game_night_role_aciton_orders[
            game.id
        ] = await self._game_service.get_night_role_action_order()
        self._game_update_listeners[game.id].set()

        # создать Task с game loop
        task = asyncio.create_task(self._create_game_loop(game))
        self._acitve_game_loops[game.id] = task

        task.add_done_callback(
            lambda task: asyncio.create_task(self._on_game_loop_done(game.id, task))
        )

    async def wakeup_game_loop(self, game_id):
        self._logger.debug(f"emit_update_signal {game_id}")
        update_listener = self._game_update_listeners.get(game_id)
        if update_listener:
            update_listener.set()
        else:
            exc = Exception(f"can't emit update on {game_id}")
            self._logger.error(exc)
            raise exc

    async def set_event(self, game_id: str, event: str):
        self._logger.debug(f"set_event {event} in {game_id}")
        event_listener = self._game_event_listeners.get(game_id)
        self._logger.debug(f"listeners {event_listener} {event}")
        if event_listener:
            await event_listener.put(event)
        else:
            exc = Exception(f"can't create event {event}")
            self._logger.error(exc)
            raise exc

    async def _create_game_loop(self, game: Game) -> None:
        self._logger.debug(f"_create_game_loop {game.id}")

        """
        Создаёт Game Loop
        """
        try:
            game_start_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(text="Игра началась"),
            )
            await self._notifcation_service.notify_all(game_start_message, game.id)

            while True:
                game = await self._game_service.get_game_by_id(game.id)
                if await game.check_finish_condition():
                    task = self._acitve_game_loops[game.id]
                    task.cancel()
                    try:
                        await task
                    except asyncio.TimeoutError:
                        self._logger.debug(f"game {game.id} finish")

                self._logger.debug(f"game stage: {game.game_stage}")
                update_listener = self._game_update_listeners[game.id]
                try:
                    await asyncio.wait_for(update_listener.wait(), timeout=120)
                    self._logger.debug("catch update")
                    update_listener.clear()

                    match game.game_stage:
                        case GameStageEnum.DAY_INTRO:
                            message = f"Знакомство {game.game_stage.value}"
                            # await self.announce_new_stage(game.id, message)

                            await self.show_roles(game)

                            await self.conduct_day_talk_stage(game.id, 15)

                        case GameStageEnum.NIGHT:
                            message = f"Город засыпаает {game.game_stage.value}"
                            # await self.announce_new_stage(game.id, message)

                            await self.conduct_night_stage(game.id)

                        case GameStageEnum.DAY_TALK:
                            message = f"День {game.round_count} Общение {game.game_stage.value}"
                            # await self.announce_new_stage(game.id, message)

                            await self.show_roles(game)

                            await self.conduct_day_talk_stage(game.id)

                        case GameStageEnum.DAY_VOTE:
                            await self.conduct_day_vote_stage(game.id)

                except asyncio.TimeoutError as e:
                    self._logger.error(e)

        except asyncio.CancelledError as e:
            self._logger.error(e)
            raise
        except Exception as e:
            if not isinstance(e, asyncio.CancelledError):
                self._logger.error(e)
            task = self._acitve_game_loops[game.id]
            task.cancel(e)

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

            await self._game_service.delete_game(game_id)

            self._logger.debug(f"Game {game_id} loop finished and cleaned up")
        except Exception as e:
            self._logger.error(f"Error in game cleanup for {game_id}: {e}")

    async def conduct_day_talk_stage(self, game_id: str, talk_timeout: int = 60):
        self._logger.debug(f"conduct_day_talk_stage {game_id}")

        # получить свежее состояние игры
        game = await self._game_service.get_game_by_id(game_id)
        self._logger.debug(game.players)

        # определить порядок речей
        default_talk_order = list(range(len(game.players)))
        self._logger.debug(default_talk_order[:])
        self._logger.debug(f"round count {game.round_count} {type(game.round_count)}")
        talk_order = (
            default_talk_order[int(game.round_count) :]
            + default_talk_order[: int(game.round_count)]
        )
        self._logger.debug(talk_order)
        for i in talk_order:
            if not game.players[i].is_alive:
                continue

            talk_invite_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.ACTION_REQUEST,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameActionRequest(
                    text=f"Черёд {game.players[i].user.username} говорить",
                    timeout=talk_timeout,
                ),
            )
            # отправить приглашение игроку
            await self._notifcation_service.notify_all(
                talk_invite_message,
                game.id,
            )
            self._logger.debug(f"invite sent to {game.players[i].user.id}")
            event_listener = self._game_event_listeners[game.id]
            try:
                await asyncio.wait_for(event_listener.get(), timeout=talk_timeout)
            except asyncio.TimeoutError:
                self._logger.warning(
                    f"Время игрока {game.players[i].user.username} вышло"
                )
            finally:
                if not event_listener.empty():
                    event_listener.task_done()
                talk_end_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.INFO,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameInfo(
                        text=f"Игрок {game.players[i].user.username} закончил говорить"
                    ),
                )
                await self._notifcation_service.notify_all(talk_end_message, game.id)

        game = await self._game_service.proceed_next_stage(game)

        await self.wakeup_game_loop(game_id)

    async def conduct_night_stage(self, game_id: str, turn_timeout=60):
        self._logger.debug(f"conduct_night_stage {game_id}")
        game = await self._game_service.get_game_by_id(game_id)

        player_role_groups = await self._game_service.get_night_action_order_dict(game)
        action_order = self._game_night_role_aciton_orders[game_id]
        for role_name in action_order:
            if role_name in player_role_groups:
                # Broadcast message
                role_action_websocket_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.INFO,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameInfo(text=f"Ход {role_name.value}"),
                )
                await self._notifcation_service.notify_all(
                    role_action_websocket_message, game_id
                )

                # only actor send message
                player_group = player_role_groups[role_name]
                role_action_websocket_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.INFO,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameActionRequest(
                        text="Выберите свою цель", timeout=turn_timeout
                    ),
                )
                await self._notifcation_service.notify_many(
                    role_action_websocket_message,
                    game_id,
                    [actor.user.id for actor in player_group],
                )

                # wait for
                event_listener = self._game_event_listeners[game_id]
                try:
                    await asyncio.wait_for(event_listener.get(), turn_timeout)
                except asyncio.TimeoutError as e:
                    pass
                finally:
                    action_finish_message = WebSocketMessage(
                        message_type=WebSocketMessageTypeEnum.EVENT,
                        topic=WebSocketTopicEnum.GAME,
                        timestamp=datetime.now().isoformat(),
                        payload=WebSocketGameInfo(
                            text=f"Конец хода {role_name}. {role_name} засыпает"
                        ),
                    )
                    await self._notifcation_service.notify_all(
                        action_finish_message, game.id
                    )

        game = await self._game_service.proceed_next_stage(game)
        next_stage = game.game_stage
        next_stage_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text=f"Город просыпается {next_stage.value}"),
        )
        await self._notifcation_service.notify_all(next_stage_message, game_id)

        await self.wakeup_game_loop(game_id)

    async def conduct_day_vote_stage(self, game_id: str, timeout=20):
        self._logger.debug(f"conduct_day_vote_stage {game_id}")
        pass

    async def show_roles(self, game: Game):
        for player in game.players:
            show_role_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.INFO,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(
                    text=f"Вам досталась роль {player.role.role_name}"
                ),
            )
            await self._notifcation_service.notify_one(
                show_role_message, game.id, player.user.id
            )

    async def announce_new_stage(self, game_id: str, message: str):
        next_stage_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.INFO,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text=message),
        )
        await self._notifcation_service.notify_all(next_stage_message, game_id)
