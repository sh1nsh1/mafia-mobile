from enum import StrEnum


class TeamEnum(StrEnum):
    # Classic mode
    CITIZEN_TEAM = "CitizenTeam"
    MAFIA_TEAM = "MafiaTeam"

    # todo Extended mode

    
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

