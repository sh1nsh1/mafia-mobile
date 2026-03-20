from typing import Literal


class AppException(Exception):
    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "An unknown error occurred"
        super().__init__(message)


class DomainException(AppException):
    """
    Исключение доменного слоя
    """

    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "An unknown error occurred "
        super().__init__(message)


class TokenException(AppException):
    """
    Исключение при протухании access или refresh токенов
    """

    def __init__(
        self,
        expected_token: Literal["access", "refresh"],
        message: str | None = None,
    ):
        self.expected_token = expected_token
        self.message = message

        if not message:
            message = "An unknow error with token provided"
        super().__init__(message)


class RepoException(Exception):
    """
    Исключение инфраструктурного слоя
    """

    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "An unknown error occurred in Repository"
        super().__init__(message)


class BaseUserVisibleException(Exception):
    """
    Ошибка, которую можно показать в UI
    """

    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "Произошла неизвестная ошибка"
        super().__init__(message)


class PlayerDisabledException(BaseUserVisibleException):
    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "Ваше действие заблокировано Проституткой"
        super().__init__(message)


class VotedDisabledException(BaseUserVisibleException):
    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "Невозможно проголосовать за выбранного игрока"
        super().__init__(message)


class VotedUntargetableException(BaseUserVisibleException):
    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "Запрещено голосовать за этого игрока"
        super().__init__(message)


class PlayerChosenLastNightException(BaseUserVisibleException):
    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "Запрещается выбирать игрока две ночи подряд"
        super().__init__(message)


class LobbyNotFoundException(BaseUserVisibleException):
    def __init__(self, lobby_id: str, message: str | None = None):
        self.lobby_id = lobby_id
        if not message:
            message = f"Lobby {lobby_id} not found"
        self.message = message
        super().__init__(message)


class UserNotFoundException(BaseUserVisibleException):
    def __init__(self, user_id: str, message: str | None = None):
        self.lobby_id = user_id
        if not message:
            message = f"User {user_id} not found"
        self.message = message
        super().__init__(message)


class UserAlredyInLobbyException(BaseUserVisibleException):
    pass


class ActionAlreadyPerformedException(BaseUserVisibleException):
    pass


class LobbyIsFullException(BaseUserVisibleException):
    pass


class UserNotInLobbyException(BaseUserVisibleException):
    pass
