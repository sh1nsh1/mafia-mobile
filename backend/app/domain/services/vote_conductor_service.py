from typing import Annotated

from fastapi import Depends


class VoteConductorService:
    def __init__(
        self,
    ):
        pass

    async def process_vote_action(self, message):
        pass


VoteConductorServiceDep = Annotated[VoteConductorService, Depends()]
