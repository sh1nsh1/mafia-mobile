import copy
import random
import asyncio
import logging
from uuid import UUID
from datetime import datetime

from domain.enums import (
    RoleEnum,
    GameStageEnum,
    PlayerStatusEnum,
    WebSocketTopicEnum,
    WebSocketMessageTypeEnum,
    WebSocketGameCommandActionTypeEnum,
)
from domain.entities.game import Game
from domain.entities.player import Player
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
        self._notification_service = notification_service

        self._acitve_game_loops: dict[str, asyncio.Task] = {}
        """game_id -> game_loop (Task)"""

        self._game_stage_update_listeners: dict[str, asyncio.Event] = {}
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

        self._game_stage_update_listeners[game.id] = asyncio.Event()
        self._game_event_listeners[game.id] = asyncio.Queue()
        self._game_night_role_aciton_orders[
            game.id
        ] = await self._game_service.get_night_role_action_order()
        self._game_stage_update_listeners[game.id].set()

        # создать Task с game loop
        task = asyncio.create_task(self._create_game_loop(game))
        self._acitve_game_loops[game.id] = task

        task.add_done_callback(
            lambda task: asyncio.create_task(self._on_game_loop_done(game.id, task))
        )

    async def wakeup_game_loop(self, game_id):
        self._logger.debug(f"emit_update_signal {game_id}")
        update_listener = self._game_stage_update_listeners.get(game_id)
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
            await self._notification_service.notify_all(game_start_message, game.id)

            while True:
                game = await self._game_service.get_game_by_id(game.id)
                if await game.check_finish_condition():
                    task = self._acitve_game_loops[game.id]
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        self._logger.debug(f"game {game.id} finish")

                self._logger.debug(f"game stage: {game.game_stage}")
                stage_update_listener = self._game_stage_update_listeners[game.id]
                try:
                    await asyncio.wait_for(
                        stage_update_listener.wait(), timeout=60 * 60
                    )
                    self._logger.debug("catch update")
                    stage_update_listener.clear()

                    match game.game_stage:
                        case GameStageEnum.DAY_INTRO:
                            game = await self._game_service.get_game_by_id(game.id)
                            message = f"Знакомство {game.game_stage.value}"

                            await self.announce_new_stage(game.id, message)

                            await self.show_roles(game)

                            await self.conduct_day_talk_stage(game.id, 30)

                        case GameStageEnum.NIGHT:
                            game = await self._game_service.get_game_by_id(game.id)
                            message = f"Город засыпаает {game.game_stage.value}"

                            await self.announce_new_stage(game.id, message)

                            await self.conduct_night_stage(game.id)

                        case GameStageEnum.DAY_TALK:
                            game = await self._game_service.get_game_by_id(game.id)
                            message = f"День {game.round_count} Общение {game.game_stage.value}"
                            await self.announce_new_stage(game.id, message)

                            await self.conduct_day_talk_stage(game.id)

                        case GameStageEnum.DAY_VOTE:
                            game = await self._game_service.get_game_by_id(game.id)
                            message = f"День {game.round_count} Голосование {game.game_stage.value}"
                            await self.announce_new_stage(game.id, message)

                            await self.conduct_day_vote_stage(game.id)

                except asyncio.TimeoutError as e:
                    self._logger.error(e)
                    task = self._acitve_game_loops[game.id]
                    task.cancel()

        except asyncio.CancelledError as e:
            self._logger.error(e)
            raise
        except Exception as e:
            if not isinstance(e, asyncio.CancelledError):
                self._logger.error(e)
            else:
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
            self._game_stage_update_listeners.pop(game_id, None)
            self._game_event_listeners.pop(game_id, None)

            await self._game_service.delete_game(game_id)

            self._logger.debug(f"Game {game_id} loop finished and cleaned up")
        except Exception as e:
            self._logger.error(f"Error in game cleanup for {game_id}: {e}")

    async def conduct_day_talk_stage(self, game_id: str, talk_timeout: int = 90):
        self._logger.debug(f"conduct_day_talk_stage {game_id}")

        # получить свежее состояние игры
        game = await self._game_service.get_game_by_id(game_id)
        self._logger.debug(
            f"conduct_day_vote_stage: {[f'{player.user.username} {player.is_alive}' for player in game.players]}"
        )

        # определить порядок речей
        talk_order = await self._get_talk_order(game)
        for i in talk_order:
            if not game.players[i].is_alive:
                continue

            self._logger.debug(
                f"talks {game.players[i].user.username} {game.players[i].is_alive}"
            )
            talk_event_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(
                    text=f"Говорит игрок {game.players[i].user.username}",
                ),
            )
            await self._notification_service.notify_all(
                talk_event_message,
                game.id,
            )
            action_request_message = talk_event_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.ACTION_REQUEST,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameActionRequest(
                    text="Ваша очередь говорить", timeout=talk_timeout
                ),
            )
            await self._notification_service.notify_one(
                action_request_message, game.id, game.players[i].user.id
            )
            self._logger.debug(f"invite sent to {game.players[i].user.id}")
            event_listener = self._game_event_listeners[game.id]
            try:
                event = await asyncio.wait_for(
                    event_listener.get(), timeout=talk_timeout
                )
                if event == WebSocketGameCommandActionTypeEnum.LEAVE:
                    await self._game_service.leave_game(
                        game.id, game.players[i].user.id
                    )
                    self._logger.debug(event_listener)
                    event_listener.task_done()

            except asyncio.TimeoutError:
                self._logger.warning(
                    f"Игрок {game.players[i].user.username} закончил говорить (timeout)"
                )
            finally:
                talk_end_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.INFO,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameInfo(
                        text=f"Игрок {game.players[i].user.username} закончил говорить"
                    ),
                )
                await self._notification_service.notify_all(talk_end_message, game.id)

        game = await self._game_service.proceed_next_stage(game)

        await self.wakeup_game_loop(game.id)

    async def conduct_night_stage(self, game_id: str, turn_timeout=120):
        self._logger.debug(f"conduct_night_stage {game_id}")
        game = await self._game_service.get_game_by_id(game_id)

        player_role_groups = await self._game_service.get_night_action_player_groups(
            game
        )
        action_order = self._game_night_role_aciton_orders[game_id]
        for role_name in action_order:
            if role_name not in player_role_groups:
                self._logger.debug(f"{role_name} not in game {game_id}. skiping")
                continue

            # Broadcast message
            role_action_websocket_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(text=f"Ход {role_name.value}"),
            )
            await self._notification_service.notify_all(
                role_action_websocket_message, game_id
            )

            # only actor send message
            player_group = player_role_groups[role_name]
            role_action_websocket_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.ACTION_REQUEST,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameActionRequest(
                    text="Выберите свою цель", timeout=turn_timeout
                ),
            )
            await self._notification_service.notify_many(
                role_action_websocket_message,
                game_id,
                [actor.user.id for actor in player_group],
            )

            event_listener = self._game_event_listeners[game_id]
            try:
                event = await asyncio.wait_for(event_listener.get(), turn_timeout)
                (event_type, extra_data) = event.split("|")

                if (
                    event_type == WebSocketGameCommandActionTypeEnum.LEAVE
                    and extra_data
                ):
                    await self._game_service.leave_game(game.id, UUID(extra_data))

                if extra_data:
                    result_message = WebSocketMessage(
                        message_type=WebSocketMessageTypeEnum.INFO,
                        topic=WebSocketTopicEnum.GAME,
                        timestamp=datetime.now().isoformat(),
                        payload=WebSocketGameInfo(
                            text=f"Результат проверки: {extra_data}"
                        ),
                    )
                    await self._notification_service.notify_many(
                        result_message,
                        game_id,
                        [actor.user.id for actor in player_group],
                    )
                    self._logger.debug(event_listener)
                    event_listener.task_done()

            except asyncio.TimeoutError as e:
                self._logger.debug("RoleAction Timeout")

            finally:
                action_finish_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.EVENT,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameInfo(
                        text=f"Конец хода {role_name}. {role_name} засыпает"
                    ),
                )
                await self._notification_service.notify_all(
                    action_finish_message, game.id
                )

        game = await self._game_service.get_game_by_id(game_id)
        died_players = await game.resolve_night_stage()

        game = await self._game_service.save_game(game)
        if died_players:
            text = f"Прошлой ночью из игры выбыли: {', '.join([player.user.username for player in died_players])}"
        else:
            text = "Этой ночью никто не выбыл"
        died_players_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text=text),
        )
        await self._notification_service.notify_all(died_players_message, game.id)
        died_players_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text=text),
        )

        personal_died_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text="Вы выбыли этой ночью"),
        )
        await self._notification_service.notify_many(
            personal_died_message, game.id, [player.user.id for player in died_players]
        )
        game = await self._game_service.proceed_next_stage(game)

        self._logger.debug(
            f"after night {
                [
                    f'{player.user.username}   {player.is_alive}   {player.status_list}'
                    for player in game.players
                ]
            }"
        )
        await self.wakeup_game_loop(game.id)

    async def conduct_day_vote_stage(
        self,
        game_id: str,
        vote_timeout=90,
        second_stage_candidates: list[Player] | None = None,
    ):
        self._logger.debug(f"conduct_day_vote_stage {game_id}")

        game = await self._game_service.get_game_by_id(game_id)
        self._logger.debug(
            f"conduct_day_vote_stage: {[f'{player.user.username} {player.is_alive}' for player in game.players]}"
        )
        if second_stage_candidates:
            for player in game.players:
                if player.is_alive and player not in second_stage_candidates:
                    player.add_status(PlayerStatusEnum.UNTARGETABLE)

        vote_order = await self._get_talk_order(game)
        for i in vote_order:
            if not game.players[i].is_alive:
                continue

            candidate_id = None

            # отправить всем
            vote_event_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(
                    text=f"Голосует игрок {game.players[i].user.username}",
                ),
            )
            await self._notification_service.notify_all(vote_event_message, game.id)

            # отправить персонально
            action_request_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.ACTION_REQUEST,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameActionRequest(
                    text="Ваша очередь голосовать", timeout=vote_timeout
                ),
            )
            await self._notification_service.notify_one(
                action_request_message, game.id, game.players[i].user.id
            )

            # ождидать голос
            event_listener = self._game_event_listeners[game.id]
            try:
                event = await asyncio.wait_for(
                    event_listener.get(), timeout=vote_timeout
                )
                (event_type, target_id) = event.split("|")
                candidate_id = target_id
                if event_type == WebSocketGameCommandActionTypeEnum.LEAVE:
                    await self._game_service.leave_game(
                        game.id, game.players[i].user.id
                    )

                self._logger.debug(event_listener)
                event_listener.task_done()

            # таймаут хода
            except Exception:
                self._logger.warning(
                    f"Игрок {game.players[i].user.username} закончил голосовать (timeout)"
                )
                players_to_vote = []
                for player in game.players:
                    if (
                        player.is_alive
                        and PlayerStatusEnum.UNTARGETABLE not in player.status_list
                        and player.user.id != game.players[i]
                    ):
                        players_to_vote.append(player)

                random_target = random.choice(players_to_vote)
                await game.process_vote(game.players[i].user.id, random_target.user.id)
                candidate_id = random_target.user.id

            finally:
                if not event_listener.empty():
                    event_listener.task_done()
                text = ""
                for player in game.players:
                    if player.user.id == candidate_id:
                        text = f"Игрок {game.players[i].user.username} проголосовал за {player.user.username}"
                        break
                talk_end_message = WebSocketMessage(
                    message_type=WebSocketMessageTypeEnum.EVENT,
                    topic=WebSocketTopicEnum.GAME,
                    timestamp=datetime.now().isoformat(),
                    payload=WebSocketGameInfo(text=text),
                )
                await self._notification_service.notify_all(talk_end_message, game.id)

        game = await self._game_service.save_game(game)
        most_voted = await self._game_service.get_most_voted_players(game)

        most_voted_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.EVENT,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(
                text=f"Кандидаты на выбытие: {', '.join([player.user.username for player in most_voted])}"
            ),
        )
        await self._notification_service.notify_all(most_voted_message, game.id)

        if len(most_voted) > 1 and not second_stage_candidates:
            await self.announce_new_stage(
                game.id,
                f"День {game.round_count} Голосование {game.game_stage.value} Второй этап",
            )

            # await self._coduct_voting_remake(game, most_voted, vote_timeout)
            await self.conduct_day_vote_stage(game.id, vote_timeout, most_voted)

        elif len(most_voted) > 1 and second_stage_candidates:
            no_lynch_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(
                    text="Город не определился с кандидатом на выбытие"
                ),
            )
            await self._notification_service.notify_all(no_lynch_message, game.id)
        else:
            lynched_player = await game.resole_voting_stage()
            game = await self._game_service.save_game(game)
            broadcase_lynched_player_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(
                    text=f"Игрок {lynched_player.user.username} выбыл из игры"
                ),
            )
            await self._notification_service.notify_all(
                broadcase_lynched_player_message, game.id
            )

            personal_lynched_player_message = WebSocketMessage(
                message_type=WebSocketMessageTypeEnum.EVENT,
                topic=WebSocketTopicEnum.GAME,
                timestamp=datetime.now().isoformat(),
                payload=WebSocketGameInfo(text="Вы выбыли из игры"),
            )
            await self._notification_service.notify_one(
                personal_lynched_player_message, game.id, lynched_player.user.id
            )

        game = await self._game_service.proceed_next_stage(game)

        await self.wakeup_game_loop(game.id)

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
            await self._notification_service.notify_one(
                show_role_message, game.id, player.user.id
            )

    async def announce_new_stage(self, game_id: str, message: str):
        next_stage_message = WebSocketMessage(
            message_type=WebSocketMessageTypeEnum.INFO,
            topic=WebSocketTopicEnum.GAME,
            timestamp=datetime.now().isoformat(),
            payload=WebSocketGameInfo(text=message),
        )
        await self._notification_service.notify_all(next_stage_message, game_id)

    async def _get_talk_order(self, game: Game) -> list[int]:
        self._logger.debug("_get_talk_order")
        default_talk_order = list(range(len(game.players)))
        talk_order = (
            default_talk_order[int(game.round_count) :]
            + default_talk_order[: int(game.round_count)]
        )
        return talk_order
