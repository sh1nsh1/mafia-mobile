from typing import Literal


class AppException(Exception):
    """
    Базовое исключение приложения
    """

    def __init__(self, message: str = "An unknown error occurred"):
        self.message = message
        super().__init__(message)


class DomainException(AppException):
    """
    Исключение доменной логики
    """

    def __init__(
        self,
        topic: Literal["Lobby", "Game"],
        message: str = "Произошла неизвестная ошибка",
    ):
        self.topic = topic
        super().__init__(message)


class TokenException(AppException):
    """
    Исключение access или refresh токенов
    """

    def __init__(
        self,
        expected_token: Literal["access", "refresh"],
        message: str = "An unknow error with token provided",
    ):
        self.expected_token = expected_token
        super().__init__(message)


class RepoException(AppException):
    """
    Исключение инфраструктурного слоя
    """

    def __init__(
        self,
        topic: Literal["Lobby", "Game"],
        message: str = "Неизвестная ошибка в репозитории",
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        self.context_id = context_id
        self.user_id = user_id
        self.topic = topic
        super().__init__(message)


class UnexpectedWebSocketMessageActionType(DomainException):
    def __init__(
        self,
        provided: str | None = None,
        expected: str | None = None,
    ):
        message: str = f"Неверный ActionType: получен {provided}, ожидался {expected}"
        super().__init__("Game", message)


class PlayerDisabledException(DomainException):
    def __init__(
        self,
        message: str = "Ваше действие заблокировано",
    ):
        super().__init__("Game", message)


class VotedDisabledTargetException(DomainException):
    def __init__(
        self,
        message: str = "Невозможно проголосовать за выбранного игрока",
    ):
        super().__init__("Game", message)


class VotedUntargetableException(DomainException):
    def __init__(
        self,
        message: str = "Запрещено голосовать за этого игрока",
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Game", message)


class PlayerChosenTwiceException(DomainException):
    def __init__(
        self,
        message: str = "Запрещается выбирать игрока две ночи подряд",
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Game", message)


class RoomNotFoundException(DomainException):
    def __init__(
        self,
        message: str | None = None,
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        message = message or f"Лобби {context_id} не найдено"
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Lobby", message)


class UserAlredyInLobbyException(DomainException):
    def __init__(
        self,
        message: str | None = None,
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        message = message or f"Пользователь {user_id} уже в лобби {context_id}"
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Lobby", message)


class ActionAlreadyPerformedException(RepoException):
    def __init__(
        self,
        message: str | None = None,
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        message = (
            message
            or f"Конкурентное действие пользователя {user_id} в лобби {context_id}"
        )
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Lobby", message, context_id, user_id)


class LobbyIsFullException(DomainException):
    def __init__(
        self,
        message: str | None = None,
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        message = (
            message
            or f"Пользователь {user_id} не может войти в полное лобби {context_id}"
        )
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Lobby", message)


class UserNotInLobbyException(RepoException):
    def __init__(
        self,
        message: str | None = None,
        context_id: str | None = None,
        user_id: str | None = None,
    ):
        message = message or f"Пользователя {user_id} нет в лобби {context_id}"
        self.context_id = context_id
        self.user_id = user_id
        super().__init__("Lobby", message, context_id, user_id)
