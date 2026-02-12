from enum import StrEnum


class TeamEnum(StrEnum):
    # Classic mode
    CITIZEN_TEAM = "CitizenTeam"
    MAFIA_TEAM = "MafiaTeam"

    # TODO Extended mode


class RoleEnum(StrEnum):
    # Sport mode
    CITIZEN = "Citizen"
    MAFIA_MEMBER = "MafiaMember"
    SHERIFF = "Sheriff"

    # Amateur mode
    DOCTOR = "Doctor"
    MAFIA_DON = "MafiaDon"
    PROSTITUTE = "Prostitute"

    # Extended mode
    MANIAC = "Maniac"
    DEPUTY_SHERIFF = "DeputySheriff"
    SHAPESHIFTER = "Shapeshifter"


class GameStateEnum(StrEnum):
    IN_PROGRESS = "In progress"
    PAUSED = "Paused"
    FINISHED = "Finished"


class GameDayTimeEnum(StrEnum):
    DAY = "Day"
    NIGHT = "Night"


class WebSocketMessageTypeEnum(StrEnum):
    COMMAND = "Command"
    ERROR = "Error"
    EVENT = "Event"
    RESPONSE = "Response"


class WebSocketTopicEnum(StrEnum):
    LOBBY = "Lobby"
    GAME = "Game"
    SYSTEM = "System"
