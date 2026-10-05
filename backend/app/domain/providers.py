from dishka import Scope, provide
from dishka.provider import Provider

from domain.services import VoteConductorService, RoleDistributionService


class DomainProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_role_distribution_service(self) -> RoleDistributionService:
        return RoleDistributionService()

    @provide(scope=Scope.REQUEST)
    def get_vote_conductor_service(self) -> VoteConductorService:
        return VoteConductorService()
