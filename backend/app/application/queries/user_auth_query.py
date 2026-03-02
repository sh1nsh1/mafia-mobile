from dataclasses import dataclass


@dataclass
class UserAuthQuery:
    username: str
    password: str
