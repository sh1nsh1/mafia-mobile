import asyncio
import json
import uuid
from datetime import datetime
from typing import Optional

import redis.asyncio as redis
from infrastructure.redis.models.lobby_model import LobbyModel


class LobbyRepository:

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        
        # Ключ для хэша лобби
        self.LOBBY_KEY = "lobby:{lobby_id}"
        # Ключ для связи user - lobby
        self.USER_LOBBY_KEY = "user_lobby:{user_id}"
        # Ключ для связи user - game
        self.USER_GAME_KEY = "user_game:{user_id}"
        
        self.LOBBY_TTL = 600 
    
    async def create_lobby(self, 
                          admin_id: str, 
                          max_players: int = 4) -> LobbyModel:
        """
        Создание нового лобби.
        """
        lobby_id = f"lobby_{uuid.uuid4().hex[:8]}"
        
        lobby = LobbyModel(
            id=lobby_id,
            admin_id=admin_id,
            max_players=max_players,
            participant_ids=[admin_id]
        )
        
        # Используем pipeline для атомарного выполнения
        async with self.redis.pipeline(transaction=True) as pipe:
            # Сохраняем данные лобби
            try:
                await pipe.hset(
                    self.LOBBY_KEY.format(lobby_id=lobby.id),
                    mapping=lobby.to_dict()
                )
                
                # Связываем админа с лобби
                await pipe.set(
                    self.USER_LOBBY_KEY.format(user_id=lobby.admin_id),
                    lobby_id,
                    ex=self.LOBBY_TTL
                )
                
                # Устанавливаем TTL для лобби
                await pipe.expire(
                    self.LOBBY_KEY.format(lobby_id=lobby.id), 
                    self.LOBBY_TTL
                )
            
                # Выполняем все команды
                await pipe.execute()
            
            except Exception as e:
                print(e)
                print(lobby.to_dict())

        return lobby
    
    async def get_lobby(self, lobby_id: str) -> Optional[LobbyModel]:
        """
        Получение лобби по ID.
        Именно этот метод используется, когда игрок подключается по ID лобби.
        """
        # Получаем данные лобби из Hash
        lobby_data = await self.redis.hgetall(
            self.LOBBY_KEY.format(lobby_id=lobby_id)
        )
        
        if not lobby_data:
            return None
        
        return LobbyModel.from_redis_data(lobby_data)
    
    async def add_participant(self, lobby_id: str, user_id: str) -> bool:
        """
        Добавление участника в лобби по ID лобби.
        Проверяет, не находится ли  пользователь другом лобби/игре.
        """
        user_lobby_key = self.USER_LOBBY_KEY.format(user_id=user_id)
        
        # Проверяем, не находится ли пользователь уже в каком-то лобби
        existing_lobby = await self.redis.get(user_lobby_key)
        if existing_lobby:
            return False  # Пользователь уже в лобби
        
        # Проверяем, не находится ли пользователь уже в игре
        existing_game = await self.redis.get(
            self.USER_GAME_KEY.format(user_id=user_id)
        )
        if existing_game:
            return False  # Пользователь уже в игре
        
        # Проверяем лобби
        lobby = await self.get_lobby(lobby_id)
        if not lobby or len(lobby.participant_ids) >= lobby.max_players:
            return False
        
        # Используем WATCH для оптимистичной блокировки
        async with self.redis.pipeline(transaction=True) as pipe:
            try:
                # Начинаем наблюдение за ключом пользователя
                await pipe.watch(user_lobby_key)
                
                # Двойная проверка
                exists = await pipe.exists(user_lobby_key)
                if exists:
                    await pipe.unwatch()
                    return False
                
                # Начинаем транзакцию
                await pipe.multi()
                
                # Обновляем список участников в лобби
                new_participants = lobby.participant_ids + [user_id]
                await pipe.hset(
                    self.LOBBY_KEY.format(lobby_id=lobby_id),
                    "participant_ids",
                    json.dumps(new_participants)
                )
                
                # Связываем пользователя с лобби
                await pipe.set(
                    user_lobby_key,
                    lobby_id,
                    ex=self.LOBBY_TTL
                )
                
                # Продлеваем TTL лобби
                await pipe.expire(
                    self.LOBBY_KEY.format(lobby_id=lobby_id),
                    self.LOBBY_TTL
                )
                
                # Выполняем транзакцию
                await pipe.execute()
                return True
                
            except redis.WatchError:
                # Конкурентное изменение - пользователь уже присоединился куда-то
                return False
    
    async def remove_participant(self, lobby_id: str, user_id: str) -> bool:
        """
        Удаление участника из лобби.
        Если удаляется админ, лобби удаляется полностью.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return False
        
        # Если удаляем админа - удаляем все лобби
        if user_id == lobby.admin_id:
            return await self.delete_lobby(lobby_id)
        
        # Удаляем пользователя из списка участников
        new_participants = [pid for pid in lobby.participant_ids if pid != user_id]
        
        async with self.redis.pipeline(transaction=True) as pipe:
            # Обновляем список участников
            await pipe.hset(
                self.LOBBY_KEY.format(lobby_id=lobby_id),
                "participant_ids",
                json.dumps(new_participants)
            )
            
            # Удаляем связь пользователь → лобби
            user_lobby_key = self.USER_LOBBY_KEY.format(user_id=user_id)
            await pipe.delete(user_lobby_key)
            
            # Если лобби пустое после удаления, удаляем его полностью
            if len(new_participants) == 0:
                await pipe.delete(self.LOBBY_KEY.format(lobby_id=lobby_id))
            
            results = await pipe.execute()
            return any(results)
    
    async def delete_lobby(self, lobby_id: str) -> bool:
        """
        Полное удаление лобби.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return False
        
        async with self.redis.pipeline(transaction=True) as pipe:
            # Удаляем данные лобби
            await pipe.delete(self.LOBBY_KEY.format(lobby_id=lobby_id))
            
            # Удаляем связи всех участников с лобби
            for user_id in lobby.participant_ids:
                await pipe.delete(
                    self.USER_LOBBY_KEY.format(user_id=user_id)
                )
            
            results = await pipe.execute()
            return any(results)
    
    async def start_game(self, lobby_id: str) -> Optional[str]:
        """
        Начинает игру: переносит данные из лобби в игру и удаляет лобби.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby or len(lobby.participant_ids) < 2:
            return None
        
        game_id = f"game_{uuid.uuid4().hex[:8]}"
        
        async with self.redis.pipeline(transaction=True) as pipe:
            # Создаем запись игры
            await pipe.hset(
                f"game:{game_id}",
                mapping={
                    "id": game_id,
                    "lobby_id": lobby_id,
                    "admin_id": lobby.admin_id,
                    "players": json.dumps(lobby.participant_ids),
                    "started_at": datetime.now().isoformat(),
                    "status": "active"
                }
            )
            await pipe.expire(f"game:{game_id}", 86400)  # 24 часа для игры
            
            # Переносим связи пользователей в игровой контекст
            for user_id in lobby.participant_ids:
                # Удаляем связь с лобби
                await pipe.delete(
                    self.USER_LOBBY_KEY.format(user_id=user_id)
                )
                # Создаем связь с игрой
                await pipe.set(
                    self.USER_GAME_KEY.format(user_id=user_id),
                    game_id,
                    ex=86400
                )
            
            # Удаляем лобби
            await pipe.delete(self.LOBBY_KEY.format(lobby_id=lobby_id))
            
            await pipe.execute()
        
        # Здесь можно запустить процесс миграции истории в БД
        await self._save_game_to_db(game_id, lobby)
        
        return game_id
    
    async def _save_game_to_db(self, game_id: str, lobby: LobbyModel):
        """
        Асинхронное сохранение игры в БД (история).
        Вызывается после создания игры.
        """
        # Здесь будет логика сохранения в PostgreSQL/MySQL
        # Например, через asyncpg или SQLAlchemy с asyncio
        pass
    
    async def get_user_lobby(self, user_id: str) -> Optional[LobbyModel]:
        """
        Получение лобби, в котором находится пользователь.
        """
        lobby_id = await self.redis.get(
            self.USER_LOBBY_KEY.format(user_id=user_id)
        )
        
        if not lobby_id:
            return None
        
        return await self.get_lobby(lobby_id)
    
    async def get_user_game(self, user_id: str) -> Optional[str]:
        """
        Получение ID игры, в которой находится пользователь.
        """
        return await self.redis.get(
            self.USER_GAME_KEY.format(user_id=user_id)
        )
    
    async def is_user_in_lobby_or_game(self, user_id: str) -> bool:
        """
        Проверка, находится ли пользователь в лобби или игре.
        """
        # Проверяем параллельно оба условия
        in_lobby_task = self.redis.exists(
            self.USER_LOBBY_KEY.format(user_id=user_id)
        )
        in_game_task = self.redis.exists(
            self.USER_GAME_KEY.format(user_id=user_id)
        )
        
        in_lobby, in_game = await asyncio.gather(in_lobby_task, in_game_task)
        
        return bool(in_lobby) or bool(in_game)
    
    async def update_lobby_max_players(self, lobby_id: str, max_players: int) -> bool:
        """
        Обновление максимального количества игроков в лобби.
        """
        lobby = await self.get_lobby(lobby_id)
        if not lobby:
            return False
        
        # Проверяем, что новое значение не меньше текущего количества игроков
        if max_players < len(lobby.participant_ids):
            return False
        
        updated = await self.redis.hset(
            self.LOBBY_KEY.format(lobby_id=lobby_id),
            "max_players",
            str(max_players)
        )
        
        return updated >= 0
    
    async def cleanup_expired_lobbies(self):
        """
        Очистка устаревших лобби.
        Redis автоматически удалит ключи с истекшим TTL,
        но мы можем оставить этот метод для будущих улучшений.
        """
        # В текущей схеме Redis сам удалит ключи с TTL
        # Этот метод может быть полезен для дополнительной логики
        pass
