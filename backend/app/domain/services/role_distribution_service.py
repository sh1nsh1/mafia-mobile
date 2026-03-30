import logging
from random import shuffle
from typing import Annotated

from fastapi import Depends

from domain.enums import RoleEnum
from domain.exceptions import DomainException
from domain.entities.user import User
from domain.entities.player import (
    Role,
    Doctor,
    Player,
    Citizen,
    Sheriff,
    MafiaDon,
    Prostitute,
    MafiaMember,
)


class RoleDistributionService:
    def __init__(self):
        self._logger = logging.getLogger(self.__class__.__name__)
        self._logger.setLevel(30)

    async def create_players_with_roles(
        self, users: list[User], role_set: list[RoleEnum]
    ):
        """
        Получить список Player из списка User, с рапределёнными ролями из списка названий ролей
        """
        self._logger.debug(f"create_players_with_roles ({len(users)}, {role_set}")
        role_names: list[RoleEnum] = await self._get_recomended_role_names_by_list(
            len(users), role_set
        )
        self._logger.debug(role_names)

        roles_to_distribute: list[Role] = await self._create_role_list(role_names)
        self._logger.debug(roles_to_distribute)
        if len(users) != len(roles_to_distribute):
            exc = DomainException(
                "Game",
                f"Количество игроков не соотвествует количеству ролей - {len(users)}",
            )
            self._logger.error(exc)
            raise exc

        shuffle(roles_to_distribute)
        players = []
        for i in range(len(users)):
            players.append(Player(users[i], roles_to_distribute[i], []))

        return players

    async def _get_recomended_role_names_by_list(
        self, player_count, role_set: list[RoleEnum]
    ) -> list[RoleEnum]:
        self._logger.debug("get_recomended_roles_by_list")
        players_remaining = player_count
        required_roles = [RoleEnum.MAFIA_MEMBER, RoleEnum.CITIZEN]
        if any([role not in role_set for role in required_roles]):
            exc = DomainException("Game", "В списке ролей нет необходимых")
            self._logger.error(exc)
            raise exc

        if player_count < 5:
            exc = DomainException(
                "Game",
                f"Количество игроков не соотвествует количеству ролей - {player_count}",
            )
            self._logger.error(exc)
            raise exc
        mafia_number = int(player_count // 3.1)
        self._logger.debug(mafia_number)
        # add mafia members
        result_role_list: list[RoleEnum] = [RoleEnum.MAFIA_MEMBER] * mafia_number
        self._logger.debug(result_role_list)
        players_remaining -= mafia_number
        # replace mafia member by don (if needed)
        if RoleEnum.MAFIA_DON in role_set and mafia_number > 2:
            result_role_list.remove(RoleEnum.MAFIA_MEMBER)
            result_role_list.append(RoleEnum.MAFIA_DON)
        # add sheriff (in needed)
        if RoleEnum.SHERIFF in role_set and players_remaining > 3:
            result_role_list.append(RoleEnum.SHERIFF)
            players_remaining -= 1
        if RoleEnum.DOCTOR in role_set and players_remaining > 2:
            result_role_list.append(RoleEnum.DOCTOR)
            players_remaining -= 1
        if RoleEnum.PROSTITUTE in role_set and players_remaining > 1:
            result_role_list.append(RoleEnum.PROSTITUTE)
            players_remaining -= 1

        result_role_list += [RoleEnum.CITIZEN] * players_remaining
        self._logger.debug(result_role_list)
        return result_role_list

    async def _create_role_list(self, role_name_list: list[RoleEnum]) -> list[Role]:
        self._logger.debug("_create_role_list")

        available_role_names = [role.__name__ for role in Role.__subclasses__()]
        self._logger.debug(available_role_names)
        if any(
            [
                role_name.value not in available_role_names
                for role_name in role_name_list
            ]
        ):
            raise DomainException("Game", "Неизвестная роль в списке")
        roles = []
        for role_name in role_name_list:
            roles.append(await self._create_role_from_name(role_name))
        self._logger.debug(roles)
        return roles

    async def _create_role_from_name(self, role_name: str) -> Role | None:
        self._logger.debug(f"_create_role_from_name ({role_name})")

        match role_name:
            case RoleEnum.CITIZEN.value:
                return Citizen()
            case RoleEnum.MAFIA_MEMBER.value:
                return MafiaMember()
            case RoleEnum.SHERIFF.value:
                return Sheriff()
            case RoleEnum.MAFIA_DON.value:
                return MafiaDon()
            case RoleEnum.PROSTITUTE.value:
                return Prostitute()
            case RoleEnum.DOCTOR.value:
                return Doctor()


RoleDistributionServiceDep = Annotated[RoleDistributionService, Depends()]
