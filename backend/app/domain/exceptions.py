class DomainException(Exception):
    def __init__(self, message: str | None = None):
        self.message = message
        if not message:
            message = "An unknown error occurred"
        super().__init__(message)


class LobbyNotFoundException(DomainException):
    def __init__(self, lobby_id: str, message: str | None = None):
        self.lobby_id = lobby_id
        if not message:
            message = f"Lobby {lobby_id} not found"
        self.message = message
        super().__init__(message)


class UserNotFoundException(DomainException):
    def __init__(self, user_id: str, message: str | None = None):
        self.lobby_id = user_id
        if not message:
            message = f"User {user_id} not found"
        self.message = message
        super().__init__(message)


class UserAlredyInLobbyException(DomainException):
    pass


class RepoException(DomainException):
    pass


class ActionAlreadyPerformedException(DomainException):
    pass


class LobbyIsFullException(DomainException):
    pass


class UserNotInLobbyException(DomainException):
    pass
